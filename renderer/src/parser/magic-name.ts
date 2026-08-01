import { ITEM_BY_REF_OR_TRANSLATED } from '@/assets/data'

export function magicBasetype (name: string) {
  const candidates = new Set<string>()

  for (const sep of [' ', '']) {
    const words = name.split(sep).filter(Boolean)

    for (let start = 0; start < words.length; start += 1) {
      for (let end = start + 1; end <= words.length; end += 1) {
        candidates.add(words.slice(start, end).join(sep))
      }
    }
  }

  const result = [...candidates]
    .map(candidate => {
      const item = ITEM_BY_REF_OR_TRANSLATED('ITEM', candidate)
      return { name: candidate, found: item?.[0]?.craftable }
    })
    .filter(res => res.found)
    .sort((a, b) => b.name.length - a.name.length)

  return result.length ? result[0].name : undefined
}
