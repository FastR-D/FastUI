import {
  h, mergeProps, withDirectives, vModelDynamic, vModelText, vModelSelect,
  type FunctionalComponent, type HTMLAttributes, type ButtonHTMLAttributes,
  type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type SVGAttributes, type PropType,
} from 'vue'

export type ControlSize = 'xs' | 'sm' | 'md'
export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'icon' | 'navigation' | 'danger'
export type ElementProps = HTMLAttributes & { as?: string }

// Functional roots keep native DOM refs used by editors and resize handles.
function element(name: string, tag: string, className = ''): FunctionalComponent<ElementProps> {
  const component: FunctionalComponent<ElementProps> = (props, { attrs, slots }) =>
    h(props.as ?? tag, mergeProps(attrs, { class: className }), slots.default?.())
  component.displayName = name
  component.props = ['as']
  component.inheritAttrs = false
  return component
}

export const Box = /* @__PURE__ */ element('Box', 'div')
export const Text = /* @__PURE__ */ element('Text', 'span')
export const Heading = /* @__PURE__ */ element('Heading', 'h2', 'fastui-heading')
export const Panel = /* @__PURE__ */ element('Panel', 'section')
export const ModalBody = /* @__PURE__ */ element('ModalBody', 'div', 'fastui-modal-body')
export const Header = /* @__PURE__ */ element('Header', 'header')
export const Footer = /* @__PURE__ */ element('Footer', 'footer')
export const Nav = /* @__PURE__ */ element('Nav', 'nav')
export const Aside = /* @__PURE__ */ element('Aside', 'aside')
export const Main = /* @__PURE__ */ element('Main', 'main')
export const Article = /* @__PURE__ */ element('Article', 'article')
export const Form = /* @__PURE__ */ element('Form', 'form')
export const Field = /* @__PURE__ */ element('Field', 'label', 'fastui-field')
export const Fieldset = /* @__PURE__ */ element('Fieldset', 'fieldset', 'fastui-fieldset')
export const Legend = /* @__PURE__ */ element('Legend', 'legend', 'fastui-legend')
export const Disclosure = /* @__PURE__ */ element('Disclosure', 'details', 'fastui-disclosure')
export const DisclosureTrigger = /* @__PURE__ */ (() => {
  const DisclosureTrigger: FunctionalComponent<ElementProps & { size?: 'xs' | 'sm' }> =
    (props, { attrs, slots }) => h(props.as ?? 'summary', mergeProps(attrs, {
      class: ['fastui-disclosure-trigger', `fastui-disclosure-trigger--${props.size ?? 'sm'}`],
    }), slots.default?.())
  DisclosureTrigger.props = ['as', 'size']
  DisclosureTrigger.inheritAttrs = false
  return DisclosureTrigger
})()
export const List = /* @__PURE__ */ element('List', 'ul')
export const ListItem = /* @__PURE__ */ element('ListItem', 'li')
export const DescriptionList = /* @__PURE__ */ element('DescriptionList', 'dl')
export const Term = /* @__PURE__ */ element('Term', 'dt')
export const Description = /* @__PURE__ */ element('Description', 'dd')
export const Table = /* @__PURE__ */ element('Table', 'table', 'fastui-table')
export const TableHead = /* @__PURE__ */ element('TableHead', 'thead')
export const TableBody = /* @__PURE__ */ element('TableBody', 'tbody')
export const TableRow = /* @__PURE__ */ element('TableRow', 'tr')
export const TableCell = /* @__PURE__ */ element('TableCell', 'td')
export const TableHeader = /* @__PURE__ */ element('TableHeader', 'th')
export const TableCaption = /* @__PURE__ */ element('TableCaption', 'caption')
export const Frame = /* @__PURE__ */ element('Frame', 'iframe')
export const Image = /* @__PURE__ */ element('Image', 'img')
export const DialogSurface = /* @__PURE__ */ element('DialogSurface', 'dialog', 'fastui-dialog')
export const Progress = /* @__PURE__ */ element('Progress', 'progress', 'fastui-progress')
export const Link = /* @__PURE__ */ element('Link', 'a', 'fastui-link')
export const Svg: FunctionalComponent<SVGAttributes> = (_props, { attrs, slots }) => h('svg', attrs, slots.default?.())
export const SvgPath: FunctionalComponent<SVGAttributes> = (_props, { attrs }) => h('path', attrs)

export interface ButtonProps extends ButtonHTMLAttributes {
  variant?: ButtonVariant
  size?: ControlSize
  loading?: boolean
}
export const Button = /* @__PURE__ */ (() => {
  const Button: FunctionalComponent<ButtonProps> = (props, { attrs, slots }) =>
    h('button', mergeProps(attrs, {
      type: props.type ?? 'button', disabled: props.disabled || props.loading,
      'aria-busy': props.loading || undefined,
      class: ['fastui-button', `fastui-button--${props.variant ?? 'secondary'}`, `fastui-button--${props.size ?? 'sm'}`],
    }), slots.default?.())
  Button.props = {
    variant: String as PropType<ButtonVariant>, size: String as PropType<ControlSize>,
    type: String as PropType<ButtonProps['type']>, disabled: Boolean, loading: Boolean,
  }
  Button.inheritAttrs = false
  return Button
})()

export interface ModelProps {
  modelValue?: unknown
  modelModifiers?: { number?: boolean; trim?: boolean; lazy?: boolean }
  'onUpdate:modelValue'?: (value: any) => void
}
export interface TextFieldProps extends Omit<InputHTMLAttributes, 'size'>, ModelProps { size?: ControlSize }
export const TextField = /* @__PURE__ */ (() => {
  const TextField: FunctionalComponent<TextFieldProps> = (props, { attrs }) => {
    const kind = typeof attrs.type === 'string' ? attrs.type : 'text'
    const vnode = h('input', mergeProps(attrs, {
      class: ['fastui-input', `fastui-input--${kind}`, `fastui-input--${props.size ?? 'md'}`],
      'onUpdate:modelValue': props['onUpdate:modelValue'],
    }))
    return props['onUpdate:modelValue'] ? withDirectives(vnode, [
      [vModelDynamic, props.modelValue, undefined, props.modelModifiers ?? {}],
    ]) : vnode
  }
  TextField.props = ['size', 'modelValue', 'modelModifiers', 'onUpdate:modelValue']
  TextField.inheritAttrs = false
  return TextField
})()

export const TextArea = /* @__PURE__ */ (() => {
  const TextArea: FunctionalComponent<TextareaHTMLAttributes & ModelProps> = (props, { attrs }) => {
    const vnode = h('textarea', mergeProps(attrs, {
      class: 'fastui-textarea', 'onUpdate:modelValue': props['onUpdate:modelValue'],
    }))
    return props['onUpdate:modelValue'] ? withDirectives(vnode, [
      [vModelText, props.modelValue, undefined, props.modelModifiers ?? {}],
    ]) : vnode
  }
  TextArea.props = ['modelValue', 'modelModifiers', 'onUpdate:modelValue']
  TextArea.inheritAttrs = false
  return TextArea
})()

export const SelectField = /* @__PURE__ */ (() => {
  const SelectField: FunctionalComponent<SelectHTMLAttributes & ModelProps> = (props, { attrs, slots }) => {
    const vnode = h('select', mergeProps(attrs, {
      class: 'fastui-select', 'onUpdate:modelValue': props['onUpdate:modelValue'],
    }), slots.default?.())
    return props['onUpdate:modelValue'] ? withDirectives(vnode, [
      [vModelSelect, props.modelValue, undefined, props.modelModifiers ?? {}],
    ]) : vnode
  }
  SelectField.props = ['modelValue', 'modelModifiers', 'onUpdate:modelValue']
  SelectField.inheritAttrs = false
  return SelectField
})()
export const SelectOption = /* @__PURE__ */ element('SelectOption', 'option')

export const RichText = /* @__PURE__ */ (() => {
  const RichText: FunctionalComponent<HTMLAttributes & { html: string }> = (props, { attrs }) =>
    h('div', mergeProps(attrs, { innerHTML: props.html }))
  RichText.props = ['html']
  RichText.inheritAttrs = false
  return RichText
})()

export const Section = /* @__PURE__ */ element('Section', 'section', 'fastui-section')
export const StatusBar = /* @__PURE__ */ (() => {
  const StatusBar: FunctionalComponent<ElementProps> = (props, { attrs, slots }) =>
    h(props.as ?? 'div', mergeProps({ role: 'status' }, attrs, { class: 'fastui-statusbar' }), slots.default?.())
  StatusBar.props = ['as']
  StatusBar.inheritAttrs = false
  return StatusBar
})()
export const Divider = /* @__PURE__ */ element('Divider', 'hr', 'fastui-divider')
export const ListRow = /* @__PURE__ */ element('ListRow', 'div', 'fastui-list-row')
