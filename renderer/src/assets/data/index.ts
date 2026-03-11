import fnv1a from '@sindresorhus/fnv1a'
import type { BaseType, DropEntry, Stat, StatOrGroup, StatMatcher, TranslationDict } from './interfaces'

export * from './interfaces'

export interface StaticDataPayload {
  clientStringsRef: TranslationDict
  itemDrop: DropEntry[]
  appPatrons: Array<{ from: string, months: number, style: number }>
}

export interface LanguageDataPayload {
  clientStrings: TranslationDict
  itemsNdjson: string
  itemsNameIndex: Uint32Array
  itemsRefIndex: Uint32Array
  statsNdjson: string
  statsRefIndex: Uint32Array
  statsMatcherIndex: Uint32Array
}

export let ITEM_DROP: DropEntry[]
export let CLIENT_STRINGS: TranslationDict
export let CLIENT_STRINGS_REF: TranslationDict
export let APP_PATRONS: Array<{ from: string, months: number, style: number }>

export let ITEM_BY_TRANSLATED = (ns: BaseType['namespace'], name: string): BaseType[] | undefined => undefined
export let ITEM_BY_REF = (ns: BaseType['namespace'], name: string): BaseType[] | undefined => undefined
export let ITEM_BY_REF_OR_TRANSLATED = (ns: BaseType['namespace'], name: string): BaseType[] | undefined => undefined
export let ITEMS_ITERATOR = function * (includes: string, andIncludes?: string[]): Generator<BaseType> {}

export let ALTQ_GEM_NAMES = function * (): Generator<string> {}
export let REPLICA_UNIQUE_NAMES = function * (): Generator<string> {}

export let STAT_BY_MATCH_STR = (name: string): { matcher: StatMatcher, stat: Stat } | undefined => undefined
export let STAT_BY_MATCH_STR_V2 = (name: string): StatOrGroup | undefined => undefined
export let STAT_BY_REF_V2 = (name: string): StatOrGroup | undefined => undefined
export let STATS_ITERATOR = function * (includes: string, andIncludes?: string[]): Generator<Stat> {}

function dataBinarySearch (data: Uint32Array, value: number, rowOffset: number, rowSize: number) {
  let left = 0
  let right = (data.length / rowSize) - 1
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    const midValue = data[(mid * rowSize) + rowOffset]
    if (midValue < value) {
      left = mid + 1
    } else if (midValue > value) {
      right = mid - 1
    } else {
      return mid
    }
  }
  return -1
}

function ndjsonFindLines<T> (ndjson: string) {
  // it's preferable that passed `searchString` has good entropy
  return function * (searchString: string, andIncludes: string[] = []): Generator<T> {
    let start = 0
    while (start !== ndjson.length) {
      const matchPos = ndjson.indexOf(searchString, start)
      if (matchPos === -1) break
      // works for first line too (-1 + 1 = 0)
      start = ndjson.lastIndexOf('\n', matchPos) + 1
      const end = ndjson.indexOf('\n', matchPos)
      const jsonLine = ndjson.slice(start, end)
      if (andIncludes.every(str => jsonLine.includes(str))) {
        yield JSON.parse(jsonLine) as T
      }
      start = end + 1
    }
  }
}

function itemNamesFromLines (items: Generator<BaseType>) {
  let cached = ''
  return function * (): Generator<string> {
    if (!cached.length) {
      for (const item of items) {
        cached += (item.name + '\n')
      }
    }

    let start = 0
    while (start !== cached.length) {
      const end = cached.indexOf('\n', start)
      yield cached.slice(start, end)
      start = end + 1
    }
  }
}

function loadItems (data: Pick<LanguageDataPayload, 'itemsNdjson' | 'itemsNameIndex' | 'itemsRefIndex'>) {
  const ndjson = data.itemsNdjson
  const indexNames = data.itemsNameIndex
  const indexRefNames = data.itemsRefIndex
  const INDEX_WIDTH = 2

  function commonFind (index: Uint32Array, prop: 'name' | 'refName') {
    return function (ns: BaseType['namespace'], name: string): BaseType[] | undefined {
      let start = dataBinarySearch(index, Number(fnv1a(`${ns}::${name}`, { size: 32 })), 0, INDEX_WIDTH)
      if (start === -1) return undefined
      start = index[start * INDEX_WIDTH + 1]
      const out: BaseType[] = []
      while (start !== ndjson.length) {
        const end = ndjson.indexOf('\n', start)
        const record = JSON.parse(ndjson.slice(start, end)) as BaseType
        if (record.namespace === ns && record[prop] === name) {
          out.push(record)
          if (!record.disc && !record.unique) break
        } else { break }
        start = end + 1
      }
      return out
    }
  }

  ITEM_BY_TRANSLATED = commonFind(indexNames, 'name')
  ITEM_BY_REF = commonFind(indexRefNames, 'refName')
  ITEM_BY_REF_OR_TRANSLATED = (ns: BaseType['namespace'], name: string): BaseType[] | undefined => ITEM_BY_REF(ns, name) ?? ITEM_BY_TRANSLATED(ns, name)
  ITEMS_ITERATOR = ndjsonFindLines<BaseType>(ndjson)
  ALTQ_GEM_NAMES = itemNamesFromLines(ITEMS_ITERATOR('altQuality":["Anomalous'))
  REPLICA_UNIQUE_NAMES = itemNamesFromLines(ITEMS_ITERATOR('refName":"Replica'))
}

function loadStats (data: Pick<LanguageDataPayload, 'statsNdjson' | 'statsRefIndex' | 'statsMatcherIndex'>) {
  const ndjson = data.statsNdjson
  const indexRef = data.statsRefIndex
  const indexMatcher = data.statsMatcherIndex
  const INDEX_WIDTH = 2

  STAT_BY_REF_V2 = function (ref: string) {
    let start = dataBinarySearch(indexRef, Number(fnv1a(ref, { size: 32 })), 0, INDEX_WIDTH)
    if (start === -1) return undefined
    start = indexRef[start * INDEX_WIDTH + 1]
    const end = ndjson.indexOf('\n', start)
    return JSON.parse(ndjson.slice(start, end))
  }

  STAT_BY_MATCH_STR_V2 = function (matchStr: string) {
    let start = dataBinarySearch(indexMatcher, Number(fnv1a(matchStr, { size: 32 })), 0, INDEX_WIDTH)
    if (start === -1) return undefined
    start = indexMatcher[start * INDEX_WIDTH + 1]
    const end = ndjson.indexOf('\n', start)
    const statOrGroup = JSON.parse(ndjson.slice(start, end)) as StatOrGroup
    const stats = ('stats' in statOrGroup) ? statOrGroup.stats : [statOrGroup]
    if (!stats.some(stat =>
      stat.matchers.some(m => m.string === matchStr || m.advanced === matchStr))
    ) {
      // console.log('fnv1a32 collision')
      return undefined
    }
    return statOrGroup
  }

  STAT_BY_MATCH_STR = function (matchStr: string) {
    const statOrGroup = STAT_BY_MATCH_STR_V2(matchStr)
    if (!statOrGroup) return undefined

    let stat: Stat
    if ('stats' in statOrGroup) {
      const stats = statOrGroup.stats.filter(stat =>
        stat.matchers.some(m => m.string === matchStr || m.advanced === matchStr))
      if (stats.length !== 1) return undefined
      stat = stats[0]
    } else {
      stat = statOrGroup
    }
    const matcher = stat.matchers.find(m =>
      m.string === matchStr || m.advanced === matchStr)!
    return { stat, matcher }
  }

  const _STATS_ITERATOR = ndjsonFindLines<StatOrGroup>(ndjson)

  STATS_ITERATOR = function * (includes, andIncludes) {
    for (const statOrGroup of _STATS_ITERATOR(includes, andIncludes)) {
      if ('stats' in statOrGroup) {
        for (const stat of statOrGroup.stats) {
          yield stat
        }
      } else {
        yield statOrGroup
      }
    }
  }
}

async function fetchUint32Array (url: string) {
  const response = await fetch(url)
  return new Uint32Array(await response.arrayBuffer())
}

async function importClientStrings (url: string) {
  const module = await import(/* @vite-ignore */url)
  return module.default as TranslationDict
}

export function hydrateStaticData (data: StaticDataPayload) {
  CLIENT_STRINGS_REF = data.clientStringsRef
  ITEM_DROP = data.itemDrop
  APP_PATRONS = data.appPatrons
}

export function hydrateLanguageData (data: LanguageDataPayload) {
  CLIENT_STRINGS = data.clientStrings
  loadItems(data)
  loadStats(data)
}

export function finalizeDataInit (lang: string) {
  for (const text of DELAYED_STAT_VALIDATION) {
    const statOrGroup = STAT_BY_REF_V2(text)
    if (!statOrGroup) {
      throw new Error(`Cannot find stat: ${text}`)
    }
    if (
      'stats' in statOrGroup &&
      // other languages are allowed to have unrelated stats grouped with our `ref`
      lang === 'en' &&
      statOrGroup.stats.some(stat => stat.ref !== text)
    ) {
      // TODO implement `StatCheck` if this causes error later.
      // This check cannot be delegated to ndjson creation time because only
      // a subset of groups need to adhere to it (that are seen in `stat()`).
      throw new Error(`Some stats have different ref text: ${text}`)
    }
  }
  DELAYED_STAT_VALIDATION.clear()
}

export function pseudoStatByRef (ref: string): Stat | undefined {
  const statOrGroup = STAT_BY_REF_V2(ref)
  if (statOrGroup != null && 'stats' in statOrGroup) {
    return statOrGroup.stats.find(stat =>
      stat.ref === ref &&
      'pseudo' in stat.trade.ids)
  }
  return statOrGroup
}

// assertion, to avoid regressions in stats.ndjson
const DELAYED_STAT_VALIDATION = new Set<string>()
// type StatCheck =
//   | 'ref-match' // text will be used for comparison with other stat refs
//   | 'pseudo-find' // text will only be used in `pseudoStatByRef`
export function stat (text: string) {
  DELAYED_STAT_VALIDATION.add(text)
  return text
}

export async function init (lang: string) {
  hydrateStaticData({
    clientStringsRef: await importClientStrings(`${import.meta.env.BASE_URL}data/en/client_strings.js`),
    itemDrop: await (await fetch(`${import.meta.env.BASE_URL}data/item-drop.json`)).json(),
    appPatrons: await (await fetch(`${import.meta.env.BASE_URL}data/patrons.json`)).json()
  })

  await loadForLang(lang)
  finalizeDataInit(lang)
}

export async function loadForLang (lang: string) {
  hydrateLanguageData({
    clientStrings: await importClientStrings(`${import.meta.env.BASE_URL}data/${lang}/client_strings.js`),
    itemsNdjson: await (await fetch(`${import.meta.env.BASE_URL}data/${lang}/items.ndjson`)).text(),
    itemsNameIndex: await fetchUint32Array(`${import.meta.env.BASE_URL}data/${lang}/items-name.index.bin`),
    itemsRefIndex: await fetchUint32Array(`${import.meta.env.BASE_URL}data/${lang}/items-ref.index.bin`),
    statsNdjson: await (await fetch(`${import.meta.env.BASE_URL}data/${lang}/stats.ndjson`)).text(),
    statsRefIndex: await fetchUint32Array(`${import.meta.env.BASE_URL}data/${lang}/stats-ref.index.bin`),
    statsMatcherIndex: await fetchUint32Array(`${import.meta.env.BASE_URL}data/${lang}/stats-matcher.index.bin`)
  })
}
