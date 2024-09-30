/**
 * @example
 * parseStringNumber('1.250,49') // 1250.49
 */
export const parseStringNumber = (value: string) => {
  const [preComma, posComma] = value.split(',')
  return Number(`${preComma.replaceAll('.', '')}.${posComma}`)
}

export function parseCentsToDecimal(cents: number) {
  return cents / 100
}
