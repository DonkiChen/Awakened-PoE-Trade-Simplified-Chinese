import { ITEM_BY_REF, ITEM_BY_TRANSLATED } from '@/assets/data'
import { parserRealm } from './runtime'

export function magicBasetype (name: string) {
  const realm = parserRealm()
  const sep = (realm !== 'pc-ggg') ? '' : ' '
  const words = name.split(sep)

  const perm: string[] = words.flatMap((_, start) =>
    Array(words.length - start).fill(undefined)
      .map((_, idx) => words
        .slice(start, start + idx + 1)
        .join(sep)
      )
  )

  const result = perm
    .map(name => {
      const result = (realm !== 'pc-ggg') ? ITEM_BY_TRANSLATED('ITEM', name) : ITEM_BY_REF('ITEM', name)
      return { name, found: (result && result[0].craftable) }
    })
    .filter(res => res.found)
    .sort((a, b) => b.name.length - a.name.length)

  return result.length ? result[0].name : undefined
}
