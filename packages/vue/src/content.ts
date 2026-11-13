import { defineComponent, h, mergeProps, ref, withDirectives, vModelCheckbox, type FunctionalComponent, type HTMLAttributes, type InputHTMLAttributes, type ProgressHTMLAttributes, type PropType } from 'vue'
import type { Tone } from './feedback.js'
import type { ElementProps } from './primitives.js'

export interface CardProps extends HTMLAttributes { variant?: 'default' | 'secondary' | 'quiet' }
export const Card = /* @__PURE__ */ (() => {
  const Card: FunctionalComponent<CardProps> = (props, { attrs, slots }) => h('div', mergeProps(attrs, { class: ['fastui-card', `fastui-card--${props.variant ?? 'default'}`] }), slots.default?.())
  Card.props = ['variant']
  Card.inheritAttrs = false
  return Card
})()
function part(name: string, tag: string, className: string): FunctionalComponent<HTMLAttributes> {
  const component: FunctionalComponent<HTMLAttributes> = (_props, { attrs, slots }) => h(tag, mergeProps(attrs, { class: className }), slots.default?.())
  component.displayName = name
  component.inheritAttrs = false
  return component
}
export const CardHeader = /* @__PURE__ */ part('CardHeader', 'div', 'fastui-card-header')
export const CardBody = /* @__PURE__ */ part('CardBody', 'div', 'fastui-card-body')
export const CardFooter = /* @__PURE__ */ part('CardFooter', 'div', 'fastui-card-footer')
export interface AvatarProps extends HTMLAttributes { name: string; src?: string; size?: 'sm' | 'md' | 'lg' }
export const Avatar = /* @__PURE__ */ defineComponent({
  name: 'Avatar', inheritAttrs: false,
  props: { name: { type: String, required: true }, src: String, size: { type: String as PropType<AvatarProps['size']>, default: 'md' } },
  setup(props, { attrs }) {
    const failed = ref<string>()
    return () => {
      const words = props.name.trim().split(/\s+/)
      const initials = words.length > 1 ? `${Array.from(words[0])[0] ?? ''}${Array.from(words.at(-1)!)[0] ?? ''}` : Array.from(props.name.trim())[0] ?? '?'
      return h('span', mergeProps({ role: 'img', 'aria-label': props.name }, attrs, { class: ['fastui-avatar', `fastui-avatar--${props.size}`] }), [
        h('span', { 'aria-hidden': 'true' }, initials.toLocaleUpperCase()),
        props.src && failed.value !== props.src ? h('img', { src: props.src, alt: '', 'aria-hidden': 'true', onError: () => { failed.value = props.src } }) : null,
      ])
    }
  },
})
export interface SwitchProps extends Omit<InputHTMLAttributes, 'type' | 'size'> {
  modelValue?: boolean
  'onUpdate:modelValue'?: (value: boolean) => void
}
export const Switch = /* @__PURE__ */ (() => {
  const Switch: FunctionalComponent<SwitchProps> = (props, { attrs }) => {
    const vnode = h('input', mergeProps(attrs, { type: 'checkbox', role: 'switch', class: 'fastui-switch', 'onUpdate:modelValue': props['onUpdate:modelValue'] }))
    return props['onUpdate:modelValue'] ? withDirectives(vnode, [[vModelCheckbox, props.modelValue]]) : vnode
  }
  Switch.props = ['modelValue', 'onUpdate:modelValue']
  Switch.inheritAttrs = false
  return Switch
})()
export interface ProgressProps extends ProgressHTMLAttributes { label?: string; tone?: Tone; as?: ElementProps['as'] }
export const Progress = /* @__PURE__ */ (() => {
  const Progress: FunctionalComponent<ProgressProps> = (props, { attrs, slots }) => {
    const limit = Number.isFinite(Number(props.max)) && Number(props.max) > 0 ? Number(props.max) : 100
    const amount = props.value === undefined || !Number.isFinite(Number(props.value)) ? undefined : Math.min(limit, Math.max(0, Number(props.value)))
    return h(props.as ?? 'progress', mergeProps(attrs, { 'aria-label': props.label ?? attrs['aria-label'], max: limit, value: amount, class: ['fastui-progress', `fastui-tone-${props.tone ?? 'info'}`] }), slots.default?.())
  }
  Progress.props = ['as', 'label', 'tone', 'max', 'value']
  Progress.inheritAttrs = false
  return Progress
})()
export const Skeleton = /* @__PURE__ */ (() => {
  const Skeleton: FunctionalComponent<HTMLAttributes> = (_props, { attrs }) => h('div', mergeProps(attrs, { 'aria-hidden': 'true', class: 'fastui-skeleton' }))
  Skeleton.inheritAttrs = false
  return Skeleton
})()
export const Kbd = /* @__PURE__ */ part('Kbd', 'kbd', 'fastui-kbd')
