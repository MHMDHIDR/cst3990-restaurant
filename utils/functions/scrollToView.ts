const scrollToView = (scrollY: number | undefined = 500) =>
  setTimeout(
    () =>
      window.scrollTo({
        top: scrollY ?? (document.querySelector(`#hero`) as HTMLElement)?.offsetHeight, // ==> window.scrollY / 3
        behavior: 'smooth'
      }),
    100
  )

export default scrollToView
