const rgbRegex = /rgb\((.*)\)/i;
const hexRegex = /#[\d|a-z]{3,6}/i;

// rgbToHex convert rgb(0, 0, 0) to #rgba(0, 0, 0, 1)
const rgbToRgba = (color: string) => {
  const split = /\(|\)|,/;
  const result = color.split(split).filter(Boolean);
  return `rgba(${result[0]}, ${result[1]}, ${result[2]}, 1)`;
};

const transToDecimal = (numString: string) => parseInt(numString, 16);

const hexToRgba = (hex: string) => {
  let numReg = /[\d|a-f]{2}/gi;
  if (hex.length < 6) {
    numReg = /[\d|a-f]/g;
  }
  const numbers = [];
  let res;
  while ((res = numReg.exec(hex))) {
    const num = res[0];
    numbers.push(transToDecimal(num.length === 1 ? `${num}${num}` : num));
  }

  return `rgba(${numbers.join(', ')}, 1)`;
};

// toHex sanitize "rgb(0, 0, 0)" | "#000" | "#000000" to "rgba(0, 0, 0, 0)"
const toRgba = (color: string): string | null => {
  if (rgbRegex.test(color)) {
    const result = color.match(rgbRegex);
    if (result) {
      return rgbToRgba(result[1]);
    }
  }
  if (hexRegex.test(color)) {
    return hexToRgba(color);
  }
  return color;
};

export { hexRegex, hexToRgba, rgbRegex, rgbToRgba, toRgba, transToDecimal };
