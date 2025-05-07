import { useEffect, useState, forwardRef, ElementRef } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useDebounce } from 'use-debounce'

import { Button } from '@/view/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/view/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/view/components/ui/popover'

import { cn } from '@/view/lib/utils'

interface Option {
  label: string
  value: string
}

interface ComboboxProps {
  placeholder: string
  searchPlaceholder: string
  emptyPlaceholder: string
  value?: Option
  options: Option[]
  onSelectOption: (option: Option) => void
  onChangeFilter: (search: string) => void
}

export const Combobox = forwardRef<ElementRef<typeof PopoverTrigger>, ComboboxProps>(
  ({ placeholder, searchPlaceholder, emptyPlaceholder, value, options, onSelectOption, onChangeFilter }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const [search] = useDebounce(inputValue, 250)

    useEffect(() => {
      onChangeFilter(search)
    }, [search])

    return (
      <Popover open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <PopoverTrigger ref={ref} asChild onKeyDown={(e) => e.stopPropagation()}>
          <Button variant="outline" role="combobox" aria-expanded={isOpen} className="w-full justify-between">
            {!value ? placeholder : (options.find((item) => item.value === value.value)?.label ?? '')}

            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" onKeyDown={(e) => e.stopPropagation()}>
          <Command shouldFilter={false}>
            <CommandInput placeholder={searchPlaceholder} value={inputValue} onValueChange={setInputValue} />
            <CommandList>
              <CommandEmpty>{emptyPlaceholder}</CommandEmpty>

              <CommandGroup>
                {options.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    onSelect={(currentValue) => {
                      const product = options.find((item) => item.value === currentValue)

                      if (!product) return

                      onSelectOption(product)
                      setIsOpen(false)
                    }}
                  >
                    <Check className={cn('mr-2 h-4 w-4', value?.value === item.value ? 'opacity-100' : 'opacity-0')} />

                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  },
)
Combobox.displayName = 'Combobox'
