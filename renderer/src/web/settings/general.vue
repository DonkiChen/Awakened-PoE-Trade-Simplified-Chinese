<template>
  <div class="max-w-md p-2">
    <div class="mb-4">
      <div class="flex-1 mb-1">{{ t(':language') }}</div>
      <select v-model="language" class="p-1 rounded bg-gray-700 w-24">
        <option value="en">English</option>
        <option value="ru">Русский</option>
        <option value="cmn-Hant">正體中文</option>
        <option value="ko">한국어</option>
        <option value="zh_CN">简体中文</option>
      </select>
    </div>
    <div class="mb-4" v-if="language === 'cmn-Hant'">
      <div class="flex-1 mb-1">{{ t('realm') }}</div>
      <div class="flex gap-x-4">
        <ui-radio v-model="realm" value="pc-ggg">{{ t('realm_intl') }}</ui-radio>
        <ui-radio v-model="realm" value="pc-garena">{{ t('Hotcool') }}</ui-radio>
      </div>
    </div>
    <div class="mb-4" v-if="language === 'zh_CN'">
      <div class="flex-1 mb-1">{{ t('Realm') }}</div>
      <div class="flex gap-x-4">
        <ui-radio v-model="realm" value="pc-ggg">{{ t('realm_intl') }}</ui-radio>
        <ui-radio v-model="realm" value="pc-tencent">{{ t('realm_tencent') }}</ui-radio>
        <div class="flex gap-x-1" v-show="realm === 'pc-tencent'">
          <div>{{ t('cookies') }}</div>
          <span><input v-model="cookies" class="rounded bg-gray-900 px-2 flex-1"></span>
        </div>
      </div>
      <div class="flex-1 mt-2" v-show="realm === 'pc-tencent'">{{ t('sale_type') }}</div>
      <div class="flex gap-x-4" v-show="realm === 'pc-tencent'">
        <ui-radio v-model="saleType" value="any">{{ t('sale_type_any') }}</ui-radio>
        <ui-radio v-model="saleType" value="strict_auto_buyout">{{ t('sale_type_strict_auto_buyout') }}</ui-radio>
      </div>
    </div>

    <div class="mb-4">
      <div class="flex-1 mb-1">{{ t(':font_size') }}</div>
      <div class="flex gap-1">
        <input v-model.number="fontSize" class="rounded bg-gray-900 px-1 block w-16 font-poe text-center" />
        <span>px</span>
      </div>
    </div>
    <ui-checkbox class="mb-4"
      v-model="restoreClipboard">{{ t(':restore_clipboard') }}</ui-checkbox>
    <div class="mb-2">
      <div class="flex-1 mb-1">{{ t(':poe_log_file') }}</div>
      <input v-model.trim="clientLog"
        class="rounded bg-gray-900 px-1 block w-full font-sans" placeholder="...?/Grinding Gear Games/Path of Exile/logs/Client.txt">
    </div>
    <div class="mb-4">
      <div class="flex-1 mb-1">{{ t(':poe_cfg_file') }}</div>
      <input v-model.trim="gameConfig"
        class="rounded bg-gray-900 px-1 block w-full font-sans" placeholder="...?/My Games/Path of Exile/production_Config.ini">
    </div>
    <hr class="mb-4 mx-8 border-gray-700">
    <div class="mb-2">
      <div class="mb-1">{{ t(':overlay_bg') }}</div>
      <div class="flex gap-4 items-baseline">
        <input v-model="overlayBackground" class="rounded bg-gray-900 px-1 block w-48 font-poe text-center" />
        <ui-radio v-model="overlayBackground" value="rgba(255, 255, 255, 0)">{{ t(':overlay_bg_none') }}</ui-radio>
      </div>
    </div>
    <ui-checkbox class="mb-2" v-if="overlayBackground !== 'rgba(255, 255, 255, 0)'"
      v-model="overlayBackgroundClose">{{ t(':overlay_bg_focus_game') }}</ui-checkbox>
    <ui-checkbox class="mb-4"
      v-model="showAttachNotification">{{ t(':show_overlay_ready') }}</ui-checkbox>
    <div class="mb-4">
      <div class="flex-1 mb-1">{{ t(':window_title') }} <span class="bg-gray-200 text-gray-900 rounded px-1">{{ t('Restart required') }}</span></div>
      <input v-model="windowTitle" class="rounded bg-gray-900 px-1 block w-full mb-1 font-poe" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useI18nNs } from '@/web/i18n'
import UiRadio from '@/web/ui/UiRadio.vue'
import UiCheckbox from '@/web/ui/UiCheckbox.vue'
import { configModelValue, configProp } from './utils'
import { AppConfig } from '@/web/Config'
import { SaleType } from '@/web/price-check/filters/interfaces'

export default defineComponent({
  name: 'settings.general',
  components: { UiRadio, UiCheckbox },
  props: configProp(),
  setup (props) {
    const { t } = useI18nNs('settings')

    return {
      t,
      fontSize: configModelValue(() => props.config, 'fontSize'),
      overlayBackgroundClose: configModelValue(() => props.config, 'overlayBackgroundClose'),
      overlayBackground: configModelValue(() => props.config, 'overlayBackground'),
      clientLog: configModelValue(() => props.config, 'clientLog'),
      gameConfig: configModelValue(() => props.config, 'gameConfig'),
      language: computed<typeof props.config.language>({
        get () { return props.config.language },
        set (value) {
          props.config.language = value
          AppConfig().language = value
          if (value !== 'cmn-Hant' && value !== 'zh_CN') {
            props.config.realm = 'pc-ggg'
          }
        }
      }),
      realm: configModelValue(() => props.config, 'realm'),
      cookies: configModelValue(() => props.config, 'cookies'),
      restoreClipboard: configModelValue(() => props.config, 'restoreClipboard'),
      showAttachNotification: configModelValue(() => props.config, 'showAttachNotification'),
      windowTitle: configModelValue(() => props.config, 'windowTitle'),
      saleType: computed<String>({
        get () {
          if (!props.config.defaultSaleType) {
            props.config.defaultSaleType = SaleType.ANY
          }
          return props.config.defaultSaleType
        },
        set (v: String) {
          let defaultSaleType: SaleType
          switch (v) {
            case 'any':
              defaultSaleType = SaleType.ANY
              break
            case 'strict_auto_buyout':
              defaultSaleType = SaleType.STRICT_AUTO_BUYOUT
              break
            default:
              defaultSaleType = SaleType.ANY
              break
          }
          props.config.defaultSaleType = defaultSaleType
        }
      })
    }
  }
})
</script>
