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

export type ClientStringRegexKey = {
  [K in keyof TranslationDict]: TranslationDict[K] extends RegExp ? K : never
}[keyof TranslationDict]

type ClientStringVariantMap = Partial<Record<ClientStringVariantKey, readonly string[]>>

// Parser-only compatibility aliases supplement localized client strings.
const CLIENT_STRING_VARIANTS: ClientStringVariantMap = {
  SPLIT: ['分裂(Split)'],
  PREFIX_MODIFIER: ['▲ 前缀词缀'],
  SUFFIX_MODIFIER: ['▽ 后缀词缀'],
  IMPLICIT_MODIFIER: ['基底词缀'],
  FRACTURED_PREFIX: ['分裂 ▲ 前缀词缀', '破碎的 ▲ 前缀词缀', '分裂 前缀词缀'],
  FRACTURED_SUFFIX: ['分裂 ▽ 后缀词缀', '破碎的 ▽ 后缀词缀', '分裂 后缀词缀'],
  CRAFTED_PREFIX: ['大师工艺 ▲ 前缀词缀', '大师级 ▲ 前缀词缀', '大师 前缀词缀'],
  CRAFTED_SUFFIX: ['大师工艺 ▽ 后缀词缀', '大师级 ▽ 后缀词缀', '大师 后缀词缀'],
  CORRUPTED_IMPLICIT: ['腐化基底词缀'],
  UNSCALABLE_VALUE: [' — 数值不可估量', ' — 数值不可调整']
}

/**
 * Returns the canonical translation value together with any parser-only
 * compatibility variants.
 *
 * Example:
 * `getClientStringVariants('SPLIT')`
 * -> `['Split', '分裂(Split)']`
 *
 * `getClientStringVariants('CRAFTED_PREFIX')`
 * -> `['Master Crafted Prefix Modifier', '▲ 工艺前缀', '大师工艺 ▲ 前缀词缀']`
 */
export function getClientStringVariants (
  key: ClientStringVariantKey
): readonly string[] {
  return [_$[key], ...(CLIENT_STRING_VARIANTS[key] ?? [])]
}

/**
 * Checks whether `value` matches any canonical or compatibility string for one
 * key or a group of keys.
 *
 * Example:
 * `matchesClientString('SPLIT', 'Split')`
 * -> `true`
 *
 * `matchesClientString(['IMPLICIT_MODIFIER', 'CORRUPTED_IMPLICIT'], '基底词缀')`
 * -> `true`
 */
export function matchesClientString (
  keyOrKeys: ClientStringVariantKey | readonly ClientStringVariantKey[],
  value: string
): boolean {
  const keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys]
  return keys.some(key => getClientStringVariants(key).includes(value))
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
  value: string
): { matched: boolean, value: string } {
  const variants = [...getClientStringVariants(key)]
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
