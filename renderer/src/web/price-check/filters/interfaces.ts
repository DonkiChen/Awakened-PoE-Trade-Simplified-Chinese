import type { ItemInfluence, ItemCategory } from '@/parser'
import type { StatCalculated } from '@/parser/modifiers'
import type { ParsedItem } from '@/parser/ParsedItem'

export interface FilterPreset {
  id: string
  filters: ItemFilters
  stats: StatFilter[]
}

interface SearchFilter {
  name?: string
  nameTrade?: string
  baseType?: string
  baseTypeTrade?: string
  category?: ItemCategory
}

export interface ItemFilters {
  searchExact: SearchFilter
  searchRelaxed?: SearchFilter & { disabled: boolean }
  discriminator?: {
    value?: string
    trade: string
  }
  rarity?: {
    value: string
  }
  linkedSockets?: FilterNumeric
  whiteSockets?: FilterNumeric
  redSockets?: FilterNumeric
  greenSockets?: FilterNumeric
  blueSockets?: FilterNumeric
  corrupted?: {
    value: boolean
    exact?: boolean
  }
  fractured?: {
    value: boolean
  }
  mirrored?: {
    disabled: boolean
  }
  memoryStrands?: FilterNumeric
  storedExperience?: FilterNumeric
  foil?: {
    disabled: boolean
  }
  influences?: Array<{
    value: ItemInfluence
    disabled: boolean
  }>
  quality?: FilterNumeric
  gemLevel?: FilterNumeric
  mapTier?: FilterNumeric
  mapReward?: string
  mapBlighted?: {
    value: NonNullable<ParsedItem['mapBlighted']>
  }
  itemLevel?: FilterNumeric
  stackSize?: FilterNumeric
  unidentified?: {
    value: true
    disabled: boolean
  }
  veiled?: {
    statRefs: string[]
    disabled: boolean
  }
  areaLevel?: FilterNumeric
  heistWingsRevealed?: FilterNumeric
  sentinelCharge?: FilterNumeric
  trade: {
    offline: boolean
    onlineInLeague: boolean
    listed: string | undefined
    currency: string | undefined
    league: string
    collapseListings: 'api' | 'app'
    saleType?: SaleType
  }
}

export enum SaleType {
  ANY = 'any',
  /**
   * 精确一口价
   */
  STRICT_AUTO_BUYOUT = 'strict_auto_buyout',
  /**
   * 一口价
   */
  AUTO_BUYOUT = 'auto_buyout',
  /**
   * 询价
   */
  PRICED = 'priced',
  /**
   * 备注
   */
  PRICED_WITH_INFO = 'priced_with_info',
  /**
   * 未标价
   */
  UNPRICED = 'unpriced'
}

export interface FilterNumeric {
  value: number
  max?: number | undefined
  disabled: boolean
}

export interface StatFilter {
  tradeId: string[]
  statRef: string
  text: string
  tag: FilterTag
  oils?: string[]
  sources: StatCalculated['sources']
  roll?: {
    value: number
    min: number | '' | undefined // NOTE: mutable in UI
    max: number | '' | undefined // NOTE: mutable in UI
    default: { min: number, max: number }
    bounds?: { min: number, max: number }
    tradeInvert?: boolean
    dp: boolean
    isNegated: boolean
    goodness?: number
  }
  option?: {
    value: number // NOTE: mutable in UI
  }
  hidden?: string
  disabled: boolean // NOTE: mutable in UI
}

export const INTERNAL_TRADE_IDS = [
  'item.base_percentile',
  'item.armour',
  'item.evasion_rating',
  'item.energy_shield',
  'item.ward',
  'item.block',
  'item.total_dps',
  'item.physical_dps',
  'item.elemental_dps',
  'item.crit',
  'item.aps',
  'item.has_empty_modifier'
] as const

export type InternalTradeId = typeof INTERNAL_TRADE_IDS[number]

export enum ItemHasEmptyModifier {
  Any = 0,
  Prefix = 1,
  Suffix = 2
}

export enum FilterTag {
  Pseudo = 'pseudo',
  Explicit = 'explicit',
  Implicit = 'implicit',
  Crafted = 'crafted',
  Enchant = 'enchant',
  Scourge = 'scourge',
  Fractured = 'fractured',
  Corrupted = 'corrupted',
  Synthesised = 'synthesised',
  Eldritch = 'eldritch',
  Variant = 'variant',
  Property = 'property',
  Shaper = 'explicit-shaper',
  Elder = 'explicit-elder',
  Crusader = 'explicit-crusader',
  Hunter = 'explicit-hunter',
  Redeemer = 'explicit-redeemer',
  Warlord = 'explicit-warlord',
  Delve = 'explicit-delve',
  Unveiled = 'explicit-veiled',
  Incursion = 'explicit-incursion'
}
