/**
 *  This function is designed to handle an event onKeyDown [Enter],
 *  and focus on the next input.
 *
 * @param {any} e - onKeyDown event [Enter]
 */

export const focus = (e: any) => {
  const elem =
    e.target.parentElement.parentElement.parentElement.querySelectorAll('label')
  const lastElem = elem[elem.length - 1]
  lastElem.querySelector('#toppingName').focus()
}
