import {
  forwardRef, useCallback, useEffect, useLayoutEffect, useRef,
  type ButtonHTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes,
  type SelectHTMLAttributes, type DialogHTMLAttributes, type HTMLAttributes, type ReactNode,
} from 'react'
import { syncDialog } from '@fastrd/ui-foundation'

export type ControlSize = 'xs' | 'sm' | 'md'
export type ButtonVariant = 'primary' | 'secondary' | 'quiet' | 'icon' | 'navigation' | 'danger'
const classes = (...values: (string | undefined)[]) => values.filter(Boolean).join(' ')
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ControlSize
  loading?: boolean
}
export const Button = /* @__PURE__ */ forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'sm', loading, disabled, type = 'button', className, ...props }, ref,
) {
  return <button {...props} ref={ref} type={type} disabled={disabled || loading} aria-busy={loading || undefined}
    className={classes('fastui-button', `fastui-button--${variant}`, `fastui-button--${size}`, className)} />
})
export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: ControlSize
  htmlSize?: number
}
export const TextField = /* @__PURE__ */ forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { size = 'md', htmlSize, className, ...props }, ref,
) {
  return <input {...props} ref={ref} size={htmlSize} className={classes('fastui-input', `fastui-input--${size}`, className)} />
})
export const TextArea = /* @__PURE__ */ forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function TextArea(
  { className, ...props }, ref,
) { return <textarea {...props} ref={ref} className={classes('fastui-textarea', className)} /> })
export const Checkbox = /* @__PURE__ */ forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>>(function Checkbox(
  { className, ...props }, ref,
) { return <input {...props} type="checkbox" ref={ref} className={classes('fastui-input', className)} /> })
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> { size?: ControlSize }
export const Select = /* @__PURE__ */ forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { size = 'md', className, ...props }, ref,
) { return <select {...props} ref={ref} className={classes('fastui-select', `fastui-select--${size}`, className)} /> })

export interface DialogProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, 'open' | 'onClose'> {
  open: boolean
  onClose: () => void
  label?: string
  labelledby?: string
  size?: 'md' | 'lg' | 'xl'
  dismissible?: boolean
}
const useBrowserLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect
export const Dialog = /* @__PURE__ */ forwardRef<HTMLDialogElement, DialogProps>(function Dialog(
  { open, onClose, label, labelledby, size = 'md', dismissible = true, className,
    onCancel, onClick, onPointerDown, ...props }, forwardedRef,
) {
  const surface = useRef<HTMLDialogElement | null>(null)
  const backdropDown = useRef(false)
  const refCleanup = useRef<(() => void) | void>(undefined)
  const setSurface = useCallback((element: HTMLDialogElement | null) => {
    surface.current = element
    if (typeof forwardedRef === 'function') {
      if (element) refCleanup.current = forwardedRef(element)
      else if (typeof refCleanup.current === 'function') {
        refCleanup.current()
        refCleanup.current = undefined
      } else forwardedRef(null)
    } else if (forwardedRef) forwardedRef.current = element
  }, [forwardedRef])
  useBrowserLayoutEffect(() => {
    const element = surface.current!
    syncDialog(element, open)
    return () => syncDialog(element, false)
  }, [open])
  const outside = (event: { target: EventTarget; clientX: number; clientY: number }) => {
    if (event.target !== surface.current) return false
    const rect = surface.current!.getBoundingClientRect()
    return event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom
  }
  return <dialog {...props} ref={setSurface} className={classes('fastui-dialog', `fastui-dialog--${size}`, className)}
    aria-label={label ?? props['aria-label']} aria-labelledby={labelledby ?? props['aria-labelledby']}
    onCancel={event => {
      if (event.target !== event.currentTarget) return
      onCancel?.(event)
      event.preventDefault()
      if (dismissible) onClose()
    }}
    onPointerDown={event => { onPointerDown?.(event); backdropDown.current = outside(event) }}
    onClick={event => {
      onClick?.(event)
      if (!event.defaultPrevented && backdropDown.current && outside(event) && dismissible) onClose()
      backdropDown.current = false
    }}>{open ? props.children : null}</dialog>
})

export type Tone = 'info' | 'success' | 'warning' | 'danger'
export interface FeedbackProps extends HTMLAttributes<HTMLDivElement> { tone?: Tone }
export function Alert({ tone = 'info', className, role, ...props }: FeedbackProps) {
  return <div {...props} role={role ?? (tone === 'danger' ? 'alert' : 'status')}
    className={classes('fastui-alert', `fastui-tone-${tone}`, className)} />
}
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> { tone?: Tone }
export function Badge({ tone = 'info', className, ...props }: BadgeProps) {
  return <span {...props} className={classes('fastui-badge', `fastui-tone-${tone}`, className)} />
}
export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title: string
  action?: ReactNode
}
export function EmptyState({ title, action, children, className, ...props }: EmptyStateProps) {
  return <div {...props} className={classes('fastui-empty', className)}><h2>{title}</h2>{children}{action}</div>
}
export function Loading({ label = 'Loading', className, ...props }: HTMLAttributes<HTMLSpanElement> & { label?: string }) {
  return <span {...props} role="status" className={classes('fastui-loading', className)}><span className="fastui-spinner" aria-hidden="true" />{label}</span>
}

export * from './workbench.js'
