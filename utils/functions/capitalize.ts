declare global {
  interface String {
    capitalizeText(): string
  }
}

/**
 * @param text a function that returns text string to capitalize,
 *  (e.g: hey How arE YoU ThiS is TeXt => Hey How Are You This Is Text)
 * @returns string
 */
String.prototype.capitalizeText = function () {
  return this.replace(/\b\w+\b/g, word => {
    if (word === word.toUpperCase()) {
      return word
    } else {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    }
  })
}

export const capitalizeText = (text: string = '') => text.capitalizeText()
