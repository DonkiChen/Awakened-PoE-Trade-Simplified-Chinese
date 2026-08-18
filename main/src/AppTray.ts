import path from 'path'
import { app, Tray, Menu, shell, nativeImage, dialog } from 'electron'
import type { ServerEvents } from './server'

export class AppTray {
  public overlayKey = 'Shift + Space'
  private tray: Tray
  serverPort = 0

  constructor (server: ServerEvents) {
    let trayImage = nativeImage.createFromPath(
      path.join(
        __dirname,
        process.env.STATIC!,
        process.platform === "win32" ? "icon.ico" : "icon.png"
      )
    )

    if (process.platform === 'darwin') {
      // Mac image size needs to be smaller, or else it looks huge. Size
      // guideline is from https://iconhandbook.co.uk/reference/chart/osx/
      trayImage = trayImage.resize({ width: 22, height: 22 })
    }

    this.tray = new Tray(trayImage)
    this.tray.setToolTip(`Awakened PoE Trade Simplified Chinese v${app.getVersion()}`)
    this.rebuildMenu()

    server.onEventAnyClient('CLIENT->MAIN::user-action', ({ action }) => {
      if (action === 'quit') {
        app.quit()
      }
    })
  }

  rebuildMenu () {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '设置',
        click: () => {
          dialog.showMessageBox({
            title: 'Settings',
            message: `Open Path of Exile and press "${this.overlayKey}". Click on the button with cog icon there.`
          })
        }
      },
      {
        label: '浏览器打开界面',
        click: () => {
          shell.openExternal(`http://localhost:${this.serverPort}`)
        }
      },
      { type: 'separator' },
      {
        label: '打开配置文件目录',
        click: () => {
          shell.openPath(path.join(app.getPath('userData'), 'apt-data'))
        }
      },
      { type: 'separator' },
      {
        label: '支持原作者',
        click: () => {
          shell.openExternal('https://patreon.com/awakened_poe_trade')
        }
      },
      {
        label: '支持简中作者',
        click: () => {
          shell.openExternal('https://afdian.com/a/donkichen/plan')
        }
      },
      { type: 'separator' },
      {
        label: 'POE-APT简中交流 QQ 群',
        click: () => {
          shell.openExternal('http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=R0fQ9Z1SoytPE0UISBboW4SsNE-QNmzz&authKey=RNAcTMTtw3yT5kgH%2F9Ghj1qU%2FyNg%2BHqMekBkhJ%2Buvc5xn%2Beo6DuokpDaU8cKg2Kj&noverify=0&group_code=1051162675F')
        }
      },
      { type: 'separator' },
      {
        label: 'Discord (需要翻墙)',
        submenu: [
          {
            label: 'TFT(国际服常用频道)',
            click: () => { shell.openExternal('https://discord.gg/KNpmhvk') }
          },
          {
            label: 'POE频道',
            click: () => { shell.openExternal('https://discord.gg/fSwfqN5') }
          }
        ]
      },
      {
        label: '退出',
        click: () => {
          app.quit()
        }
      }
    ])

    this.tray.setContextMenu(contextMenu)
  }
}
