import { deepStrictEqual, strictEqual } from 'node:assert'
import { readFile } from 'node:fs/promises'
import { CLIENT_STRINGS } from '../src/assets/data'
import { initForNode } from '../src/assets/data/node'
import { parseClipboard } from '../src/parser'
import { parseModInfoLine } from '../src/parser/advanced-mod-desc'
import { ModifierMechanic } from '../src/parser/modifiers'
import { createExactStatFilters } from '../src/web/price-check/filters/create-stat-filters'

interface ItemFixture {
  content: string
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

async function main () {
  await initForNode('zh_CN', { realm: 'pc-tencent' })

  const guardianMap = parseClipboard([
    '物品类别: 异界地图',
    '稀 有 度: 稀有',
    '地图（16阶）',
    '--------',
    '物品等级: 83',
    '--------',
    '怪物等级: 83',
    '--------',
    '{ 基底词缀 }',
    '该区域被裂界者影响 — 数值不可估量',
    '地图被 裂界守卫：奴役(...) 占据 — 数值不可估量',
    '--------',
    '未鉴定',
    '--------',
    '在私人地图装置中使用该物品，前往该等阶或更低等阶的地图。只能被使用一次。'
  ].join('\n'))
  if (guardianMap.isErr()) throw new Error(`Guardian map parsing failed: ${guardianMap.error}`)
  const map = guardianMap.value
  const guardianFilter = createExactStatFilters(map, map.statsByType, { searchStatRange: 0, mode: 'bulk' })
    .find(filter => filter.statRef === 'Map is occupied by The Enslaver')
  strictEqual(guardianFilter?.text, '地图被 裂界守卫：奴役 占据')
  deepStrictEqual(guardianFilter.tradeId, ['implicit.stat_3624393862|1'])

  const mechanicCases = [
    ['尊崇裂界者之', ModifierMechanic.Elder],
    ['高阶裂界者之', ModifierMechanic.Elder],
    ['秩序之', ModifierMechanic.Unveiled],
    ['精华之', ModifierMechanic.Essence],
    ['恶名的', ModifierMechanic.Infamous]
  ] as const
  for (const [name, mechanic] of mechanicCases) {
    strictEqual(parseModInfoLine(`{ 后缀属性 "${name}" }`).mechanic, mechanic, name)
  }

  const fixtures = JSON.parse(
    await readFile(new URL('../../test_data.json', import.meta.url), 'utf8')
  ) as ItemFixture[]

  if (!Array.isArray(fixtures) || fixtures.some(fixture => typeof fixture?.content !== 'string')) {
    throw new Error('test_data.json must be an array of objects with a string content field')
  }

  const failures: TestFailure[] = []
  const baseTypeFallbacks: string[] = []
  let recognizedModifiers = 0
  let recognizedStats = 0

  for (const [index, fixture] of fixtures.entries()) {
    const itemNumber = index + 1
    const itemName = itemNameFromText(fixture.content, itemNumber)
    const { parsed, usedBaseTypeFallback } = parseForAffixRecognition(fixture.content)

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
    `Affix recognition passed: ${fixtures.length} items, ${recognizedModifiers} parsed modifiers, ${recognizedStats} recognized stats.`
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
