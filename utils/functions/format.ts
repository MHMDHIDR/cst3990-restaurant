/**
 *  Method That Formats Date to Locale Date String
 * @param date  - date string to be formatted (e.g. 2021-08-01T12:00:00.000Z)
 * @returns   - formatted date string (e.g. Sunday, 1 August 2021, 13:00:00)
 */
export const createLocaleDateString = (date: string) =>
  new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  })

/**
 * Method That Formats price to GBP
 * @param price - price to be formatted (e.g. 1000)
 * @returns     - formatted price string (e.g. £10.00)
 * */

export const formattedPrice = (price: number) => {
  const formatter = new Intl.NumberFormat('en-gb', {
    style: 'currency',
    currency: 'GBP'
  })

  return formatter.format(price)
}
