import express from 'express';
import cors from 'cors';

const rgbPattern = /^rgb\(\s*(1\d\d|25[0-5]|2[0-4]\d|[1-9]?\d)\s*,\s*(1\d\d|25[0-5]|2[0-4]\d|[1-9]?\d)\s*,\s*(1\d\d|25[0-5]|2[0-4]\d|[1-9]?\d)\s*\)$/;
const hexPattern = /^#?([0-9a-f]{3})([0-9a-f]{3})?$/;
const hslPattern = /^hsl\(\s*([1-2]\d\d|3[0-5]\d|[1-9]?\d)\s*,\s*((?:100|[1-9]\d|\d)%)\s*,\s*((?:100|[1-9]\d|\d)%)\s*\)$/;
const numberHex = '0123456789abcdef';

function numberToHex(number) {
  const roundedNumber = Math.round(number);
  const secondDigit = roundedNumber % 16;
  const firstDigit = (roundedNumber - secondDigit) / 16;
  return numberHex[firstDigit] + numberHex[secondDigit];
}

function convertFromHexToHex(color) {
  const hexColor = hexPattern.exec(color);
  if (hexColor[2]) {
    return `#${hexColor[1][0]}${hexColor[1][1]}${hexColor[1][2]}${hexColor[2][0]}${hexColor[2][1]}${hexColor[2][2]}`;
  }
  return `#${hexColor[1][0]}${hexColor[1][0]}${hexColor[1][1]}${hexColor[1][1]}${hexColor[1][2]}${hexColor[1][2]}`;
}

function convertFromRGBToHex(color) {
  const RGBColor = rgbPattern.exec(color);
  return `#${numberToHex(RGBColor[1])}${numberToHex(RGBColor[2])}${numberToHex(RGBColor[3])}`;
}

function getFractionalFromPercent(number) {
  if (number.indexOf('%') !== -1) {
    return Number(number.slice(0, -1)) / 100;
  }
  return Number(number);
}

function convertFromHSLToHex(color) {
  const HSLColor = hslPattern.exec(color);
  const c = (1 - Math.abs((getFractionalFromPercent(HSLColor[3]) * 2) - 1))
    * getFractionalFromPercent(HSLColor[2]);
  const hs = Number(HSLColor[1]) / 60;
  const x = c * (1 - Math.abs((hs % 2) - 1));
  const m = getFractionalFromPercent(HSLColor[3]) - (c / 2);

  let r1 = 0;
  let g1 = 0;
  let b1 = 0;
  if (hs >= 0 && hs < 1) {
    r1 = c;
    g1 = x;
  }
  if (hs >= 1 && hs < 2) {
    r1 = x;
    g1 = c;
  }
  if (hs >= 2 && hs < 3) {
    b1 = x;
    g1 = c;
  }
  if (hs >= 3 && hs < 4) {
    b1 = c;
    g1 = x;
  }
  if (hs >= 4 && hs < 5) {
    r1 = x;
    b1 = c;
  }
  if (hs >= 5 && hs < 6) {
    r1 = c;
    b1 = x;
  }
  return `#${numberToHex((r1 + m) * 255)}${numberToHex((g1 + m) * 255)}${numberToHex((b1 + m) * 255)}`;
}

function getHexColor(color) {
  if (!color) {
    return 'Invalid color';
  }
  const formattedColor = color.replace(/%20/g, ' ').trim().toLowerCase();
  if (hexPattern.test(formattedColor)) {
    return convertFromHexToHex(formattedColor);
  }
  if (rgbPattern.test(formattedColor)) {
    return convertFromRGBToHex(formattedColor);
  }
  if (hslPattern.test(formattedColor)) {
    return convertFromHSLToHex(formattedColor);
  }
  return 'Invalid color';
}

const app = express();
app.use(cors());
app.get('/', (req, res) => {
  res.send(getHexColor(req.query.color));
});

app.listen(3000, () => {
});
