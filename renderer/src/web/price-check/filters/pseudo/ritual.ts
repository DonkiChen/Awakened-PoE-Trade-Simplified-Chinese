import { stat, pseudoStatByRef } from '@/assets/data'
import type { FiltersCreationContext } from '../create-stat-filters'
import { noSourcePseudoToFilter } from './item-property'

const PSEUDO = {
  UNIQUE_MONSTERS: stat('Unique Monsters (Blood-Filled Vessel): #'),
  OTHER_MONSTERS: stat('Non-Unique Monsters (Blood-Filled Vessel): #')
}

export function filterRitualMonsters (ctx: FiltersCreationContext): void {
  const counts = ctx.item.ritualMonsters
  if (!counts) return

  const stats = [
    [PSEUDO.UNIQUE_MONSTERS, counts.unique],
    [PSEUDO.OTHER_MONSTERS, counts.other]
  ] as const

  for (const [ref, value] of stats) {
    if (value == null) continue
    const filter = noSourcePseudoToFilter({
      pseudo: pseudoStatByRef(ref)!,
      roll: { min: value, max: value, value },
      disabled: false
    }, ctx)
    filter.text = filter.text.trimEnd()
    ctx.filters.push(filter)
  }
}
