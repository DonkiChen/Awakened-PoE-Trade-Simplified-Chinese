import { deepStrictEqual, strictEqual } from 'node:assert'
import { readFile } from 'node:fs/promises'
import { CLIENT_STRINGS } from '../src/assets/data'
import { initForNode } from '../src/assets/data/node'
import { parseClipboard, type ParsedItem } from '../src/parser'
import { parseModInfoLine } from '../src/parser/advanced-mod-desc'
import { ModifierMechanic, type ModifierType } from '../src/parser/modifiers'
import { createExactStatFilters, initUiModFilters } from '../src/web/price-check/filters/create-stat-filters'

interface ItemFixture {
  content: string
  name?: string
  expected?: StatExpectation | StatExpectation[]
}

interface StatExpectation {
  statCount?: number
  statRef: string
  type?: ModifierType
  tradeIds?: string[]
  roll?: { value: number, min?: number, max?: number, unscalable?: boolean }
  explicitTradeIds?: string[]
  filter?: { mode: 'bulk' | 'ui', tradeIds: string[], text?: string }
}

interface MechanicFixture {
  modifierHeader: string
  mechanic: keyof typeof ModifierMechanic
}

interface TestFailure {
  itemNumber: number
  itemName: string
  message: string
}

function itemNameFromText (text: string, itemNumber: number) {
  const lines = text.split(/\r?\n/)
  const rarityLine = lines.findIndex(line => line.startsWith(CLIENT_STRINGS.RARITY))
  return lines[rarityLine + 1]?.trim() || `item ${itemNumber}`
}

function parseForAffixRecognition (content: string) {
  const parsed = parseClipboard(content.trim())
  if (parsed.isOk() || parsed.error !== 'item.unknown') {
    return { parsed, usedBaseTypeFallback: false }
  }

  // Some fixtures use unique names missing from the item index. For this
  // test, retry those as rare items so recognition is still tested against
  // the original modifier text and the known base type, without testing the
  // unique-item catalog.
  const lines = content.split(/\r?\n/)
  const rarityLine = lines.findIndex(line => line.startsWith(CLIENT_STRINGS.RARITY))
  if (rarityLine === -1 ||
      lines[rarityLine].slice(CLIENT_STRINGS.RARITY.length) !== CLIENT_STRINGS.RARITY_UNIQUE) {
    return { parsed, usedBaseTypeFallback: false }
  }

  lines[rarityLine] = CLIENT_STRINGS.RARITY + CLIENT_STRINGS.RARITY_RARE
  return {
    parsed: parseClipboard(lines.join('\n').trim()),
    usedBaseTypeFallback: true
  }
}

function assertExpected (item: ParsedItem, expected: StatExpectation) {
  const { statCount, statRef, type, tradeIds, roll, explicitTradeIds, filter } = expected
  if (statCount !== undefined) {
    strictEqual(item.statsByType.length, statCount, 'stat count')
  }
  const stat = item.statsByType.find(calc => calc.stat.ref === statRef && (type === undefined || calc.type === type))
  const actualRoll = stat?.sources[0]?.stat.roll
  if (roll) {
    strictEqual(actualRoll?.value, roll.value)
    if (roll.min !== undefined) strictEqual(actualRoll?.min, roll.min)
    if (roll.max !== undefined) strictEqual(actualRoll?.max, roll.max)
    if (roll.unscalable !== undefined) strictEqual(actualRoll?.unscalable, roll.unscalable)
  }
  if (tradeIds) deepStrictEqual(stat?.stat.trade.ids[stat.type], tradeIds)
  if (explicitTradeIds) deepStrictEqual(stat?.stat.trade.ids.explicit, explicitTradeIds)
  if (filter) {
    const filters = filter.mode === 'bulk'
      ? createExactStatFilters(item, item.statsByType, { searchStatRange: 0, mode: 'bulk' })
      : initUiModFilters(item, { searchStatRange: 0 })
    const actual = filters.find(result => 'statRef' in result && result.statRef === statRef)
    deepStrictEqual(actual && 'tradeId' in actual ? actual.tradeId : undefined, filter.tradeIds)
    if (filter.text !== undefined) {
      strictEqual(actual && 'text' in actual ? actual.text : undefined, filter.text)
    }
  }
}

async function main () {
  await initForNode('zh_CN', { realm: 'pc-tencent' })

  const fixtures = JSON.parse(
    await readFile(new URL('../../test_data.json', import.meta.url), 'utf8')
  ) as Array<ItemFixture | MechanicFixture>

  if (!Array.isArray(fixtures) || fixtures.some(fixture =>
    !fixture || typeof fixture !== 'object' || ('content' in fixture
      ? typeof fixture.content !== 'string'
      : typeof fixture.modifierHeader !== 'string' || !Object.hasOwn(ModifierMechanic, fixture.mechanic)))) {
    throw new Error('test_data.json must contain item or modifier header fixtures')
  }

  const items = fixtures.filter((fixture): fixture is ItemFixture => 'content' in fixture)
  for (const fixture of fixtures) {
    if ('modifierHeader' in fixture) {
      strictEqual(parseModInfoLine(fixture.modifierHeader).mechanic, ModifierMechanic[fixture.mechanic], fixture.modifierHeader)
    }
  }
  const failures: TestFailure[] = []
  const baseTypeFallbacks: string[] = []
  let recognizedModifiers = 0
  let recognizedStats = 0

  for (const [index, fixture] of items.entries()) {
    const itemNumber = index + 1
    const itemName = fixture.name ?? itemNameFromText(fixture.content, itemNumber)
    const { parsed, usedBaseTypeFallback } = fixture.expected
      ? { parsed: parseClipboard(fixture.content.trim()), usedBaseTypeFallback: false }
      : parseForAffixRecognition(fixture.content)

    if (usedBaseTypeFallback) {
      baseTypeFallbacks.push(itemName)
    }

    if (parsed.isErr()) {
      failures.push({
        itemNumber,
        itemName,
        message: `item parsing failed: ${parsed.error}`
      })
      continue
    }

    const item = parsed.value
    const expectations = Array.isArray(fixture.expected) ? fixture.expected : [fixture.expected]
    for (const expected of expectations) {
      if (!expected) continue
      try {
        assertExpected(item, expected)
      } catch (error) {
        failures.push({
          itemNumber,
          itemName,
          message: `${expected.statRef}${expected.type ? ` (${expected.type})` : ''}: ${error instanceof Error ? error.message : String(error)}`
        })
      }
    }
    const annotatedModifierCount = fixture.content
      .split(/\r?\n/)
      .filter(line => line.startsWith('{') && line.endsWith('}'))
      .length
    const emptyModifiers = item.newMods.filter(modifier => modifier.stats.length === 0)

    recognizedModifiers += item.newMods.length
    recognizedStats += item.newMods.reduce((sum, modifier) => sum + modifier.stats.length, 0)

    if (item.unknownModifiers.length) {
      failures.push({
        itemNumber,
        itemName,
        message: `unrecognized modifier text:\n${item.unknownModifiers
          .map(({ type, text }) => `  - [${type}] ${text}`)
          .join('\n')}`
      })
    }

    if (item.newMods.length < annotatedModifierCount) {
      failures.push({
        itemNumber,
        itemName,
        message: `parsed ${item.newMods.length} modifiers, fewer than ${annotatedModifierCount} annotated modifier headers`
      })
    }

    if (emptyModifiers.length) {
      failures.push({
        itemNumber,
        itemName,
        message: `${emptyModifiers.length} parsed modifier(s) had no recognized stats`
      })
    }
  }

  if (failures.length) {
    console.error(`Affix recognition failed with ${failures.length} issue(s):`)
    for (const failure of failures) {
      console.error(`\n[${failure.itemNumber}] ${failure.itemName}\n${failure.message}`)
    }
    process.exitCode = 1
    return
  }

  console.log(
    `Affix recognition passed: ${items.length} items, ${fixtures.length - items.length} modifier headers, ${recognizedModifiers} parsed modifiers, ${recognizedStats} recognized stats.`
  )

  if (baseTypeFallbacks.length) {
    console.log(
      `Used base-type fallback for unique items absent from the item index: ${baseTypeFallbacks.join(', ')}`
    )
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
