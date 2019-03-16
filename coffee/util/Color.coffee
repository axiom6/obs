
# Needs choma-js

class Color

  #module.exports = Color
  #Color.Palettes = require( 'js/d3d/Palettes' )
  #Color.chroma   = require( 'chroma-js' )

  @rad:( deg ) -> deg * Math.PI / 180
  @deg:( rad ) -> rad * 180 / Math.PI
  @sin:( deg ) -> Math.sin(Color.rad(deg))
  @cos:( deg ) -> Math.cos(Color.rad(deg))

  @rot:( deg, ang ) ->
    a = deg+ang
    a = a + 360 if a < 0
    a

  @toRadian:( h, hueIsRygb=false ) ->
    hue    = if hueIsRygb then Color.toHueRygb(h) else h
    radian = 2*Math.PI*(90-hue)/360  # Correction for MathBox polar coordinate system
    radian = 2*Math.PI + radian if radian < 0
    radian

  @svgDeg:( deg ) -> 360-deg
  @svgRad:( rad ) -> 2*Math.PI-rad

  @radSvg:( deg ) -> Color.rad(360-deg)
  @degSvg:( rad ) -> Color.deg(2*Math.PI-rad)
  @sinSvg:( deg ) -> Math.sin(Color.radSvg(deg))
  @cosSvg:( deg ) -> Math.cos(Color.radSvg(deg))

  # => specified for methods to be used as callbacks
  @chRgbHsl:( h, s, l ) => Color.chroma.hsl( h, s, l ).rgb()
  @chRgbHsv:( h, s, v ) => Color.chroma.hsv( h, s, v ).rgb()
  @chRgbLab:( L, a, b ) => Color.chroma.lab( L, a, b ).rgb()
  @chRgbLch:( L, c, h ) => Color.chroma.lch( l, c, h ).rgb()
  @chRgbHcl:( h, c, l ) => Color.chroma.hsl( h, s, l ).rgb()
  @chRgbCmyk:(c,m,y,k ) => Color.chroma.hsl( c,m,y,k ).rgb()
  @chRgbGl:(  R, G, B ) => Color.chroma.gl(  R, G, B ).rgb()
  
  @toRgbRygb:(r,y,g,b ) => [Math.max(r,y,0),Math.max(g,y,0),Math.max(b,0)]
  @toRygbRgb:(r, g, b ) => [r,Math.max(r,g),g,b] # Needs Work

  @toRgbHsvSigmoidal:( H, C, V, toRygb=true ) ->
    h = if toRygb then Color.toHueRgb(H) else H
    d = C * 0.01
    c = Color.sigmoidal( d, 2, 0.25 )
    v = V * 0.01
    i = Math.floor( h / 60 )
    f = h / 60 - i
    x = 1 - c
    y = 1 - f * c
    z = 1 - (1 - f) * c
    [r,g,b] = switch i % 6
      when 0 then [ 1, z, x, 1 ]
      when 1 then [ y, 1, x, 1 ]
      when 2 then [ x, 1, z, 1 ]
      when 3 then [ x, y, 1, 1 ]
      when 4 then [ z, x, 1, 1 ]
      when 5 then [ 1, x, y, 1 ]
    [ r*v, g*v, b*v, 1 ]

  @toRgbHsv:( H, C, V, toRygb=true ) ->
    h = if toRygb then Color.toHueRgb(H) else H
    c = C * 0.01
    v = V * 0.01
    i = Math.floor( h / 60 )
    f = h / 60 - i
    x = 1 - c
    y = 1 - f * c
    z = 1 - (1 - f) * c
    [r,g,b] = switch i % 6
      when 0 then [ 1, z, x, 1 ]
      when 1 then [ y, 1, x, 1 ]
      when 2 then [ x, 1, z, 1 ]
      when 3 then [ x, y, 1, 1 ]
      when 4 then [ z, x, 1, 1 ]
      when 5 then [ 1, x, y, 1 ]
    [ r*v, g*v, b*v, 1 ]

  # Key algorithm from HCI for converting RGB to HCS  h 360 c 100 s 100
  @toHcsRgb:( R, G, B, toRygb=true  ) =>
    sum = R + G + B
    r = R/sum; g = G/sum; b = B/sum
    s = sum / 3
    c = if R is G and G is B then 0 else 1 - 3 * Math.min(r,g,b) # Center Grayscale
    a = Color.deg( Math.acos( ( r - 0.5*(g+b) ) / Math.sqrt((r-g)*(r-g)+(r-b)*(g-b)) ) )
    h = if b <= g then a else 360 - a
    h = 0 if c is 0
    H = if toRygb then Color.toHueRgb(h) else h
    [ H, c*100, s/2.55 ]

  @toRgbCode:( code ) ->
    str = Color.Palettes.hex(code).replace("#","0x")
    hex = Number.parseInt( str, 16 )
    rgb = Color.hexRgb( hex )
    s = 1 / 256
    [ rgb.r*s, rgb.g*s, rgb.b*s, 1 ]

  @toRgba:( studyPrac ) ->
    if      studyPrac.hsv? and studyPrac.hsv.length is 3
      [h,s,v] = studyPrac.hsv
      Color.toRgbHsvSigmoidal( h, s, v )
    else if studyPrac.fill.length <= 5
      Color.toRgbCode( studyPrac.fill )
    else
      console.error( 'Color.toRgba() unknown fill code', studyPrac.name, studyPrac.fill )
      '#888888'

  @toHsvHex:( hexStr ) ->
    str = hexStr.replace("#","0x")
    hex = Number.parseInt( str, 16 )
    rgb = Color.hexRgb( hex )
    hsv = Color.toHcsRgb( rgb.r, rgb.g, rgb.b )
    hsv

  @toHexRgb:( rgb ) -> rgb[0] * 4026 + rgb[1] * 256 + rgb[2]

  @toCssHex:( hex ) -> """##{hex.toString(16)}""" # For orthogonality

  @toCssHsv1:( hsv ) ->
    rgb = Color.toRgbHsv( hsv[0], hsv[1], hsv[2] )
    hex = Color.toHexRgbSigmoidal( rgb )
    css = """##{hex.toString()}"""
    css

  @toCssHsv2:( hsv ) ->
    rgb = Color.toRgbHsvSigmoidal( hsv[0], hsv[1], hsv[2] )
    css = Color.chroma.gl( rgb[0], rgb[1], rgb[2] ).hex()
    css

  @toHsvCode:( code ) ->
    rgb = Color.toRgbCode(code)
    hsv = Color.toHcsRgb( rgb[0], rgb[1], rgb[2], true )
    hsv[i] = Math.round(hsv[i]) for i in [0...3]
    hsv

  @chRgbHsvStr:( hsv ) ->
    h   = Color.toHueRgb(hsv[0])
    rgb = Color.chRgbHsv( h, hsv[1]*0.01, hsv[2]*0.01 )
    rgb[i] = Math.round(rgb[i]) for i in [0...3]
    """rgba(#{rgb[0]},#{rgb[1]},#{rgb[2]},1)"""

  @toRgbHsvStr:( hsv ) ->
    rgba      = Color.toRgbHsvSigmoidal( hsv[0], hsv[1], hsv[2]*255, true )
    rgba[i]   = Math.round(rgba[i]) for i in [0...3]
    [r,g,b,a] = rgba
    str = """rgba(#{r},#{g},#{b},#{a})"""
    #console.log( "Color.toRgbHsvStr()", {h:hsv[0],s:hsv[1],v:hsv[2]}, str )
    str

  @sigmoidal:( x, k, x0=0.5, L=1 ) ->
    L / ( 1 + Math.exp(-k*(x-x0)) )

  rgbaStr:( rgba ) ->
    n = (f) -> Math.round(f)
    [r,g,b,a] = rgba
    """rgba(#{n(r)},#{n(g)},#{n(b)},#{n(a)})"""

  @toRgbHcs:( H, C, S, toRygb=true ) =>
    h = if toRygb then Color.toHueRgb(H) else H
    c = C*0.01
    s = S*0.01
    x =        1 - c
    y = (a) => 1 + c * Color.cos(h-a) / Color.cos(a+60-h)
    z = (a) => 3 - x - y(a)
    [r,g,b] = [ 0,      0,      0      ]
    [r,g,b] = [ y(0),   z(0),   x      ]  if   0 <= h and h < 120
    [r,g,b] = [ x,      y(120), z(120) ]  if 120 <= h and h < 240
    [r,g,b] = [ z(240), x,      y(240) ]  if 240 <= h and h < 360
    max = Math.max(r,g,b) * s
    v = if max > 255 then s*255/max else s
    [ r*v, g*v, b*v, 1 ]

  @toRgbSphere:( hue, phi, rad ) ->
    Color.toRgbHsv( Color.rot(hue,90), 100*Color.sin(phi), 100*rad )

  @toHclRygb:( r, y, g, b ) =>
    L   = ( r + y + g + b ) / 4
    C   = ( Math.abs(r-y) + Math.abs(y-g) + Math.abs(g-b) + Math.abs(b-r) ) / 4
    H   = Color.angle( r-g, y-b, 0 )
    [H,C,L]

  @sScale:( hue, c, s ) ->
    ss   = 1.0
    m60  = hue %  60
    m120 = hue % 120
    s60  = m60 /  60
    ch   = c   / 100
    ss = if m120 < 60 then 3.0 - 1.5 * s60 else 1.5 + 1.5 * s60
    s * (1-ch) + s * ch * ss

  @sScaleCf:( hue, c, s ) ->
    ss   = sScale( hue, c, s )
    m60  = hue %  60
    m120 = hue % 120
    cosu = (1-Color.cos(   m60))*100.00
    cosd = (1-Color.cos(60-m60))*100.00
    cf = if m120 < 60 then cosu else cosd
    ss - cf

  # ransform RGB to RYGB hue
  @toHueRygb:( hue ) ->
    hRygb = 0
    if        0 <= hue and hue < 120 then hRygb =        hue      * 180 / 120
    else if 120 <= hue and hue < 240 then hRygb = 180 + (hue-120) *  90 / 120
    else if 240 <= hue and hue < 360 then hRygb = 270 + (hue-240) *  90 / 120
    hRygb

  # ransform RyGB to RGB hueT
  @toHueRgb:( hue ) ->
    hRgb = 0
    if        0 <= hue and hue <  90 then hRgb =        hue      *  60 / 90
    else if  90 <= hue and hue < 180 then hRgb =  60 + (hue- 90) *  60 / 90
    else if 180 <= hue and hue < 270 then hRgb = 120 + (hue-180) * 120 / 90
    else if 270 <= hue and hue < 360 then hRgb = 240 + (hue-270) * 120 / 90
    hRgb

  @pad2:( n  ) ->
    s = n.toString()
    if 0 <= n && n <= 9 then  s = '&nbsp;'  + s
    s

  @pad3:( n ) ->
    s = n.toString()
    if  0 <= n && n <= 9 then s = '&nbsp;&nbsp;' + s
    if 10 <= n && n <=99 then s = '&nbsp;'  + s
    #Util.dbg( 'pad', { s:'|'+s+'|', n:n,  } )
    s

  @dec:( f )      -> Math.round(f*100) / 100
  @quotes:( str ) -> '"' + str + '"'

  @within:( beg, deg, end ) -> beg   <= deg and deg <= end # Closed interval with <=
  @isZero:( v )             -> -0.01 <  v   and v   <  0.01

  @floor:( x, dx ) ->  dr = Math.round(dx); Math.floor( x / dr ) * dr
  @ceil:(  x, dx ) ->  dr = Math.round(dx); Math.ceil(  x / dr ) * dr

  @to:( a, a1, a2, b1, b2 ) -> (a-a1) / (a2-a1) * (b2-b1) + b1  # Linear transforms that calculates b from a

  # Need to fully determine if these isZero checks are really necessary. Also need to account for SVG angles
  @angle:( x, y ) ->
    ang = Color.deg(Math.atan2(y,x)) if not @isZero(x) and not @isZero(y)
    ang =   0 if @isZero(x) and @isZero(y)
    ang =   0 if x > 0      and @isZero(y)
    ang =  90 if @isZero(x) and y > 0
    ang = 180 if x < 0      and @isZero(y)
    ang = 270 if @isZero(x) and y < 0
    ang = Color.deg(Math.atan2(y,x))
    ang = if ang < 0 then 360+ang else ang

  @angleSvg:( x, y ) -> Color.angle( x, -y )

  @minRgb:( rgb ) -> Math.min( rgb.r,  rgb.g,  rgb.b )
  @maxRgb:( rgb ) -> Math.max( rgb.r,  rgb.g,  rgb.b )
  @sumRgb:( rgb ) ->           rgb.r + rgb.g + rgb.b

  @hexCss:( hex ) -> """##{hex.toString(16)}""" # For orthogonality
  @rgbCss:( rgb ) -> """rgb(#{rgb.r},#{rgb.g},#{rgb.b})"""
  @hslCss:( hsl ) -> """hsl(#{hsl.h},#{hsl.s*100}%,#{hsl.l*100}%)"""
  @hsiCss:( hsi ) -> Color.hslCss( Color.rgbToHsl( Color.hsiToRgb(hsi) ) )
  @hsvCss:( hsv ) -> Color.hslCss( Color.rgbToHsl( Color.hsvToRgb(hsv) ) )

  @roundRgb:( rgb, f=1.0 ) -> { r:Math.round(rgb.r*f), g:Math.round(rgb.g*f), b:Math.round(rgb.b*f) }
  @roundHsl:( hsl ) -> { h:Math.round(hsl.h), s:Color.dec(hsl.s), l:Color.dec(hsl.l)    }
  @roundHsi:( hsi ) -> { h:Math.round(hsi.h), s:Color.dec(hsi.s), i:Math.round(hsi.i) }
  @roundHsv:( hsv ) -> { h:Math.round(hsv.h), s:Color.dec(hsv.s), v:Color.dec(hsv.v)    }
  @fixedDec:( rgb ) -> { r:Color.dec(rgb.r),    g:Color.dec(rgb.g), b:Color.dec(rgb.b)    }

  @hexRgb:( hex ) -> Color.roundRgb( { r:(hex & 0xFF0000) >> 16, g:(hex & 0x00FF00) >> 8, b:hex & 0x0000FF } )
  @rgbHex:( rgb ) -> rgb.r * 4096 + rgb.g * 256 + rgb.b
  @cssRgb:( str ) ->
    rgb = { r:0, g:0, b:0 }
    if str[0]=='#'
      hex = parseInt( str.substr(1), 16 )
      rgb = Color.hexRgb(hex)
    else if str.slice(0,3)=='rgb'
      toks = str.split(/[\s,\(\)]+/)
      rgb  = Color.roundRgb( { r:parseInt(toks[1]), g:parseInt(toks[2]), b:parseInt(toks[3]) } )
    else if str.slice(0,3)=='hsl'
      toks = str.split(/[\s,\(\)]+/)
      hsl  = { h:parseInt(toks[1]), s:parseInt(toks[2]), l:parseInt(toks[3]) }
      rgb  = Color.hslToRgb(hsl)
    else
      console.error( 'Color.cssRgb() unknown CSS color', str )
    rgb

  # Util.dbg( 'Color.cssRgb', toks.length, { r:toks[1], g:toks[2], b:toks[3] } )

  @rgbToHsi:( rgb ) ->
    sum = Color.sumRgb( rgb )
    r = rgb.r/sum; g = rgb.g/sum; b = rgb.b/sum
    i = sum / 3
    s = 1 - 3 * Math.min(r,g,b)
    a = Color.deg( Math.acos( ( r - 0.5*(g+b) ) / Math.sqrt((r-g)*(r-g)+(r-b)*(g-b)) ) )
    h = if b <= g then a else 360 - a
    Color.roundHsi( { h:h, s:s, i:i } )

  @hsiToRgb:( hsi ) ->
    h = hsi.h; s = hsi.s; i = hsi.i
    x =        1 - s
    y = (a) -> 1 + s * Color.cos(h-a) / Color.cos(a+60-h)
    z = (a) -> 3 - x - y(a)
    rgb = { r:0,      g:0,      b:0      }
    rgb = { r:y(0),   g:z(0),   b:x      }  if   0 <= h && h < 120
    rgb = { r:x,      g:y(120), b:z(120) }  if 120 <= h && h < 240
    rgb = { r:z(240), g:x,      b:y(240) }  if 240 <= h && h < 360
    max = Color.maxRgb(rgb) * i
    fac = if max > 255 then i*255/max else i
    #Util.dbg('Color.hsiToRgb', hsi, Color.roundRgb(rgb,fac), Color.fixedDec(rgb), Color.dec(max) )
    Color.roundRgb( rgb, fac )

  @hsvToRgb:( hsv ) ->
    i = Math.floor( hsv.h / 60 )
    f = hsv.h / 60 - i
    p = hsv.v * (1 - hsv.s)
    q = hsv.v * (1 - f * hsv.s)
    t = hsv.v * (1 - (1 - f) * hsv.s)
    v = hsv.v
    rgb = switch i % 6
      when 0 then { r:v, g:t, b:p }
      when 1 then { r:q, g:v, b:p }
      when 2 then { r:p, g:v, b:t }
      when 3 then { r:p, g:q, b:v }
      when 4 then { r:t, g:p, b:v }
      when 5 then { r:v, g:p, b:q }
      else console.error('Color.hsvToRgb()'); { r:v, g:t, b:p } # Should never happend
    Color.roundRgb( rgb, 255 )

  @rgbToHsv:( rgb ) ->
    rgb = Color.rgbRound( rgb, 1/255 )
    max = Color.maxRgb( rgb )
    min = Color.maxRgb( rgb )
    v   = max
    d   = max - min
    s   = if max == 0 then 0 else d / max
    h   = 0 # achromatic
    if max != min
      h = switch max
        when r
          ( rgb.g - rgb.b ) / d + if g < b then 6 else 0
        when g then  ( rgb.b - rgb.r ) / d + 2
        when b then  ( rgb.r - rgb.g ) / d + 4
        else console.error('Color.rgbToHsv')
    { h:Math.round(h*60), s:Color.dec(s), v:Color.dec(v) }

  @hslToRgb:( hsl ) ->
    h = hsl.h; s = hsl.s; l = hsl.l
    r = 1;     g = 1;     b = 1
    if s != 0
      q = if l < 0.5 then l * (1 + s) else l + s - l * s
      p = 2 * l - q;
      r = Color.hue2rgb(p, q, h+1/3 )
      g = Color.hue2rgb(p, q, h     )
      b = Color.hue2rgb(p, q, h-1/3 )
    { r:Math.round(r*255), g:Math.round(g*255), b:Math.round(b*255) }

  @hue2rgb:( p, q, t ) ->
    if(t < 0     ) then t += 1
    if(t > 1     ) then t -= 1
    if(t < 1 / 6 ) then return p + (q - p) * 6 * t
    if(t < 1 / 2 ) then return q
    if(t < 2 / 3 ) then return p + (q - p) * (2 / 3 - t) * 6
    p

  @rgbsToHsl:( red, green, blue ) ->
    @rgbToHsl( { r:red, g:green, b:blue } )

  @rgbToHsl:( rgb ) ->
    r   = rgb.r / 255; g = rgb.g / 255; b = rgb.b / 255
    max = Math.max( r, g, b )
    min = Math.min( r, g, b )
    h   = 0 # achromatic
    l   = (max + min) / 2
    s   = 0
    if max != min
      d = max - min
      s = if l > 0.5 then d / (2 - max - min) else d / (max + min)
      h = switch max
        when r
          ( g - b ) / d + if g < b then 6 else 0
        when g then ( b - r ) / d + 2
        when b then ( r - g ) / d + 4
        else console.error('Color.@rgbToHsl()'); 0
    { h:Math.round(h*60),  s:Color.dec(s), l:Color.dec(l) }

  ###
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
  ###

export default Color