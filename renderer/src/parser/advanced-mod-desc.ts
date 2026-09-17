import { CLIENT_STRINGS as _$, CLIENT_STRINGS_REF } from '@/assets/data'
import type { ParsedStat } from './stat-translations'
import { ModifierType, ModifierMechanic } from './modifiers'
import { matchesClientString } from './client-string-variants'

export const SCOURGE_LINE = ' (scourge)'
export const ENCHANT_LINE = ' (enchant)'
export const IMPLICIT_LINE = ' (implicit)'

export interface ParsedModifier {
  info: ModifierInfo
  stats: ParsedStat[]
}

export interface ModifierInfo {
  type: ModifierType
  generation?: 'suffix' | 'prefix'
  mechanic?: ModifierMechanic
  name?: string
  tier?: number
  rank?: number
  tags: string[]
  rollIncr?: number
}

export function parseModInfoLine (line: string): ModifierInfo {
  const [modText, xText2, xText3] = line
    .slice(1, -1)
    .split('\u2014')
    .map(_ => _.trim())

  let type = ModifierType.Explicit
  let generation: ModifierInfo['generation']
  let mechanic: ModifierInfo['mechanic']
  let name: ModifierInfo['name']
  let tier: ModifierInfo['tier']
  let rank: ModifierInfo['rank']

  if (_$.EATER_IMPLICIT.test(modText) || _$.EXARCH_IMPLICIT.test(modText)) {
    const match = modText.match(_$.EATER_IMPLICIT) ?? modText.match(_$.EXARCH_IMPLICIT)!

    type = ModifierType.Implicit
    mechanic = ModifierMechanic.Eldritch

    switch (match.groups!.rank) {
      case _$.ELDRITCH_MOD_R1: rank = 1; break
      case _$.ELDRITCH_MOD_R2: rank = 2; break
      case _$.ELDRITCH_MOD_R3: rank = 3; break
      case _$.ELDRITCH_MOD_R4: rank = 4; break
      case _$.ELDRITCH_MOD_R5: rank = 5; break
      case _$.ELDRITCH_MOD_R6: rank = 6; break
    }
  } else {
    const match = modText.match(_$.MODIFIER_LINE)
    if (!match) {
      throw new Error('Invalid regex for mod info line')
    }

    const typeText = match.groups!.type

    if (matchesClientString(['IMPLICIT_MODIFIER', 'CORRUPTED_IMPLICIT', 'VESTIGIAL_IMPLICIT'], typeText)) {
      type = ModifierType.Implicit
    } else if (matchesClientString(['FRACTURED_PREFIX', 'FRACTURED_SUFFIX'], typeText)) {
      type = ModifierType.Fractured
    } else if (matchesClientString(['CRAFTED_PREFIX', 'CRAFTED_SUFFIX'], typeText)) {
      type = ModifierType.Crafted
    }

    if (matchesClientString(['PREFIX_MODIFIER', 'FRACTURED_PREFIX', 'CRAFTED_PREFIX'], typeText)) {
      generation = 'prefix'
    } else if (matchesClientString(['SUFFIX_MODIFIER', 'FRACTURED_SUFFIX', 'CRAFTED_SUFFIX'], typeText)) {
      generation = 'suffix'
    } else if (matchesClientString('CORRUPTED_IMPLICIT', typeText)) {
      mechanic = ModifierMechanic.Corruption
    } else if (matchesClientString('FOULBORN_MODIFIER', typeText)) {
      mechanic = ModifierMechanic.Foulborn
    } else if (matchesClientString('VESTIGIAL_IMPLICIT', typeText)) {
      mechanic = ModifierMechanic.Vestigial
    }

    name = match.groups!.name ?? undefined
    tier = Number(match.groups!.tier) || undefined
    rank = Number(match.groups!.rank) || undefined
  }

  if (!mechanic && name) {
    mechanic = mechanicFromModName(name)
  }

  let tags: ModifierInfo['tags']
  let rollIncr: ModifierInfo['rollIncr']
  {
    const incrText = (xText3 !== undefined)
      ? xText3
      : (xText2 !== undefined && _$.MODIFIER_INCREASED.test(xText2))
          ? xText2
          : undefined

    const tagsText = (xText2 !== undefined && incrText !== xText2)
      ? xText2
      : undefined

    tags = tagsText ? tagsText.split(', ') : []
    rollIncr = incrText ? Number(_$.MODIFIER_INCREASED.exec(incrText)![1]) : undefined
  }

  return { type, generation, mechanic, name, tier, rank, tags, rollIncr }
}

export function isModInfoLine (line: string): boolean {
  return line.startsWith('{') && line.endsWith('}')
}

interface GroupedModLines {
  modLine: string
  statLines: string[]
}

export function * groupLinesByMod (lines: string[]): Generator<GroupedModLines, void> {
  if (!lines.length || !isModInfoLine(lines[0])) {
    return
  }

  let last: GroupedModLines | undefined
  for (const line of lines) {
    if (!isModInfoLine(line)) {
      last!.statLines.push(line)
    } else {
      if (last) { yield last }
      last = { modLine: line, statLines: [] }
    }
  }
  yield last!
}

export function parseModType (lines: string[]): { modType: ModifierType, lines: string[] } {
  let modType: ModifierType
  // TODO: 2026/03/08 验证一下
  if (lines.some(line => line.endsWith(SCOURGE_LINE))) {
    modType = ModifierType.Scourge
    lines = removeLinesEnding(lines, SCOURGE_LINE)
  } else if (lines.some(line => line.endsWith(ENCHANT_LINE))) {
    modType = ModifierType.Enchant
    lines = removeLinesEnding(lines, ENCHANT_LINE)
  } else if (lines.some(line => line.endsWith(IMPLICIT_LINE))) {
    modType = ModifierType.Implicit
    lines = removeLinesEnding(lines, IMPLICIT_LINE)
  } else {
    throw new Error('Expected to be used only on lines that have modifier type')
  }

  return { modType, lines }
}

function removeLinesEnding (
  lines: readonly string[], ending: string
): string[] {
  return lines.map(line =>
    line.endsWith(ending)
      ? line.slice(0, -ending.length)
      : line
  )
}

// stat values internally stored as ints,
// this is the most common formatter
const DIV_BY_100 = 2

export function applyIncr (mod: ModifierInfo, parsed: ParsedStat): ParsedStat | null {
  const { rollIncr } = mod
  const { roll } = parsed

  if (!rollIncr || !roll || roll.unscalable) {
    return null
  }

  return {
    stat: parsed.stat,
    translation: parsed.translation,
    roll: {
      unscalable: roll.unscalable,
      dp: roll.dp,
      value: incrRoll(roll.value, rollIncr, (roll.dp) ? DIV_BY_100 : 0),
      min: incrRoll(roll.min, rollIncr, (roll.dp) ? DIV_BY_100 : 0),
      max: incrRoll(roll.max, rollIncr, (roll.dp) ? DIV_BY_100 : 0)
    }
  }
}

export function incrRoll (
  value: number,
  p: number,
  dp: number
): number {
  const res = value + (value * p / 100)
  const rounding = Math.pow(10, dp)
  return Math.trunc((res + Number.EPSILON) * rounding) / rounding
}

function mechanicFromModName (name: string): ModifierMechanic | undefined {
  if (_$.SHAPER_MODS.includes(name) || CLIENT_STRINGS_REF.SHAPER_MODS.includes(name)) {
    return ModifierMechanic.Shaper
  } else if (_$.ELDER_MODS.includes(name) || CLIENT_STRINGS_REF.ELDER_MODS.includes(name)) {
    return ModifierMechanic.Elder
  } else if (_$.HUNTER_MODS.includes(name) || CLIENT_STRINGS_REF.HUNTER_MODS.includes(name)) {
    return ModifierMechanic.Hunter
  } else if (_$.WARLORD_MODS.includes(name) || CLIENT_STRINGS_REF.WARLORD_MODS.includes(name)) {
    return ModifierMechanic.Warlord
  } else if (_$.REDEEMER_MODS.includes(name) || CLIENT_STRINGS_REF.REDEEMER_MODS.includes(name)) {
    return ModifierMechanic.Redeemer
  } else if (_$.CRUSADER_MODS.includes(name) || CLIENT_STRINGS_REF.CRUSADER_MODS.includes(name)) {
    return ModifierMechanic.Crusader
  } else if (_$.DELVE_MODS.includes(name) || CLIENT_STRINGS_REF.DELVE_MODS.includes(name)) {
    return ModifierMechanic.Delve
  } else if (_$.VEILED_MODS.includes(name) || CLIENT_STRINGS_REF.VEILED_MODS.includes(name)) {
    return ModifierMechanic.Unveiled
  } else if (_$.INCURSION_MODS.includes(name) || CLIENT_STRINGS_REF.INCURSION_MODS.includes(name)) {
    return ModifierMechanic.Incursion
  } else if (_$.ESSENCE_MODS.includes(name)) {
    return ModifierMechanic.Essence
  } else if (_$.INFAMOUS_MODS.includes(name)) {
    return ModifierMechanic.Infamous
  }
  return undefined
}
