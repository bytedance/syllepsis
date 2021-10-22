const calculateShowLeft = (dom: HTMLElement, mountDOM: HTMLElement) => {
  const domWidth = dom.clientWidth;
  const mountRect = mountDOM.getBoundingClientRect();
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

  if (mountRect.left < 0) return -mountRect.left;
  if (mountRect.left + domWidth < viewportWidth) return 0;

  return -(domWidth - (viewportWidth - mountRect.left));
};

export { calculateShowLeft };
