<template>
  <div class="max-w-md p-2">
    <div class="flex flex-col gap-y-4 mb-4">
      <div class="flex flex-col gap-y-1" v-for="(command, idx) in commands" :key="idx">
        <input v-model.trim="command.text" class="rounded bg-gray-900 px-1 block w-full font-poe" />
        <div class="flex gap-x-2">
          <ui-toggle v-model="command.send" class="ml-1">{{ t('settings.chat_cmd_send') }}</ui-toggle>
          <button @click="removeCommand(idx)" class="ml-auto text-gray-500">{{ t('Remove') }}</button>
          <hotkey-input v-model="command.hotkey" class="w-48" />
        </div>
        <div class="flex gap-x-2">
          <ui-toggle v-model="command.restoreLastChat" class="ml-1">{{ t('settings.chat_restore_last_chat') }}</ui-toggle>
        </div>
      </div>
    </div>
    <button @click="addComand" class="bg-gray-900 rounded flex items-baseline px-2 py-1 leading-none"><i class="fas fa-plus mr-1"></i> {{ t('settings.chat_cmd_add') }}</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import UiToggle from '@/web/ui/UiToggle.vue'
import { configProp } from './utils'
import HotkeyInput from './HotkeyInput.vue'

export default defineComponent({
  name: 'settings.chat',
  components: { HotkeyInput, UiToggle },
  props: configProp(),
  setup (props) {
    const { t } = useI18n()

    return {
      t,
      commands: computed(() => props.config.commands),
      addComand () {
        props.config.commands.push({
          text: '',
          hotkey: null,
          send: true,
          restoreLastChat: true
        })
      },
      removeCommand (idx: number) {
        props.config.commands.splice(idx, 1)
      }
    }
  }
})
</script>
