/**
 * A function to format the price to the currency
 * @param price the price to be formatted
 * @returns the formatted price
 * */
export const formattedPrice = (price: number, maximumFractionDigits: number = 0) => {
  const formatter = new Intl.NumberFormat('en-gb', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits
  })

  return formatter.format(price)
}
