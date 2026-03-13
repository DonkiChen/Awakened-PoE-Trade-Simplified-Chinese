import { computed, shallowRef, readonly } from 'vue'
import { createGlobalState } from '@vueuse/core'
import { AppConfig, poeWebApi } from '@/web/Config'
import type { Config } from '@/web/Config'
import { Host } from './IPC'

// pc-ggg, pc-garena, pc-tencent
export const PERMANENT_SC = ['Standard', '標準模式', '标准模式']
const PERMANENT_HC = ['Hardcore', '專家模式', '专家模式']

interface ApiLeague {
  id: string
  event?: boolean
  rules: Array<{ id: string }>
}

interface League {
  id: string
  isPopular: boolean
}

type LeaguesConfigSource = Pick<Config, 'leagueId' | 'realm' | 'language' | 'useIntlSite'>

export function leaguesDependencyKey (config: Pick<Config, 'realm' | 'language' | 'useIntlSite'>) {
  return `${config.realm}|${config.language}|${config.useIntlSite ? 1 : 0}`
}

function createLeaguesState (configSource?: LeaguesConfigSource) {
  const isLoading = shallowRef(false)
  const error = shallowRef<string | null>(null)
  const lastAttemptedDependencyKey = shallowRef<string | null>(null)
  const tradeLeagues = shallowRef<League[]>([])

  function getConfig (): LeaguesConfigSource {
    // The global config object is replaced on save/update, so read it lazily.
    return configSource ?? AppConfig()
  }

  const selectedId = computed<string | undefined>({
    get () {
      return (tradeLeagues.value.length)
        ? getConfig().leagueId
        : undefined
    },
    set (id) {
      getConfig().leagueId = id
    }
  })

  const selected = computed(() => {
    const { leagueId, realm } = getConfig()
    if (!tradeLeagues.value || !leagueId) return undefined
    const listed = tradeLeagues.value.find(league => league.id === leagueId)
    return {
      id: leagueId,
      realm,
      isPopular: !isPrivateLeague(leagueId) && Boolean(listed?.isPopular)
    }
  })

  async function load () {
    const config = getConfig()
    isLoading.value = true
    error.value = null
    lastAttemptedDependencyKey.value = leaguesDependencyKey(config)

    try {
      // Settings pages can pass a draft config here, so build the request from
      // the current config source instead of always using AppConfig().
      const response = await Host.proxy(`${poeWebApi(config)}/api/leagues?type=main&realm=pc`)
      if (!response.ok) throw new Error(JSON.stringify(Object.fromEntries(response.headers)))
      const leagues: ApiLeague[] = await response.json()

      tradeLeagues.value = leagues
        .filter(league =>
          !PERMANENT_HC.includes(league.id) &&
          !league.rules.some(rule => rule.id === 'NoParties' ||
            (rule.id === 'HardMode' && !league.event)))
        .map(league => {
          return { id: league.id, isPopular: true }
        })

      const leagueIsAlive = tradeLeagues.value.some(league => league.id === selectedId.value)
      if (!leagueIsAlive && !isPrivateLeague(selectedId.value ?? '')) {
        if (tradeLeagues.value.length > 1) {
          const TMP_CHALLENGE = 1
          selectedId.value = tradeLeagues.value[TMP_CHALLENGE].id
        } else {
          const STANDARD = 0
          selectedId.value = tradeLeagues.value[STANDARD].id
        }
      }
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      isLoading.value = false
    }
  }

  return {
    isLoading,
    error,
    lastAttemptedDependencyKey: readonly(lastAttemptedDependencyKey),
    selectedId,
    selected,
    list: readonly(tradeLeagues),
    load
  }
}

type LeaguesState = ReturnType<typeof createLeaguesState>
const useGlobalLeagues = createGlobalState(() => createLeaguesState())
// Reuse the same draft-bound league state while a settings config clone lives.
const useScopedLeagues = new WeakMap<LeaguesConfigSource, LeaguesState>()

export function useLeagues (configSource?: LeaguesConfigSource) {
  if (!configSource) {
    return useGlobalLeagues()
  }

  let leagues = useScopedLeagues.get(configSource)
  if (!leagues) {
    leagues = createLeaguesState(configSource)
    useScopedLeagues.set(configSource, leagues)
  }
  return leagues
}

function isPrivateLeague (id: string) {
  if (id.includes('Ruthless')) {
    return true
  }
  return /\(PL\d+\)$/.test(id)
}
