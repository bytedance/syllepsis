import Color from 'color';

const STATIC_COLOR: Record<string, string> = {
  black: '#000000',
  silver: '#C0C0C0',
  gray: '#808080',
  white: '#FFFFFF',
  maroon: '#800000',
  red: '#FF0000',
  purple: '#800080',
  fuchsia: '#FF00FF',
  green: '#008000',
  lime: '#00FF00',
  olive: '#808000',
  yellow: '#FFFF00',
  navy: '#000080',
  blue: '#0000FF',
  teal: '#008080',
  aqua: '#00FFFF',
};

const toHexAlpha = (val: number) => {
  if (val === 1) return '';
  if (!val) return '00';
  return parseInt(`${255 * val}`, 10)
    .toString(16)
    .toUpperCase();
};

// covert color-string to #xxxxxx
const toHex = (_color: string) => {
  try {
    if (STATIC_COLOR[_color]) return STATIC_COLOR[_color];
    const color = Color(_color);
    return color.hex() + toHexAlpha(color.alpha());
  } catch (e) {
    return '';
  }
};

export { toHex };
