<script setup lang="ts">
import { ref } from 'vue'
import { Button, Modal, ModalBody } from '@fastrd/ui-vue'
const mode = new URLSearchParams(location.search).get('dialog-case')!
const parent = ref(true)
const child = ref(true)
const requests = ref<string[]>([])
const labels: Record<string, { label?: string; labelledby?: string; 'aria-label'?: string; 'aria-labelledby'?: string }> = {
  'native-label': { 'aria-label': 'Native label' },
  'native-labelledby': { 'aria-labelledby': 'native-heading' },
  'prop-label': { label: 'Prop label' },
  'prop-labelledby': { labelledby: 'prop-heading' },
  'label-precedence': { label: 'Prop label', 'aria-label': 'Native label' },
  'labelledby-precedence': { labelledby: 'prop-heading', 'aria-labelledby': 'native-heading' },
}
</script>
<template>
  <main class="workbench">
    <output data-testid="requests">{{ requests.join(',') }}</output>
    <template v-if="mode === 'stack'">
      <Modal :open="parent" label="Initial parent" @close="requests.push('parent'); parent=false">
        <ModalBody><Button autofocus>Parent focus</Button></ModalBody>
        <Modal :open="child" label="Initial child" @close="requests.push('child'); child=false">
          <ModalBody><Button autofocus>Child focus</Button></ModalBody>
        </Modal>
      </Modal>
    </template>
    <Modal v-else :open="parent" v-bind="labels[mode]" @close="parent=false">
      <ModalBody><h2 id="native-heading">Native heading</h2><h2 id="prop-heading">Prop heading</h2><Button>Close</Button></ModalBody>
    </Modal>
  </main>
</template>
