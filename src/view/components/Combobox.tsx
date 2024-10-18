import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { Button } from "@/view/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/view/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/view/components/ui/popover"

import { cn } from "@/view/lib/utils"
import { debounce } from "@/view/utils/debounce"

interface Option { label: string, value: string }

interface ComboboxProps {
  placeholder: string
  searchPlaceholder: string
  emptyPlaceholder: string
  value?: Option
  options: Option[]
  onSelectOption: (product: Option) => void
  onChangeFilter: (search: string) => void
}

export function Combobox({ 
  placeholder,
  searchPlaceholder,
  emptyPlaceholder,
  value,
  options,
  onSelectOption,
  onChangeFilter,
}: ComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState('')

  function handleChangeFilter(filter: string) {
    setFilter(filter)
    onChangeFilter(filter) // TODO: debounce callback
  }

  return (
    <Popover open={isOpen} onOpenChange={open => setIsOpen(open)}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"          
          role="combobox"
          aria-expanded={isOpen}
          className="w-full justify-between"
        >
          {value
            ? options.find((item) => item.value === value.value)?.label
            : placeholder}

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}>
          <CommandInput placeholder={searchPlaceholder} value={filter} onValueChange={handleChangeFilter} />
          <CommandList>
            <CommandEmpty>{emptyPlaceholder}</CommandEmpty>
            
            <CommandGroup>
              {options.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    const product = options.find(item => item.value === currentValue)
                    
                    if (!product) return

                    onSelectOption(product)                    
                    setIsOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value?.value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />

                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}