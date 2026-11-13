import { forwardRef, useState, type HTMLAttributes, type InputHTMLAttributes, type ProgressHTMLAttributes } from 'react'
import type { Tone } from './index.js'

const classes = (...values: (string | undefined)[]) => values.filter(Boolean).join(' ')
export interface CardProps extends HTMLAttributes<HTMLDivElement> { variant?: 'default' | 'secondary' | 'quiet' }
export const Card = /* @__PURE__ */ forwardRef<HTMLDivElement, CardProps>(function Card({ variant = 'default', className, ...props }, ref) {
  return <div {...props} ref={ref} className={classes('fastui-card', `fastui-card--${variant}`, className)} />
})
export const CardHeader = /* @__PURE__ */ forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardHeader({ className, ...props }, ref) {
  return <div {...props} ref={ref} className={classes('fastui-card-header', className)} />
})
export const CardBody = /* @__PURE__ */ forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardBody({ className, ...props }, ref) {
  return <div {...props} ref={ref} className={classes('fastui-card-body', className)} />
})
export const CardFooter = /* @__PURE__ */ forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardFooter({ className, ...props }, ref) {
  return <div {...props} ref={ref} className={classes('fastui-card-footer', className)} />
})

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg'
}
export const Avatar = /* @__PURE__ */ forwardRef<HTMLSpanElement, AvatarProps>(function Avatar({ name, src, size = 'md', className, ...props }, ref) {
  const [failed, setFailed] = useState<string>()
  const words = name.trim().split(/\s+/)
  const initials = words.length > 1 ? `${Array.from(words[0])[0] ?? ''}${Array.from(words.at(-1)!)[0] ?? ''}` : Array.from(name.trim())[0] ?? '?'
  return <span role="img" aria-label={name} {...props} ref={ref} className={classes('fastui-avatar', `fastui-avatar--${size}`, className)}>
    <span aria-hidden="true">{initials.toLocaleUpperCase()}</span>
    {src && failed !== src && <img src={src} alt="" aria-hidden="true" onError={() => setFailed(src)} />}
  </span>
})

export type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'>
/** Native checkbox semantics preserve forms, reset, labels and Space key behavior. */
export const Switch = /* @__PURE__ */ forwardRef<HTMLInputElement, SwitchProps>(function Switch({ className, ...props }, ref) {
  return <input {...props} ref={ref} type="checkbox" role="switch" className={classes('fastui-switch', className)} />
})

export interface ProgressProps extends ProgressHTMLAttributes<HTMLProgressElement> { label?: string; tone?: Tone }
export const Progress = /* @__PURE__ */ forwardRef<HTMLProgressElement, ProgressProps>(function Progress({ label, tone = 'info', max = 100, value, className, ...props }, ref) {
  const limit = Number.isFinite(Number(max)) && Number(max) > 0 ? Number(max) : 100
  const amount = value === undefined || !Number.isFinite(Number(value)) ? undefined : Math.min(limit, Math.max(0, Number(value)))
  return <progress {...props} ref={ref} aria-label={label ?? props['aria-label']} max={limit} value={amount} className={classes('fastui-progress', `fastui-tone-${tone}`, className)} />
})
export const Skeleton = /* @__PURE__ */ forwardRef<HTMLDivElement, Omit<HTMLAttributes<HTMLDivElement>, 'children'>>(function Skeleton({ className, ...props }, ref) {
  return <div {...props} ref={ref} aria-hidden="true" className={classes('fastui-skeleton', className)} />
})
export const Kbd = /* @__PURE__ */ forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function Kbd({ className, ...props }, ref) {
  return <kbd {...props} ref={ref} className={classes('fastui-kbd', className)} />
})
