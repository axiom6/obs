// Needs choma-js
var Color;

Color = class Color {
  //module.exports = Color
  //Color.Palettes = require( 'js/d3d/Palettes' )
  //Color.chroma   = require( 'chroma-js' )
  static rad(deg) {
    return deg * Math.PI / 180;
  }

  static deg(rad) {
    return rad * 180 / Math.PI;
  }

  static sin(deg) {
    return Math.sin(Color.rad(deg));
  }

  static cos(deg) {
    return Math.cos(Color.rad(deg));
  }

  static rot(deg, ang) {
    var a;
    a = deg + ang;
    if (a < 0) {
      a = a + 360;
    }
    return a;
  }

  static toRadian(h, hueIsRygb = false) {
    var hue, radian;
    hue = hueIsRygb ? Color.toHueRygb(h) : h;
    radian = 2 * Math.PI * (90 - hue) / 360; // Correction for MathBox polar coordinate system
    if (radian < 0) {
      radian = 2 * Math.PI + radian;
    }
    return radian;
  }

  static svgDeg(deg) {
    return 360 - deg;
  }

  static svgRad(rad) {
    return 2 * Math.PI - rad;
  }

  static radSvg(deg) {
    return Color.rad(360 - deg);
  }

  static degSvg(rad) {
    return Color.deg(2 * Math.PI - rad);
  }

  static sinSvg(deg) {
    return Math.sin(Color.radSvg(deg));
  }

  static cosSvg(deg) {
    return Math.cos(Color.radSvg(deg));
  }

  // => specified for methods to be used as callbacks
  static chRgbHsl(h, s, l) {
    return Color.chroma.hsl(h, s, l).rgb();
  }

  static chRgbHsv(h, s, v) {
    return Color.chroma.hsv(h, s, v).rgb();
  }

  static chRgbLab(L, a, b) {
    return Color.chroma.lab(L, a, b).rgb();
  }

  static chRgbLch(L, c, h) {
    return Color.chroma.lch(l, c, h).rgb();
  }

  static chRgbHcl(h, c, l) {
    return Color.chroma.hsl(h, s, l).rgb();
  }

  static chRgbCmyk(c, m, y, k) {
    return Color.chroma.hsl(c, m, y, k).rgb();
  }

  static chRgbGl(R, G, B) {
    return Color.chroma.gl(R, G, B).rgb();
  }

  static toRgbRygb(r, y, g, b) {
    return [Math.max(r, y, 0), Math.max(g, y, 0), Math.max(b, 0)];
  }

  static toRygbRgb(r, g, b) {
    return [
      r,
      Math.max(r,
      g),
      g,
      b // Needs Work
    ];
  }

  static toRgbHsvSigmoidal(H, C, V, toRygb = true) {
    var b, c, d, f, g, h, i, r, v, x, y, z;
    h = toRygb ? Color.toHueRgb(H) : H;
    d = C * 0.01;
    c = Color.sigmoidal(d, 2, 0.25);
    v = V * 0.01;
    i = Math.floor(h / 60);
    f = h / 60 - i;
    x = 1 - c;
    y = 1 - f * c;
    z = 1 - (1 - f) * c;
    [r, g, b] = (function() {
      switch (i % 6) {
        case 0:
          return [1, z, x, 1];
        case 1:
          return [y, 1, x, 1];
        case 2:
          return [x, 1, z, 1];
        case 3:
          return [x, y, 1, 1];
        case 4:
          return [z, x, 1, 1];
        case 5:
          return [1, x, y, 1];
      }
    })();
    return [r * v, g * v, b * v, 1];
  }

  static toRgbHsv(H, C, V, toRygb = true) {
    var b, c, f, g, h, i, r, v, x, y, z;
    h = toRygb ? Color.toHueRgb(H) : H;
    c = C * 0.01;
    v = V * 0.01;
    i = Math.floor(h / 60);
    f = h / 60 - i;
    x = 1 - c;
    y = 1 - f * c;
    z = 1 - (1 - f) * c;
    [r, g, b] = (function() {
      switch (i % 6) {
        case 0:
          return [1, z, x, 1];
        case 1:
          return [y, 1, x, 1];
        case 2:
          return [x, 1, z, 1];
        case 3:
          return [x, y, 1, 1];
        case 4:
          return [z, x, 1, 1];
        case 5:
          return [1, x, y, 1];
      }
    })();
    return [r * v, g * v, b * v, 1];
  }

  // Key algorithm from HCI for converting RGB to HCS  h 360 c 100 s 100
  static toHcsRgb(R, G, B, toRygb = true) {
    var H, a, b, c, g, h, r, s, sum;
    sum = R + G + B;
    r = R / sum;
    g = G / sum;
    b = B / sum;
    s = sum / 3;
    c = R === G && G === B ? 0 : 1 - 3 * Math.min(r, g, b); // Center Grayscale
    a = Color.deg(Math.acos((r - 0.5 * (g + b)) / Math.sqrt((r - g) * (r - g) + (r - b) * (g - b))));
    h = b <= g ? a : 360 - a;
    if (c === 0) {
      h = 0;
    }
    H = toRygb ? Color.toHueRgb(h) : h;
    return [H, c * 100, s / 2.55];
  }

  static toRgbCode(code) {
    var hex, rgb, s, str;
    str = Color.Palettes.hex(code).replace("#", "0x");
    hex = Number.parseInt(str, 16);
    rgb = Color.hexRgb(hex);
    s = 1 / 256;
    return [rgb.r * s, rgb.g * s, rgb.b * s, 1];
  }

  static toRgba(studyPrac) {
    var h, s, v;
    if ((studyPrac.hsv != null) && studyPrac.hsv.length === 3) {
      [h, s, v] = studyPrac.hsv;
      return Color.toRgbHsvSigmoidal(h, s, v);
    } else if (studyPrac.fill.length <= 5) {
      return Color.toRgbCode(studyPrac.fill);
    } else {
      console.error('Color.toRgba() unknown fill code', studyPrac.name, studyPrac.fill);
      return '#888888';
    }
  }

  static toHsvHex(hexStr) {
    var hex, hsv, rgb, str;
    str = hexStr.replace("#", "0x");
    hex = Number.parseInt(str, 16);
    rgb = Color.hexRgb(hex);
    hsv = Color.toHcsRgb(rgb.r, rgb.g, rgb.b);
    return hsv;
  }

  static toHexRgb(rgb) {
    return rgb[0] * 4026 + rgb[1] * 256 + rgb[2];
  }

  static toCssHex(hex) {
    return `#${hex.toString(16) // For orthogonality
}`;
  }

  static toCssHsv1(hsv) {
    var css, hex, rgb;
    rgb = Color.toRgbHsv(hsv[0], hsv[1], hsv[2]);
    hex = Color.toHexRgbSigmoidal(rgb);
    css = `#${hex.toString()}`;
    return css;
  }

  static toCssHsv2(hsv) {
    var css, rgb;
    rgb = Color.toRgbHsvSigmoidal(hsv[0], hsv[1], hsv[2]);
    css = Color.chroma.gl(rgb[0], rgb[1], rgb[2]).hex();
    return css;
  }

  static toHsvCode(code) {
    var hsv, i, j, rgb;
    rgb = Color.toRgbCode(code);
    hsv = Color.toHcsRgb(rgb[0], rgb[1], rgb[2], true);
    for (i = j = 0; j < 3; i = ++j) {
      hsv[i] = Math.round(hsv[i]);
    }
    return hsv;
  }

  static chRgbHsvStr(hsv) {
    var h, i, j, rgb;
    h = Color.toHueRgb(hsv[0]);
    rgb = Color.chRgbHsv(h, hsv[1] * 0.01, hsv[2] * 0.01);
    for (i = j = 0; j < 3; i = ++j) {
      rgb[i] = Math.round(rgb[i]);
    }
    return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},1)`;
  }

  static toRgbHsvStr(hsv) {
    var a, b, g, i, j, r, rgba, str;
    rgba = Color.toRgbHsvSigmoidal(hsv[0], hsv[1], hsv[2] * 255, true);
    for (i = j = 0; j < 3; i = ++j) {
      rgba[i] = Math.round(rgba[i]);
    }
    [r, g, b, a] = rgba;
    str = `rgba(${r},${g},${b},${a})`;
    //console.log( "Color.toRgbHsvStr()", {h:hsv[0],s:hsv[1],v:hsv[2]}, str )
    return str;
  }

  static sigmoidal(x, k, x0 = 0.5, L = 1) {
    return L / (1 + Math.exp(-k * (x - x0)));
  }

  rgbaStr(rgba) {
    var a, b, g, n, r;
    n = function(f) {
      return Math.round(f);
    };
    [r, g, b, a] = rgba;
    return `rgba(${n(r)},${n(g)},${n(b)},${n(a)})`;
  }

  static toRgbHcs(H, C, S, toRygb = true) {
    var b, c, g, h, max, r, s, v, x, y, z;
    h = toRygb ? Color.toHueRgb(H) : H;
    c = C * 0.01;
    s = S * 0.01;
    x = 1 - c;
    y = (a) => {
      return 1 + c * Color.cos(h - a) / Color.cos(a + 60 - h);
    };
    z = (a) => {
      return 3 - x - y(a);
    };
    [r, g, b] = [0, 0, 0];
    if (0 <= h && h < 120) {
      [r, g, b] = [y(0), z(0), x];
    }
    if (120 <= h && h < 240) {
      [r, g, b] = [x, y(120), z(120)];
    }
    if (240 <= h && h < 360) {
      [r, g, b] = [z(240), x, y(240)];
    }
    max = Math.max(r, g, b) * s;
    v = max > 255 ? s * 255 / max : s;
    return [r * v, g * v, b * v, 1];
  }

  static toRgbSphere(hue, phi, rad) {
    return Color.toRgbHsv(Color.rot(hue, 90), 100 * Color.sin(phi), 100 * rad);
  }

  static toHclRygb(r, y, g, b) {
    var C, H, L;
    L = (r + y + g + b) / 4;
    C = (Math.abs(r - y) + Math.abs(y - g) + Math.abs(g - b) + Math.abs(b - r)) / 4;
    H = Color.angle(r - g, y - b, 0);
    return [H, C, L];
  }

  static sScale(hue, c, s) {
    var ch, m120, m60, s60, ss;
    ss = 1.0;
    m60 = hue % 60;
    m120 = hue % 120;
    s60 = m60 / 60;
    ch = c / 100;
    ss = m120 < 60 ? 3.0 - 1.5 * s60 : 1.5 + 1.5 * s60;
    return s * (1 - ch) + s * ch * ss;
  }

  static sScaleCf(hue, c, s) {
    var cf, cosd, cosu, m120, m60, ss;
    ss = sScale(hue, c, s);
    m60 = hue % 60;
    m120 = hue % 120;
    cosu = (1 - Color.cos(m60)) * 100.00;
    cosd = (1 - Color.cos(60 - m60)) * 100.00;
    cf = m120 < 60 ? cosu : cosd;
    return ss - cf;
  }

  // ransform RGB to RYGB hue
  static toHueRygb(hue) {
    var hRygb;
    hRygb = 0;
    if (0 <= hue && hue < 120) {
      hRygb = hue * 180 / 120;
    } else if (120 <= hue && hue < 240) {
      hRygb = 180 + (hue - 120) * 90 / 120;
    } else if (240 <= hue && hue < 360) {
      hRygb = 270 + (hue - 240) * 90 / 120;
    }
    return hRygb;
  }

  // ransform RyGB to RGB hueT
  static toHueRgb(hue) {
    var hRgb;
    hRgb = 0;
    if (0 <= hue && hue < 90) {
      hRgb = hue * 60 / 90;
    } else if (90 <= hue && hue < 180) {
      hRgb = 60 + (hue - 90) * 60 / 90;
    } else if (180 <= hue && hue < 270) {
      hRgb = 120 + (hue - 180) * 120 / 90;
    } else if (270 <= hue && hue < 360) {
      hRgb = 240 + (hue - 270) * 120 / 90;
    }
    return hRgb;
  }

  static pad2(n) {
    var s;
    s = n.toString();
    if (0 <= n && n <= 9) {
      s = '&nbsp;' + s;
    }
    return s;
  }

  static pad3(n) {
    var s;
    s = n.toString();
    if (0 <= n && n <= 9) {
      s = '&nbsp;&nbsp;' + s;
    }
    if (10 <= n && n <= 99) {
      s = '&nbsp;' + s;
    }
    //Util.dbg( 'pad', { s:'|'+s+'|', n:n,  } )
    return s;
  }

  static dec(f) {
    return Math.round(f * 100) / 100;
  }

  static quotes(str) {
    return '"' + str + '"';
  }

  static within(beg, deg, end) {
    return beg <= deg && deg <= end; // Closed interval with <=
  }

  static isZero(v) {
    return -0.01 < v && v < 0.01;
  }

  static floor(x, dx) {
    var dr;
    dr = Math.round(dx);
    return Math.floor(x / dr) * dr;
  }

  static ceil(x, dx) {
    var dr;
    dr = Math.round(dx);
    return Math.ceil(x / dr) * dr;
  }

  static to(a, a1, a2, b1, b2) {
    return (a - a1) / (a2 - a1) * (b2 - b1) + b1; // Linear transforms that calculates b from a
  }

  
  // Need to fully determine if these isZero checks are really necessary. Also need to account for SVG angles
  static angle(x, y) {
    var ang;
    if (!this.isZero(x) && !this.isZero(y)) {
      ang = Color.deg(Math.atan2(y, x));
    }
    if (this.isZero(x) && this.isZero(y)) {
      ang = 0;
    }
    if (x > 0 && this.isZero(y)) {
      ang = 0;
    }
    if (this.isZero(x) && y > 0) {
      ang = 90;
    }
    if (x < 0 && this.isZero(y)) {
      ang = 180;
    }
    if (this.isZero(x) && y < 0) {
      ang = 270;
    }
    ang = Color.deg(Math.atan2(y, x));
    return ang = ang < 0 ? 360 + ang : ang;
  }

  static angleSvg(x, y) {
    return Color.angle(x, -y);
  }

  static minRgb(rgb) {
    return Math.min(rgb.r, rgb.g, rgb.b);
  }

  static maxRgb(rgb) {
    return Math.max(rgb.r, rgb.g, rgb.b);
  }

  static sumRgb(rgb) {
    return rgb.r + rgb.g + rgb.b;
  }

  static hexCss(hex) {
    return `#${hex.toString(16) // For orthogonality
}`;
  }

  static rgbCss(rgb) {
    return `rgb(${rgb.r},${rgb.g},${rgb.b})`;
  }

  static hslCss(hsl) {
    return `hsl(${hsl.h},${hsl.s * 100}%,${hsl.l * 100}%)`;
  }

  static hsiCss(hsi) {
    return Color.hslCss(Color.rgbToHsl(Color.hsiToRgb(hsi)));
  }

  static hsvCss(hsv) {
    return Color.hslCss(Color.rgbToHsl(Color.hsvToRgb(hsv)));
  }

  static roundRgb(rgb, f = 1.0) {
    return {
      r: Math.round(rgb.r * f),
      g: Math.round(rgb.g * f),
      b: Math.round(rgb.b * f)
    };
  }

  static roundHsl(hsl) {
    return {
      h: Math.round(hsl.h),
      s: Color.dec(hsl.s),
      l: Color.dec(hsl.l)
    };
  }

  static roundHsi(hsi) {
    return {
      h: Math.round(hsi.h),
      s: Color.dec(hsi.s),
      i: Math.round(hsi.i)
    };
  }

  static roundHsv(hsv) {
    return {
      h: Math.round(hsv.h),
      s: Color.dec(hsv.s),
      v: Color.dec(hsv.v)
    };
  }

  static fixedDec(rgb) {
    return {
      r: Color.dec(rgb.r),
      g: Color.dec(rgb.g),
      b: Color.dec(rgb.b)
    };
  }

  static hexRgb(hex) {
    return Color.roundRgb({
      r: (hex & 0xFF0000) >> 16,
      g: (hex & 0x00FF00) >> 8,
      b: hex & 0x0000FF
    });
  }

  static rgbHex(rgb) {
    return rgb.r * 4096 + rgb.g * 256 + rgb.b;
  }

  static cssRgb(str) {
    var hex, hsl, rgb, toks;
    rgb = {
      r: 0,
      g: 0,
      b: 0
    };
    if (str[0] === '#') {
      hex = parseInt(str.substr(1), 16);
      rgb = Color.hexRgb(hex);
    } else if (str.slice(0, 3) === 'rgb') {
      toks = str.split(/[\s,\(\)]+/);
      rgb = Color.roundRgb({
        r: parseInt(toks[1]),
        g: parseInt(toks[2]),
        b: parseInt(toks[3])
      });
    } else if (str.slice(0, 3) === 'hsl') {
      toks = str.split(/[\s,\(\)]+/);
      hsl = {
        h: parseInt(toks[1]),
        s: parseInt(toks[2]),
        l: parseInt(toks[3])
      };
      rgb = Color.hslToRgb(hsl);
    } else {
      console.error('Color.cssRgb() unknown CSS color', str);
    }
    return rgb;
  }

  // Util.dbg( 'Color.cssRgb', toks.length, { r:toks[1], g:toks[2], b:toks[3] } )
  static rgbToHsi(rgb) {
    var a, b, g, h, i, r, s, sum;
    sum = Color.sumRgb(rgb);
    r = rgb.r / sum;
    g = rgb.g / sum;
    b = rgb.b / sum;
    i = sum / 3;
    s = 1 - 3 * Math.min(r, g, b);
    a = Color.deg(Math.acos((r - 0.5 * (g + b)) / Math.sqrt((r - g) * (r - g) + (r - b) * (g - b))));
    h = b <= g ? a : 360 - a;
    return Color.roundHsi({
      h: h,
      s: s,
      i: i
    });
  }

  static hsiToRgb(hsi) {
    var fac, h, i, max, rgb, s, x, y, z;
    h = hsi.h;
    s = hsi.s;
    i = hsi.i;
    x = 1 - s;
    y = function(a) {
      return 1 + s * Color.cos(h - a) / Color.cos(a + 60 - h);
    };
    z = function(a) {
      return 3 - x - y(a);
    };
    rgb = {
      r: 0,
      g: 0,
      b: 0
    };
    if (0 <= h && h < 120) {
      rgb = {
        r: y(0),
        g: z(0),
        b: x
      };
    }
    if (120 <= h && h < 240) {
      rgb = {
        r: x,
        g: y(120),
        b: z(120)
      };
    }
    if (240 <= h && h < 360) {
      rgb = {
        r: z(240),
        g: x,
        b: y(240)
      };
    }
    max = Color.maxRgb(rgb) * i;
    fac = max > 255 ? i * 255 / max : i;
    //Util.dbg('Color.hsiToRgb', hsi, Color.roundRgb(rgb,fac), Color.fixedDec(rgb), Color.dec(max) )
    return Color.roundRgb(rgb, fac);
  }

  static hsvToRgb(hsv) {
    var f, i, p, q, rgb, t, v;
    i = Math.floor(hsv.h / 60);
    f = hsv.h / 60 - i;
    p = hsv.v * (1 - hsv.s);
    q = hsv.v * (1 - f * hsv.s);
    t = hsv.v * (1 - (1 - f) * hsv.s);
    v = hsv.v;
    rgb = (function() {
      switch (i % 6) {
        case 0:
          return {
            r: v,
            g: t,
            b: p
          };
        case 1:
          return {
            r: q,
            g: v,
            b: p
          };
        case 2:
          return {
            r: p,
            g: v,
            b: t
          };
        case 3:
          return {
            r: p,
            g: q,
            b: v
          };
        case 4:
          return {
            r: t,
            g: p,
            b: v
          };
        case 5:
          return {
            r: v,
            g: p,
            b: q
          };
        default:
          console.error('Color.hsvToRgb()');
          return {
            r: v,
            g: t,
            b: p // Should never happend
          };
      }
    })();
    return Color.roundRgb(rgb, 255);
  }

  static rgbToHsv(rgb) {
    var d, h, max, min, s, v;
    rgb = Color.rgbRound(rgb, 1 / 255);
    max = Color.maxRgb(rgb);
    min = Color.maxRgb(rgb);
    v = max;
    d = max - min;
    s = max === 0 ? 0 : d / max;
    h = 0; // achromatic
    if (max !== min) {
      h = (function() {
        switch (max) {
          case r:
            return (rgb.g - rgb.b) / d + (g < b ? 6 : 0);
          case g:
            return (rgb.b - rgb.r) / d + 2;
          case b:
            return (rgb.r - rgb.g) / d + 4;
          default:
            return console.error('Color.rgbToHsv');
        }
      })();
    }
    return {
      h: Math.round(h * 60),
      s: Color.dec(s),
      v: Color.dec(v)
    };
  }

  static hslToRgb(hsl) {
    var b, g, h, l, p, q, r, s;
    h = hsl.h;
    s = hsl.s;
    l = hsl.l;
    r = 1;
    g = 1;
    b = 1;
    if (s !== 0) {
      q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      p = 2 * l - q;
      r = Color.hue2rgb(p, q, h + 1 / 3);
      g = Color.hue2rgb(p, q, h);
      b = Color.hue2rgb(p, q, h - 1 / 3);
    }
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  static hue2rgb(p, q, t) {
    if (t < 0) {
      t += 1;
    }
    if (t > 1) {
      t -= 1;
    }
    if (t < 1 / 6) {
      return p + (q - p) * 6 * t;
    }
    if (t < 1 / 2) {
      return q;
    }
    if (t < 2 / 3) {
      return p + (q - p) * (2 / 3 - t) * 6;
    }
    return p;
  }

  static rgbsToHsl(red, green, blue) {
    return this.rgbToHsl({
      r: red,
      g: green,
      b: blue
    });
  }

  static rgbToHsl(rgb) {
    var b, d, g, h, l, max, min, r, s;
    r = rgb.r / 255;
    g = rgb.g / 255;
    b = rgb.b / 255;
    max = Math.max(r, g, b);
    min = Math.min(r, g, b);
    h = 0; // achromatic
    l = (max + min) / 2;
    s = 0;
    if (max !== min) {
      d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = (function() {
        switch (max) {
          case r:
            return (g - b) / d + (g < b ? 6 : 0);
          case g:
            return (b - r) / d + 2;
          case b:
            return (r - g) / d + 4;
          default:
            console.error('Color.@rgbToHsl()');
            return 0;
        }
      })();
    }
    return {
      h: Math.round(h * 60),
      s: Color.dec(s),
      l: Color.dec(l)
    };
  }

};

/*
dec2hex:( i ) ->
result = "0x000000"
if      i >= 0     and i <=      15 then result = "0x00000" + i.toString(16)
else if i >= 16    and i <=     255 then result = "0x0000" + i.toString(16)
else if i >= 256   and i <=    4095 then result = "0x000" + i.toString(16)
else if i >= 4096  and i <=   65535 then result = "0x00" + i.toString(16)
else if i >= 65535 and i <= 1048575 then result = "0x0" + i.toString(16)
else if i >= 1048575                then result = "0x" + i.toString(16)
result

var setCursor = function (icon) {
var tempElement = document.createElement("i");
tempElement.className = icon;
document.body.appendChild(tempElement);
var character = window.getComputedStyle(
    document.querySelector('.' + icon), ':before'
).getPropertyValue('content');
tempElement.remove();
*/
export default Color;
