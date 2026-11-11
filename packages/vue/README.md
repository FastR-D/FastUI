# @fastrd/ui-vue

MIT · 0.1.2 · Vue ^3.5 peer · exact foundation 0.1.2 registry dependency.

```vue
<script setup>
import { ref } from 'vue'
import { Button, TextField, Modal, ModalBody, Select } from '@fastrd/ui-vue'
import '@fastrd/ui-vue/styles.css'
const name = ref('')
const open = ref(false)
const format = ref('pdf')
</script>
<template>
  <TextField v-model.trim="name" aria-label="Name" />
  <Select :value="format" :options="[{value:'pdf',label:'PDF'}]" @change="format=$event" />
  <Button variant="primary" @click="open=true">Settings</Button>
  <Modal :open="open" label="Settings" @close="open=false">
    <ModalBody><Button @click="open=false">Close</Button></ModalBody>
  </Modal>
</template>
```

Button variants: primary, secondary (default), quiet, icon, navigation, danger.
Sizes: xs/sm/md; Button defaults sm, fields md. Loading buttons are busy and
disabled; icon buttons need an accessible label supplied by the caller.
TextField/TextArea/SelectField support Vue v-model and native events/attrs;
TextField supports trim, number, lazy and checkbox/radio models.

Modal has open, label/labelledby, md/lg/xl size and dismissible (default true).
close is a request; the caller sets open=false. The browser owns native dialog
focus, inertness and nesting. No body teleport: scoped tokens survive.
Native `method=dialog` forms are not the controlled close API.

Select accepts value, options [{value,label,disabled?}], placeholder, disabled,
size and emits change(string) only for a different value. It is a native select:
keyboard/typeahead/touch/form behavior follows the platform. In migration,
remove the original custom-listbox CSS and avoid handling preview shortcuts
when a native select has focus. Disabled options are skipped by the browser.

Semantic primitives preserve the shared names and native refs: Box, Text,
Heading, Panel, ModalBody, Header, Footer, Nav, Aside, Main, Article, Form, Field,
Fieldset, Legend, Disclosure, DisclosureTrigger, List, ListItem, DescriptionList,
Term, Description, Table/Head/Body/Row/Cell/Header/Caption, Frame, Image,
DialogSurface, Progress, Link, Svg, SvgPath, SelectField, SelectOption, RichText.
RichText renders caller-owned trusted HTML. `as` applies to element primitives.
useDialogFocus accepts a native dialog ref and returns onDialogCancel; native
modal behavior replaces the original custom focus trap.

Class names use fastui-*; no legacy fp-* aliases or application brands are
included. Application layouts and preview styles stay with the host.
