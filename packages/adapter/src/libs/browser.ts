const result = {
  mac: false,
  ie: false,
  gecko: false,
  chrome: false,
  ios: false,
  android: false,
  webkit: false,
  safari: false
};

if (typeof navigator !== 'undefined' && typeof document !== 'undefined') {
  const ieEdge = /Edge\/(\d+)/.exec(navigator.userAgent);
  const ieUpTo10 = /MSIE \d/.test(navigator.userAgent);
  const ie11Up = /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(
    navigator.userAgent
  );

  result.mac = /Mac/.test(navigator.platform);
  const ie = (result.ie = !!(ieUpTo10 || ie11Up || ieEdge));
  result.gecko = !ie && /gecko\/(\d+)/i.test(navigator.userAgent);
  const chrome = !ie && /Chrome\/(\d+)/.exec(navigator.userAgent);
  result.chrome = !!chrome;
  result.ios =
    !ie &&
    /AppleWebKit/.test(navigator.userAgent) &&
    /Mobile\/\w+/.test(navigator.userAgent);
  result.android = /Android \d/.test(navigator.userAgent);
  result.webkit = !ie && 'WebkitAppearance' in document.documentElement.style;
  result.safari = /Apple Computer/.test(navigator.vendor);
}

export { result as browser };
