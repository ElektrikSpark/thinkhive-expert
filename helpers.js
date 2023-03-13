export const isMobile = () => window.innerWidth <= 600;
export const isTablet = () =>
  window.innerWidth > 600 && window.innerWidth < 768;
export const isDesktop = () => window.innerWidth >= 768;
export const isPortraitMode = () => window.innerHeight > window.innerWidth;
