export const isNumber = (value: any) => {
  return typeof value === 'number' && !isNaN(value) && value > 0
}
