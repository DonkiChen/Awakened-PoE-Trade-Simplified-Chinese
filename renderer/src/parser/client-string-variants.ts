import {
  CLIENT_STRINGS as _$,
  CLIENT_STRINGS_REF as _$REF
} from '@/assets/data'
import type { TranslationDict } from '@/assets/data'

// Only include keys that need parser-side compatibility variants.
// Keeping this list narrow reduces type churn when syncing upstream.
export type ClientStringVariantKey =
  | 'PREFIX_MODIFIER'
  | 'SUFFIX_MODIFIER'
  | 'CRAFTED_PREFIX'
  | 'CRAFTED_SUFFIX'
  | 'IMPLICIT_MODIFIER'
  | 'FRACTURED_PREFIX'
  | 'FRACTURED_SUFFIX'
  | 'CORRUPTED_IMPLICIT'
  | 'FOULBORN_MODIFIER'
  | 'SPLIT'
  | 'UNSCALABLE_VALUE'

// The same key can have different compatibility variants depending on where
// it is matched. For example, `CRAFTED_PREFIX` accepts one set of aliases when
// determining modifier type, and a slightly different set for generation.
export type ClientStringVariantGroup =
  | 'exact'
  | 'modifierType'
  | 'modifierGeneration'
  | 'trailing'

export type ClientStringRegexKey = {
  [K in keyof TranslationDict]: TranslationDict[K] extends RegExp ? K : never
}[keyof TranslationDict]

type ClientStringVariantMap = Partial<Record<ClientStringVariantKey, readonly string[]>>

const EXACT_VARIANTS: ClientStringVariantMap = {
  SPLIT: ['分裂(Split)']
}

const MODIFIER_TYPE_VARIANTS: ClientStringVariantMap = {
  IMPLICIT_MODIFIER: ['基底词缀'],
  FRACTURED_PREFIX: ['分裂 ▲ 前缀词缀', '破碎的 ▲ 前缀词缀'],
  FRACTURED_SUFFIX: ['分裂 ▽ 后缀词缀', '破碎的 ▽ 后缀词缀'],
  CRAFTED_PREFIX: ['大师工艺 ▲ 前缀词缀', '大师级 ▲ 前缀词缀'],
  CRAFTED_SUFFIX: ['大师工艺 ▽ 后缀词缀', '大师级 ▽ 后缀词缀']
}

const MODIFIER_GENERATION_VARIANTS: ClientStringVariantMap = {
  PREFIX_MODIFIER: ['▲ 前缀词缀'],
  SUFFIX_MODIFIER: ['▽ 后缀词缀'],
  FRACTURED_PREFIX: MODIFIER_TYPE_VARIANTS.FRACTURED_PREFIX,
  FRACTURED_SUFFIX: MODIFIER_TYPE_VARIANTS.FRACTURED_SUFFIX,
  CRAFTED_PREFIX: MODIFIER_TYPE_VARIANTS.CRAFTED_PREFIX,
  CRAFTED_SUFFIX: MODIFIER_TYPE_VARIANTS.CRAFTED_SUFFIX
}

const TRAILING_VARIANTS: ClientStringVariantMap = {
  UNSCALABLE_VALUE: [' — 数值不可估量', ' — 数值不可调整']
}

const VARIANT_GROUPS: Record<ClientStringVariantGroup, ClientStringVariantMap> = {
  exact: EXACT_VARIANTS,
  modifierType: MODIFIER_TYPE_VARIANTS,
  modifierGeneration: MODIFIER_GENERATION_VARIANTS,
  trailing: TRAILING_VARIANTS
}

/**
 * Returns the canonical translation value together with any parser-only
 * compatibility variants for the selected group.
 *
 * Example:
 * `getClientStringVariants('SPLIT')`
 * -> `['Split', '分裂(Split)']`
 *
 * `getClientStringVariants('CRAFTED_PREFIX', 'modifierGeneration')`
 * -> `['Master Crafted Prefix Modifier', '▲ 工艺前缀', '大师工艺 ▲ 前缀词缀']`
 */
export function getClientStringVariants (
  key: ClientStringVariantKey,
  group: ClientStringVariantGroup = 'exact'
): readonly string[] {
  return [_$[key], ...(VARIANT_GROUPS[group][key] ?? [])]
}

/**
 * Checks whether `value` matches any canonical or compatibility string for one
 * key or a group of keys.
 *
 * Example:
 * `matchesClientString('SPLIT', 'Split')`
 * -> `true`
 *
 * `matchesClientString(['IMPLICIT_MODIFIER', 'CORRUPTED_IMPLICIT'], '基底词缀', 'modifierType')`
 * -> `true`
 */
export function matchesClientString (
  keyOrKeys: ClientStringVariantKey | readonly ClientStringVariantKey[],
  value: string,
  group: ClientStringVariantGroup = 'exact'
): boolean {
  const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys]
  return keys.some(key => getClientStringVariants(key, group).includes(value))
}

export function execClientStringRegex (
  keyOrKeys: ClientStringRegexKey | readonly ClientStringRegexKey[],
  value: string
): { key: ClientStringRegexKey, match: RegExpExecArray } | null {
  const keys = (Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys]) as readonly ClientStringRegexKey[]

  for (const key of keys) {
    for (const dict of [_$REF, _$] as const) {
      const regex = dict[key]
      regex.lastIndex = 0
      const match = regex.exec(value)
      if (match) {
        return { key, match }
      }
    }
  }

  return null
}

export function testClientStringRegex (
  keyOrKeys: ClientStringRegexKey | readonly ClientStringRegexKey[],
  value: string
): boolean {
  return execClientStringRegex(keyOrKeys, value) !== null
}

/**
 * Removes a trailing canonical or compatibility string and tells the caller
 * whether a suffix was stripped.
 *
 * Example:
 * `stripTrailingClientString('UNSCALABLE_VALUE', 'Nearby Allies have +10% to Critical Strike Multiplier - 数值不可调整')`
 * -> `{ matched: true, value: 'Nearby Allies have +10% to Critical Strike Multiplier' }`
 */
export function stripTrailingClientString (
  key: ClientStringVariantKey,
  value: string,
  group: ClientStringVariantGroup = 'trailing'
): { matched: boolean, value: string } {
  const variants = [...getClientStringVariants(key, group)]
    .sort((left, right) => right.length - left.length)

  for (const variant of variants) {
    if (value.endsWith(variant)) {
      return {
        matched: true,
        value: value.slice(0, -variant.length)
      }
    }
  }

  return { matched: false, value }
}
