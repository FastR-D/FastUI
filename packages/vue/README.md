# @fastrd/ui-vue

MIT · 0.2.0 · Vue ^3.5 peer · exact foundation 0.2.0 registry dependency.

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


## Workbench components

`TabBar`: `tabs`, `activeId`, accessible `label`, `onSelect` (Vue `@select`),
optional `onClose` (Vue `@close`), `closeLabel(tab)` and `dirtyLabel`.
Each TabItem has a unique DOM `id`, string `label`, optional `controls`,
`disabled`, `dirty`, `preview`. Host panels use `role="tabpanel"`, `id=controls`
and `aria-labelledby=activeId`; host owns visibility and active selection after
close. Automatic activation uses Left/Right, Home/End, RTL and disabled skipping.
Closing restores focus to the remaining tabbable tab. Empty/all-disabled lists
have no tabbable tab. Use unique ids across every instance.

`SegmentedControl`: `options` ({value,label,disabled?}), `value`, `label`,
`onChange` (Vue `@change`). A controlled mutually exclusive pressed-button group;
uses normal Tab order, not radio semantics.

`Toolbar` requires `label`; it groups mixed actions/fields with native Tab order.
`StatusBar` defaults role=status. `Section`, `ListRow`, `Divider` provide surfaces,
row separators and structure. ListRow is a noninteractive div by default; the
host owns selection, links, data, search and sorting.

Compact control sizes xs/sm/md are 24/25/28px. Typography uses the FastWrite
Plex/Noto stack with system fallback; fonts are loaded by the host, not the package.

`Alert` and `Badge`: tone info/success/warning/danger. Alert defaults role=status,
or alert for danger. `Loading` exposes a status region and label (default Loading).
`EmptyState` takes title, default content and an optional `#action` slot.
