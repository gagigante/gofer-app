import { FiPlus, FiMinus } from 'react-icons/fi'

import { Button } from '@/view/components/ui/button'

interface QuantityPickerProps {
  value: number
  onChange: (value: number) => void
}

const MIN = 1

export function QuantityPicker({ value, onChange }: QuantityPickerProps) {
  return (
    <div className="flex items-center h-10">
      <Button size="sm" onClick={() => onChange(value - 1)} disabled={value === MIN}>
        <FiMinus />
      </Button>

      <input
        className="w-14 h-10 text-center bg-background"
        type="number"
        value={value}
        min={MIN}
        onChange={(e) => {
          onChange(Number(e.target.value))
        }}
      />

      <Button size="sm" onClick={() => onChange(value + 1)}>
        <FiPlus />
      </Button>
    </div>
  )
}
