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

export function formatCPF(value: string) {
  if (!value) return ''

  const docDigits = value.replace(/\D/g, '')
  const formatted = docDigits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')

  return formatted
}

export function formatCNPJ(cnpj: string) {
  if (!cnpj) return ''

  const docDigits = cnpj.replace(/\D/g, '')
  const formatted = docDigits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')

  return formatted
}

export function formatRG(rg: string) {
  if (!rg) return ''

  const docDigits = rg.replace(/\D/g, '')
  const formatted = docDigits.replace(/^(\d{2})(\d{3})(\d{3})(\d)$/, '$1.$2.$3-$4')

  return formatted
}

export function formatPhone(phone: string) {
  if (!phone) return ''

  const docDigits = phone.replace(/\D/g, '')

  if (docDigits.length === 11) {
    return docDigits.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
  }

  return docDigits.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
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

export function formatDecimal(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function maskFinancialValue(value: string) {
  if (!value || typeof value !== 'string') {
    return '**'
  }

  if (value.includes('R$')) {
    return 'R$ **'
  }

  return '**'
}
