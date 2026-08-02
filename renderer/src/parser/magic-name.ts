import { ITEM_BY_REF_OR_TRANSLATED } from '@/assets/data'

export function magicBasetype (name: string) {
  const separator = name.includes(' ') ? ' ' : ''
  const words = name.split(separator).filter(Boolean)

  const candidates = words.flatMap((_, start) =>
    Array(words.length - start).fill(undefined)
      .map((_, index) => words
        .slice(start, start + index + 1)
        .join(separator)
      )
  )

  const result = candidates
    .map(candidate => {
      const item = ITEM_BY_REF_OR_TRANSLATED('ITEM', candidate)
      return { name: candidate, found: item?.[0]?.craftable }
    })
    .filter(res => res.found)
    .sort((a, b) => b.name.length - a.name.length)

  return result.length ? result[0].name : undefined
}
