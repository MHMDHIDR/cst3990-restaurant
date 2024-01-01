/**
 * valid email format
 * @param email email address
 * @returns  boolean if email is valid
 */
export const validEmail = (email: string) => {
  const emailFormat =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+")){3,}@((\[[0-9]{2,3}\.[0-9]{2,3}\.[0-9]{2,3}\.[0-9]{2,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{3,15}))$/

  return email.match(emailFormat) ? true : false
}

export const validPassword = (password: string) => {
  /**
   * regex for password it must contain:
   * - at least one lowercase letter,
   * - one uppercase letter,
   * - one number,
   * - one special character, and at least 8 characters AND maximum of 50 characters
   */
  const passwordFormat =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-_]).{8,50}$/

  return password.match(passwordFormat) ? true : false
}

/**
 * Validates The Phone Number Format (max 11 digits) UK phone number
 * @param phone  phone number
 * @param length  length of phone number
 * @returns  boolean if phone number is valid
 */
export const validPhone = (phone: string, length: number | undefined = 10) => {
  // valid phone number format max 11 digits UK phone number
  const phoneFormat = new RegExp(`^(?:0|\\+?44)(?:\\d\\s?){${length}}$`) // e.g

  return phone.match(phoneFormat) ? true : false
}
