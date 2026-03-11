export type ParserRealm = 'pc-ggg' | 'pc-garena' | 'pc-tencent'

let getRealm = (): ParserRealm => 'pc-ggg'

export function configureParserRuntime (options: { getRealm?: () => ParserRealm }) {
  if (options.getRealm) {
    // Keep parser internals decoupled from the web config layer.
    getRealm = options.getRealm
  }
}

export function parserRealm () {
  return getRealm()
}
