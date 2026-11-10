<script setup lang="ts">
import { ref } from 'vue'
import { Button, TextField, TextArea, Modal, ModalBody, Select, Box, Heading, Field, Link, SelectField, SelectOption } from '@fastrd/ui-vue'
const name = ref('')
const count = ref(0)
const notes = ref('')
const checked = ref(false)
const format = ref<string>()
const native = ref('pdf')
const changes = ref(0)
const open = ref(false)
const nested = ref(false)
const locked = ref(false)
const saved = ref(0)
const options = [{ value: 'pdf', label: 'PDF' }, { value: 'svg', label: 'SVG' }, { value: 'png', label: 'PNG', disabled: true }]
</script>
<template>
  <main class="workbench">
    <Heading>Document settings</Heading>
    <p>Configure the output before saving your document.</p>
    <form @submit.prevent="saved++">
      <Field>Name <TextField v-model.trim="name" aria-label="Name" required /></Field>
      <output data-testid="name">{{ name }}</output>
      <Field>Count <TextField v-model.number.lazy="count" type="number" aria-label="Count" /></Field>
      <output data-testid="count">{{ count }}</output>
      <Field>Notes <TextArea v-model="notes" aria-label="Notes" /></Field>
      <Field><TextField v-model="checked" type="checkbox" aria-label="Include notes" /> Include notes</Field>
      <output data-testid="checked">{{ checked }}</output>
      <Field>Format <Select :value="format" :options="options" placeholder="Choose format" aria-label="Format" @change="format=$event; changes++" /></Field>
      <output data-testid="format">{{ format }}:{{ changes }}</output>
      <SelectField v-model="native" aria-label="Native format"><SelectOption value="pdf">PDF</SelectOption><SelectOption value="svg">SVG</SelectOption></SelectField>
      <Select :value="undefined" :options="[]" placeholder="No formats" aria-label="Empty format" />
      <Select value="pdf" :options="options" disabled aria-label="Disabled format" />
      <div class="toolbar"><Button type="submit" variant="primary">Save</Button><Button @click="open=true">Open settings</Button><Button @click="locked=true">Open locked</Button><Button loading>Saving</Button><Button disabled>Unavailable</Button></div>
      <output data-testid="saved">{{ saved }}</output>
    </form>
    <Box data-testid="preview"><input aria-label="Preview input"><p>Preview content stays native.</p></Box>
    <Box class="fastui-mdui fastui-vscrui" data-testid="mappings" />
    <Modal :open="open" label="Settings" @close="open=false">
      <ModalBody><Heading>Settings</Heading><TextField aria-label="Dialog name" autofocus /><Link href="#details">Details</Link><Button @click="nested=true">Open nested</Button><Button @click="open=false">Close settings</Button></ModalBody>
      <Modal :open="nested" label="Nested settings" @close="nested=false"><ModalBody><Button @click="nested=false">Close nested</Button></ModalBody></Modal>
    </Modal>
    <Modal :open="locked" label="Locked settings" :dismissible="false" @close="locked=false"><ModalBody><Button @click="locked=false">Unlock</Button></ModalBody></Modal>
  </main>
</template>
