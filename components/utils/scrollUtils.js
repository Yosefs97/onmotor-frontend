export const scrollToBottomOfElement = (elementRef, delay = 350) => {
  if (elementRef?.current) {
    setTimeout(() => {
      elementRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }, delay);
  }
};
