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

  // Store callback in ref to avoid recreating the listener on callback changes
  const callbackRef = useRef<(event: HotkeyEvent) => void>(callback)

  // Update ref when callback changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // Parse key combination
  const keys = combination
    .toLowerCase()
    .split('+')
    .map((key) => key.trim())

  useEffect(() => {
    if (!target) return

    const handleKeyDown = (event: KeyboardEvent): void => {
      // Create an array of currently pressed keys
      const pressedKeys: string[] = []

      // Add modifier keys if they are pressed
      if (event.shiftKey) pressedKeys.push('shift')
      if (event.ctrlKey) pressedKeys.push('ctrl')
      if (event.altKey) pressedKeys.push('alt')
      if (event.metaKey) pressedKeys.push('meta')

      // Use the key's code property for reliable key detection regardless of modifier state
      const code = event.code.toLowerCase()

      // Map the code to a more readable key if possible
      let normalizedKey = ''

      // Handle common keys with simple mapping
      if (code.startsWith('key')) {
        // KeyA -> a, KeyB -> b, etc.
        normalizedKey = code.slice(3).toLowerCase()
      } else if (code.startsWith('digit')) {
        // Digit1 -> 1, Digit2 -> 2, etc.
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
        // For other keys, just use the key property in lowercase
        normalizedKey = event.key.toLowerCase()
      }

      // Don't add modifier keys twice
      if (!['shift', 'control', 'ctrl', 'alt', 'meta'].includes(normalizedKey)) {
        pressedKeys.push(normalizedKey)
      }

      // Check if all required keys are pressed and no extra keys
      const nonModifierKeys = keys.filter((k) => !['shift', 'ctrl', 'control', 'alt', 'meta'].includes(k))
      const pressedNonModifierKeys = pressedKeys.filter((k) => !['shift', 'ctrl', 'control', 'alt', 'meta'].includes(k))

      // Check for modifiers
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

      // Check if modifiers match
      const modifiersMatch =
        requiredModifiers.shift === pressedModifiers.shift &&
        requiredModifiers.ctrl === pressedModifiers.ctrl &&
        requiredModifiers.alt === pressedModifiers.alt &&
        requiredModifiers.meta === pressedModifiers.meta

      // Check if non-modifier keys match
      const nonModifiersMatch =
        nonModifierKeys.length === pressedNonModifierKeys.length &&
        nonModifierKeys.every((k) => pressedNonModifierKeys.includes(k))

      if (modifiersMatch && nonModifiersMatch) {
        if (preventDefault) {
          event.preventDefault()
        }

        // Call the callback with event data
        callbackRef.current({
          keys: pressedKeys,
          originalEvent: event,
        })
      }
    }

    // Attach event listener
    target.addEventListener('keydown', handleKeyDown as EventListener)

    // Cleanup function
    return () => {
      target.removeEventListener('keydown', handleKeyDown as EventListener)
    }
  }, [combination, target, preventDefault, keys])
}
