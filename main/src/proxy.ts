import type {Server,IncomingMessage,ServerResponse} from 'http'
import * as https from 'https'
import {app, net} from 'electron'
import type {Logger} from './RemoteLogger'

export const PROXY_HOSTS = [
  {host: 'www.pathofexile.com', official: true},
  {host: 'ru.pathofexile.com', official: true},
  {host: 'pathofexile.tw', official: true},
  {host: 'poe.game.daum.net', official: true},
  {host: 'poe.ninja', official: false},
  {host: 'www.poeprices.info', official: false},
  { host: 'poe.game.qq.com', official: true },
  { host: 'www.poelab.com', official: false },
  { host: 'pub-feb51ef2e03741399e6a3d2d09a07601.r2.dev', official: false },
  { host: 'gitee.com', official: false }
]

export class HttpProxy {
  cookiesForPoe = new Map<string, string>()
  private cookies: string = ''
  private realm: string = ''

  constructor(
    server: Server,
    logger: Logger
  ) {
    server.addListener('request', (req, res) => {
      if (!req.url?.startsWith('/proxy/')) return
      const host = req.url.split('/', 3)[2]
      // FIXME: 不确定切换服务器后是否需要重启?
      // TODO: 统一网络请求方式
      if (this.realm === 'pc-tencent' && host === 'poe.game.qq.com') {
        this.doTencentRequest(logger, host, req, res)
      } else {
        this.doOfficialRequest(logger, req, res)
      }
    })
  }

  private doOfficialRequest(
    logger: Logger,
    req: IncomingMessage,
    res: ServerResponse<IncomingMessage>
  ) {

    const official = PROXY_HOSTS.find(entry => entry.host === host)?.official
    if (official === undefined) return req.destroy()

    for (const key in req.headers) {
      if (key.startsWith('sec-') || key === 'host' || key === 'origin' || key === 'content-length') {
        delete req.headers[key]
      }
    }

    const proxyReq = net.request({
      url: 'https://' + req.url!!.slice('/proxy/'.length),
      method: req.method,
      headers: {
        ...req.headers,
        'user-agent': app.userAgentFallback
      },
      useSessionCookies: true,
      referrerPolicy: 'no-referrer-when-downgrade'
    })
    proxyReq.addListener('response', (proxyRes) => {
      const resHeaders = {...proxyRes.headers}
      // `net.request` returns an already decoded body
      delete resHeaders['content-encoding']
      res.writeHead(proxyRes.statusCode, proxyRes.statusMessage, resHeaders)
      ;(proxyRes as unknown as NodeJS.ReadableStream).pipe(res)
    })
    proxyReq.addListener('error', (err) => {
      logger.write(`error [cors-proxy] ${err.message} (${host})`)
      res.destroy(err)
    })
    req.pipe(proxyReq as unknown as NodeJS.WritableStream)
  }

  private doTencentRequest(
    logger: Logger,
    host: string,
    req: IncomingMessage,
    res: ServerResponse<IncomingMessage>
  ) {
    const official = PROXY_HOSTS.find(entry => entry.host === host)?.official
    if (official === undefined) return req.destroy()

    let cookie = this.cookies

    const options = {
      method: req.method,
      headers: {
        ...req.headers,
        host: host,
        cookie: cookie,
        'user-agent': app.userAgentFallback,
        Origin: 'https://poe.game.qq.com',
        Host: 'poe.game.qq.com',
        'X-Requested-With': 'XMLHttpRequest'
      }
    }
    const proxyReq = https.request(
      'https://' + req.url!!.slice('/proxy/'.length),
      options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode!, proxyRes.statusMessage!, proxyRes.rawHeaders)
        proxyRes.pipe(res)
      })
    proxyReq.addListener('error', (err) => {
      logger.write(`error [cors-proxy] ${err.message} (${host})`)
      res.destroy(err)
    })
    req.pipe(proxyReq)

  }

  updateCookies(cookies: string, realm: string) {
    this.cookies = cookies
    this.realm = realm
  }

}
