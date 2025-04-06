import { useEffect, useRef } from 'react'

interface HotkeyEvent {
  keys: string[]
  originalEvent: KeyboardEvent
}

interface HotkeyOptions {
  target?: HTMLElement | Window | null
  preventDefault?: boolean
}

export const useHotkey = (
  combination: string,
  callback: (event: HotkeyEvent) => void,
  options: HotkeyOptions = {},
): void => {
  const { target = window, preventDefault = true } = options

  const callbackRef = useRef<(event: HotkeyEvent) => void>(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const keys = combination
    .toLowerCase()
    .split('+')
    .map((key) => key.trim())

  useEffect(() => {
    if (!target) return

    const handleKeyDown = (event: KeyboardEvent): void => {
      const pressedKeys: string[] = []

      if (event.shiftKey) pressedKeys.push('shift')
      if (event.ctrlKey) pressedKeys.push('ctrl')
      if (event.altKey) pressedKeys.push('alt')
      if (event.metaKey) pressedKeys.push('meta')

      const code = event.code.toLowerCase()

      let normalizedKey = ''

      if (code.startsWith('key')) {
        normalizedKey = code.slice(3).toLowerCase()
      } else if (code.startsWith('digit')) {
        normalizedKey = code.slice(5)
      } else if (code === 'bracketright') {
        normalizedKey = ']'
      } else if (code === 'bracketleft') {
        normalizedKey = '['
      } else if (code === 'semicolon') {
        normalizedKey = ';'
      } else if (code === 'quote') {
        normalizedKey = "'"
      } else if (code === 'comma') {
        normalizedKey = ','
      } else if (code === 'period') {
        normalizedKey = '.'
      } else if (code === 'slash') {
        normalizedKey = '/'
      } else if (code === 'backslash') {
        normalizedKey = '\\'
      } else if (code === 'minus') {
        normalizedKey = '-'
      } else if (code === 'equal') {
        normalizedKey = '='
      } else if (code === 'backquote') {
        normalizedKey = '`'
      } else {
        normalizedKey = event.key.toLowerCase()
      }

      if (!['shift', 'control', 'ctrl', 'alt', 'meta'].includes(normalizedKey)) {
        pressedKeys.push(normalizedKey)
      }

      const nonModifierKeys = keys.filter((k) => !['shift', 'ctrl', 'control', 'alt', 'meta'].includes(k))
      const pressedNonModifierKeys = pressedKeys.filter((k) => !['shift', 'ctrl', 'control', 'alt', 'meta'].includes(k))

      const requiredModifiers = {
        shift: keys.includes('shift'),
        ctrl: keys.includes('ctrl') || keys.includes('control'),
        alt: keys.includes('alt'),
        meta: keys.includes('meta'),
      }

      const pressedModifiers = {
        shift: pressedKeys.includes('shift'),
        ctrl: pressedKeys.includes('ctrl') || pressedKeys.includes('control'),
        alt: pressedKeys.includes('alt'),
        meta: pressedKeys.includes('meta'),
      }

      const modifiersMatch =
        requiredModifiers.shift === pressedModifiers.shift &&
        requiredModifiers.ctrl === pressedModifiers.ctrl &&
        requiredModifiers.alt === pressedModifiers.alt &&
        requiredModifiers.meta === pressedModifiers.meta

      const nonModifiersMatch =
        nonModifierKeys.length === pressedNonModifierKeys.length &&
        nonModifierKeys.every((k) => pressedNonModifierKeys.includes(k))

      if (modifiersMatch && nonModifiersMatch) {
        if (preventDefault) {
          event.preventDefault()
        }

        callbackRef.current({
          keys: pressedKeys,
          originalEvent: event,
        })
      }
    }

    target.addEventListener('keydown', handleKeyDown as EventListener)

    return () => {
      target.removeEventListener('keydown', handleKeyDown as EventListener)
    }
  }, [combination, target, preventDefault, keys])
}
