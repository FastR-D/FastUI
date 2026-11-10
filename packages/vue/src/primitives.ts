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

export const Box = element('Box', 'div')
export const Text = element('Text', 'span')
export const Heading = element('Heading', 'h2', 'fastui-heading')
export const Panel = element('Panel', 'section')
export const ModalBody = element('ModalBody', 'div', 'fastui-modal-body')
export const Header = element('Header', 'header')
export const Footer = element('Footer', 'footer')
export const Nav = element('Nav', 'nav')
export const Aside = element('Aside', 'aside')
export const Main = element('Main', 'main')
export const Article = element('Article', 'article')
export const Form = element('Form', 'form')
export const Field = element('Field', 'label', 'fastui-field')
export const Fieldset = element('Fieldset', 'fieldset', 'fastui-fieldset')
export const Legend = element('Legend', 'legend', 'fastui-legend')
export const Disclosure = element('Disclosure', 'details', 'fastui-disclosure')
export const DisclosureTrigger: FunctionalComponent<ElementProps & { size?: 'xs' | 'sm' }> =
  (props, { attrs, slots }) => h(props.as ?? 'summary', mergeProps(attrs, {
    class: ['fastui-disclosure-trigger', `fastui-disclosure-trigger--${props.size ?? 'sm'}`],
  }), slots.default?.())
DisclosureTrigger.props = ['as', 'size']
DisclosureTrigger.inheritAttrs = false
export const List = element('List', 'ul')
export const ListItem = element('ListItem', 'li')
export const DescriptionList = element('DescriptionList', 'dl')
export const Term = element('Term', 'dt')
export const Description = element('Description', 'dd')
export const Table = element('Table', 'table', 'fastui-table')
export const TableHead = element('TableHead', 'thead')
export const TableBody = element('TableBody', 'tbody')
export const TableRow = element('TableRow', 'tr')
export const TableCell = element('TableCell', 'td')
export const TableHeader = element('TableHeader', 'th')
export const TableCaption = element('TableCaption', 'caption')
export const Frame = element('Frame', 'iframe')
export const Image = element('Image', 'img')
export const DialogSurface = element('DialogSurface', 'dialog', 'fastui-dialog')
export const Progress = element('Progress', 'progress', 'fastui-progress')
export const Link = element('Link', 'a', 'fastui-link')
export const Svg: FunctionalComponent<SVGAttributes> = (_props, { attrs, slots }) => h('svg', attrs, slots.default?.())
export const SvgPath: FunctionalComponent<SVGAttributes> = (_props, { attrs }) => h('path', attrs)

export interface ButtonProps extends ButtonHTMLAttributes {
  variant?: ButtonVariant
  size?: ControlSize
  loading?: boolean
}
export const Button: FunctionalComponent<ButtonProps> = (props, { attrs, slots }) =>
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

export interface ModelProps {
  modelValue?: unknown
  modelModifiers?: { number?: boolean; trim?: boolean; lazy?: boolean }
  'onUpdate:modelValue'?: (value: any) => void
}
export interface TextFieldProps extends Omit<InputHTMLAttributes, 'size'>, ModelProps { size?: ControlSize }
export const TextField: FunctionalComponent<TextFieldProps> = (props, { attrs }) => {
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

export const TextArea: FunctionalComponent<TextareaHTMLAttributes & ModelProps> = (props, { attrs }) => {
  const vnode = h('textarea', mergeProps(attrs, {
    class: 'fastui-textarea', 'onUpdate:modelValue': props['onUpdate:modelValue'],
  }))
  return props['onUpdate:modelValue'] ? withDirectives(vnode, [
    [vModelText, props.modelValue, undefined, props.modelModifiers ?? {}],
  ]) : vnode
}
TextArea.props = ['modelValue', 'modelModifiers', 'onUpdate:modelValue']
TextArea.inheritAttrs = false

export const SelectField: FunctionalComponent<SelectHTMLAttributes & ModelProps> = (props, { attrs, slots }) => {
  const vnode = h('select', mergeProps(attrs, {
    class: 'fastui-select', 'onUpdate:modelValue': props['onUpdate:modelValue'],
  }), slots.default?.())
  return props['onUpdate:modelValue'] ? withDirectives(vnode, [
    [vModelSelect, props.modelValue, undefined, props.modelModifiers ?? {}],
  ]) : vnode
}
SelectField.props = ['modelValue', 'modelModifiers', 'onUpdate:modelValue']
SelectField.inheritAttrs = false
export const SelectOption = element('SelectOption', 'option')

export const RichText: FunctionalComponent<HTMLAttributes & { html: string }> = (props, { attrs }) =>
  h('div', mergeProps(attrs, { innerHTML: props.html }))
RichText.props = ['html']
RichText.inheritAttrs = false
