<script setup lang="ts">
import { ref } from 'vue'
import { TabBar, SegmentedControl, Toolbar, StatusBar } from '@fastrd/ui-vue'
const tabs = ref([
  { id: 'work-source', label: 'Source', controls: 'work-panel', dirty: true },
  { id: 'work-disabled', label: 'Disabled file', controls: 'work-panel', disabled: true },
  { id: 'work-notes', label: 'Notes file', controls: 'work-panel' },
])
const active = ref('work-source'), filter = ref('all')
const options = [{ value: 'all', label: 'All sources' }, { value: 'local', label: 'Local sources' }, { value: 'locked', label: 'Locked sources', disabled: true }]
function close(id: string) {
  tabs.value = tabs.value.filter(tab => tab.id !== id)
  if (id === active.value) active.value = tabs.value.find(tab => !tab.disabled)?.id ?? ''
}
</script>
<template>
  <section aria-label="Workbench components">
    <TabBar :tabs="tabs" :active-id="active" label="Files" @select="active=$event" @close="close" />
    <div id="work-panel" role="tabpanel" :aria-labelledby="active || undefined" :aria-label="active ? undefined : 'No file'" tabindex="0">{{ active || 'No file' }}</div>
    <Toolbar label="Source controls"><SegmentedControl label="Source filter" :value="filter" :options="options" @change="filter=$event" /></Toolbar>
    <StatusBar aria-label="Source status">{{ filter }}</StatusBar>
  </section>
</template>
