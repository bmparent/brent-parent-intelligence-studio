import type { AnchorHTMLAttributes, ButtonHTMLAttributes, CSSProperties, MouseEvent, ReactNode, Ref } from 'react'
import { useRef, useState } from 'react'

type CommonProps = {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'quiet'
  className?: string
}

type AnchorProps = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string
  }

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined
  }

type MagneticButtonProps = AnchorProps | ButtonProps

export function MagneticButton(props: MagneticButtonProps) {
  const { children, variant = 'primary', className = '' } = props
  const ref = useRef<HTMLAnchorElement | HTMLButtonElement | null>(null)
  const [style, setStyle] = useState<CSSProperties>({})

  const updateMagnet = (event: MouseEvent<HTMLElement>) => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left - rect.width / 2
    const y = event.clientY - rect.top - rect.height / 2
    setStyle({ transform: `translate3d(${x * 0.12}px, ${y * 0.18}px, 0)` })
  }

  const reset = () => setStyle({ transform: 'translate3d(0, 0, 0)' })
  const classes = `magnetic-button magnetic-button--${variant} ${className}`

  if ('href' in props && props.href) {
    const anchorProps = { ...props } as AnchorHTMLAttributes<HTMLAnchorElement> & CommonProps
    delete anchorProps.variant
    delete anchorProps.className
    delete anchorProps.children
    return (
      <a
        {...anchorProps}
        ref={ref as Ref<HTMLAnchorElement>}
        href={props.href}
        className={classes}
        style={style}
        onMouseMove={updateMagnet}
        onMouseLeave={reset}
      >
        {children}
      </a>
    )
  }

  const buttonProps = { ...props } as ButtonHTMLAttributes<HTMLButtonElement> & CommonProps
  delete buttonProps.variant
  delete buttonProps.className
  delete buttonProps.children
  return (
    <button
      {...buttonProps}
      ref={ref as Ref<HTMLButtonElement>}
      className={classes}
      style={style}
      onMouseMove={updateMagnet}
      onMouseLeave={reset}
    >
      {children}
    </button>
  )
}
