import {
  defineComponent, h, mergeProps, shallowRef, watch, onMounted, onBeforeUnmount,
  type ShallowRef, type PropType, type FunctionalComponent, type SelectHTMLAttributes,
} from 'vue'
import { syncDialog } from '@fastrd/ui-foundation'
import type { ControlSize } from './primitives.js'

/** Native dialog owns focus containment and restoration, including nested dialogs. */
export function useDialogFocus(
  dialog: ShallowRef<HTMLDialogElement | undefined>, isOpen: () => boolean, close: () => void,
) {
  const sync = () => { if (dialog.value) syncDialog(dialog.value, isOpen()) }
  watch(isOpen, sync, { flush: 'post' })
  onMounted(sync)
  onBeforeUnmount(() => { if (dialog.value) syncDialog(dialog.value, false) })
  function onDialogCancel(event: Event) { event.preventDefault(); close() }
  return { onDialogCancel }
}

export interface ModalProps {
  open: boolean
  label?: string
  labelledby?: string
  size?: 'md' | 'lg' | 'xl'
  dismissible?: boolean
}
export const Modal = /* @__PURE__ */ defineComponent({
  name: 'Modal', inheritAttrs: false,
  props: {
    open: { type: Boolean, required: true }, label: String, labelledby: String,
    size: { type: String as PropType<ModalProps['size']>, default: 'md' },
    dismissible: { type: Boolean, default: true },
  },
  emits: { close: () => true },
  setup(props, { attrs, slots, emit }) {
    const surface = shallowRef<HTMLDialogElement>()
    const close = () => { if (props.dismissible) emit('close') }
    const { onDialogCancel } = useDialogFocus(surface, () => props.open, close)
    let backdropDown = false
    const outside = (event: PointerEvent | MouseEvent) => {
      if (event.target !== surface.value) return false
      const rect = surface.value!.getBoundingClientRect()
      return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom
    }
    return () => h('dialog', mergeProps(attrs, {
      ref: surface, class: ['fastui-dialog', `fastui-dialog--${props.size}`],
      'aria-label': props.label ?? attrs['aria-label'], 'aria-labelledby': props.labelledby ?? attrs['aria-labelledby'],
      onCancel: onDialogCancel,
      onPointerdown: (event: PointerEvent) => { backdropDown = outside(event) },
      onClick: (event: MouseEvent) => { if (backdropDown && outside(event)) close(); backdropDown = false },
    }), props.open ? slots.default?.() : undefined)
  },
})

export interface SelectItem { value: string; label: string; disabled?: boolean }
export interface SelectProps extends Omit<SelectHTMLAttributes, 'value' | 'size' | 'onChange' | 'multiple'> {
  value: string | undefined
  options: readonly SelectItem[]
  placeholder?: string
  size?: ControlSize
  onChange?: (value: string) => void
}
/** Native select provides keyboard navigation, typeahead and mobile pickers. */
export const Select = /* @__PURE__ */ (() => {
  const Select: FunctionalComponent<SelectProps> = (props, { attrs }) =>
    h('select', mergeProps(attrs, {
      class: ['fastui-select', `fastui-select--${props.size ?? 'md'}`],
      value: props.options.some(option => option.value === props.value) ? props.value : '',
      disabled: props.disabled,
      onChange: (event: Event) => {
        const value = (event.target as HTMLSelectElement).value
        if (value !== props.value) props.onChange?.(value)
      },
    }), [
      ...(props.options.some(option => option.value === props.value) ? [] : [h('option', { value: '', disabled: true }, props.placeholder ?? '')]),
      ...props.options.map(option => h('option', { key: option.value, value: option.value, disabled: option.disabled }, option.label)),
    ])
  Select.props = {
    value: String, options: { type: Array as PropType<readonly SelectItem[]>, required: true },
    placeholder: String, size: String as PropType<ControlSize>, disabled: Boolean,
    onChange: Function as PropType<(value: string) => void>,
  }
  Select.inheritAttrs = false
  return Select
})()
