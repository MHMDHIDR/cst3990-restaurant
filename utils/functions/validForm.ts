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
  const passwordFormat = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-_]).{8,}$/

  return password.match(passwordFormat) ? true : false
}

export const validPhone = (phone: string, length: number | undefined = 10) => {
  // valid phone number format max 11 digits UK phone number
  const phoneFormat = new RegExp(`^(?:0|\\+?44)(?:\\d\\s?){${length}}$`) // e.g 07712345678

  return phone.match(phoneFormat) ? true : false
}
