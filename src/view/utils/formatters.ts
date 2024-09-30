export function formatCEST(value: string) {
  const digits = value.replace(/\D/g, '')
  const match = digits.match(/^(\d{0,2})(\d{0,3})(\d{0,2})/)

  if (!match) return value

  const [, a, b, c] = match

  if (a.length === 0) return value
  if (b.length === 0) return `${a}`
  if (c.length === 0) return `${a}.${b}`

  return `${a}.${b}.${c}`
}

export function formatNCM(value: string) {
  const digits = value.replace(/\D/g, '')
  const match = digits.match(/^(\d{0,4})(\d{0,2})(\d{0,2})/)

  if (!match) return value

  const [, a, b, c] = match

  if (a.length === 0) return value
  if (b.length === 0) return `${a}`
  if (c.length === 0) return `${a}.${b}`

  return `${a}.${b}.${c}`
}

export function formatDecimal(value: string) {
  const format = (numStr: string) => {
    if (numStr === '') return ''

    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(+numStr / 100)
  }

  return format(value.replace(/\D/g, ''))
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}
