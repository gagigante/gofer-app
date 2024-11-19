import { useEffect, useState } from 'react'

export function useBarcode() {
  const [barcode, setBarcode] = useState('')

  useEffect(() => {
    let buffer = ''
    let timeout: NodeJS.Timeout

    const handleKeyDown = (event: KeyboardEvent) => {
      clearTimeout(timeout)
      if (event.key === 'Enter') {
        // Barcode scan complete (assuming Enter key is the delimiter)
        if (buffer) {
          setBarcode(buffer)
          buffer = ''
        }
      } else {
        buffer += event.key
        timeout = setTimeout(() => (buffer = ''), 500)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      clearTimeout(timeout)
    }
  }, [])

  function clearBarcodeState() {
    setBarcode('')
  }

  return { barcode, clearBarcodeState }
}
