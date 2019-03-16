
import Util     from '../util/Util.js'
import FaLookup from '../util/FaLookup.js'

class Vis

  @translate:( x0, y0 ) ->
    Util.checkTypes('number',{x0:x0,y0:y0})
    " translate( #{x0}, #{y0} )"

  @scale:( sx, sy )  ->
    Util.checkTypes('number',{sx:sx,sy:sy})
    " scale( #{sx}, #{sy} )"

  @rotate:( a, x, y ) ->
    Util.checkTypes('number',{a:a,x:x,y:y})
    " rotate(#{a} #{x} #{y} )"
  
  @rad:( deg ) -> deg * Math.PI / 180
  @deg:( rad ) -> rad * 180 / Math.PI
  @sin:( deg ) -> Math.sin(Vis.rad(deg))
  @cos:( deg ) -> Math.cos(Vis.rad(deg))

  @rot:( deg, ang ) ->
    a = deg+ang
    a = a + 360 if a < 0
    a

  @toRadian:( h, hueIsRygb=false ) ->
    hue    = if hueIsRygb then Vis.toHueRygb(h) else h
    radian = 2*Math.PI*(90-hue)/360  # Correction for MathBox polar coordinate system
    radian = 2*Math.PI + radian if radian < 0
    radian

  @svgDeg:( deg ) -> 360-deg
  @svgRad:( rad ) -> 2*Math.PI-rad

  @radSvg:( deg ) -> Vis.rad(360-deg)
  @degSvg:( rad ) -> Vis.deg(2*Math.PI-rad)
  @sinSvg:( deg ) -> Math.sin(Vis.radSvg(deg))
  @cosSvg:( deg ) -> Math.cos(Vis.radSvg(deg))

  @hexCss:( hex ) -> """##{hex.toString(16)}""" # For orthogonality
  @rgbCss:( rgb ) -> """rgb(#{rgb.r},#{rgb.g},#{rgb.b})"""
  @hslCss:( hsl ) -> """hsl(#{hsl.h},#{hsl.s*100}%,#{hsl.l*100}%)"""

  @cssHex:( str ) -> parseInt( str.substr(1), 16 )

  @rndRgb:( rgb ) -> { r:Math.round(rgb.r), g:Math.round(rgb.g), b:Math.round(rgb.b) }
  @hexRgb:( hex ) -> Vis.rndRgb( { r:(hex & 0xFF0000) >> 16, g:(hex & 0x00FF00) >> 8, b:hex & 0x0000FF } )
  @rgbHex:( rgb ) -> rgb.r * 4096 + rgb.g * 256 + rgb.b

  @interpolateHexRgb:( hex1, r1, hex2, r2 ) ->
    Vis.interpolateRgb( Vis.hexRgb(hex1), r1, Vis.hexRgb(hex2), r2 )

  @interpolateRgb:( rgb1, r1, rgb2, r2 ) ->
    { r:rgb1.r * r1 + rgb2.r * r2, g:rgb1.g * r1 + rgb2.g * r2, b:rgb1.b * r1 + rgb2.b * r2 }

  @toRgbHsvStr:( hsv ) ->
    rgba      = Vis.toRgbHsvSigmoidal( hsv[0], hsv[1], hsv[2]*255, true )
    rgba[i]   = Math.round(rgba[i]) for i in [0...3]
    [r,g,b,a] = rgba
    str = """rgba(#{r},#{g},#{b},#{a})"""
    #console.log( "Vis.toRgbHsvStr()", {h:hsv[0],s:hsv[1],v:hsv[2]}, str )
    str

  @toRgbHsv:( H, C, V, toRygb=true ) ->
    Vis.toRgbHsvSigmoidal( H, C, V, toRygb )

  @toRgbHsvSigmoidal:( H, C, V, toRygb=true ) ->
    h = if toRygb then Vis.toHueRgb(H) else H
    d = C * 0.01
    c = Vis.sigmoidal( d, 2, 0.25 )
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
      else console.error('Vis.hsvToRgb()'); { r:v, g:t, b:p } # Should never happend
    Vis.roundRgb( rgb, 255 )

  @roundRgb:( rgb, f=1.0 ) -> { r:Math.round(rgb.r*f), g:Math.round(rgb.g*f), b:Math.round(rgb.b*f) }

  @sigmoidal:( x, k, x0=0.5, L=1 ) ->
    L / ( 1 + Math.exp(-k*(x-x0)) )

  # ransform RyGB to RGB hueT
  @toHueRgb:( hue ) ->
    hRgb = 0
    if        0 <= hue and hue <  90 then hRgb =        hue      *  60 / 90
    else if  90 <= hue and hue < 180 then hRgb =  60 + (hue- 90) *  60 / 90
    else if 180 <= hue and hue < 270 then hRgb = 120 + (hue-180) * 120 / 90
    else if 270 <= hue and hue < 360 then hRgb = 240 + (hue-270) * 120 / 90
    hRgb

  @toRgba:( study ) ->
    hsv = if study.hsv? then study.hsv else [90,90,90]
    Vis.toRgbHsv( hsv[0], hsv[1], hsv[2] )

  @toRgbSphere:( hue, phi, rad ) ->
    Vis.toRgbHsv( Vis.rot(hue,90), 100*Vis.sin(phi), 100*rad )

  # Key algorithm from HCI for converting RGB to HCS  h 360 c 100 s 100
  @toHcsRgb:( R, G, B, toRygb=true  ) =>
    sum = R + G + B
    r = R/sum; g = G/sum; b = B/sum
    s = sum / 3
    c = if R is G and G is B then 0 else 1 - 3 * Math.min(r,g,b) # Center Grayscale
    a = Vis.deg( Math.acos( ( r - 0.5*(g+b) ) / Math.sqrt((r-g)*(r-g)+(r-b)*(g-b)) ) )
    h = if b <= g then a else 360 - a
    h = 0 if c is 0
    H = if toRygb then Vis.toHueRgb(h) else h
    [ H, c*100, s/2.55 ]

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
    cosu = (1-Vis.cos(   m60))*100.00
    cosd = (1-Vis.cos(60-m60))*100.00
    cf = if m120 < 60 then cosu else cosd
    ss - cf

  @floor:( x, dx ) ->  dr = Math.round(dx); Math.floor( x / dr ) * dr
  @ceil:(  x, dx ) ->  dr = Math.round(dx); Math.ceil(  x / dr ) * dr
  @within:( beg, deg, end ) -> beg   <= deg and deg <= end # Closed interval with <=
  @isZero:( v )             -> -0.01 <  v   and v   <  0.01

  @unicode:( icon ) ->
    uc    = FaLookup.icons[icon]
    if not uc?
      console.error( 'Vis.unicode() missing icon in Vis.FontAwesomeUnicodes for', icon )
      uc = "\uf111" # Circle
    uc

  @uniawe:( icon ) ->
    temp = document.createElement("i")
    temp.className = icon
    document.body.appendChild(temp)
    uni = window.getComputedStyle( document.querySelector('.' + icon), ':before' ).getPropertyValue('content')
    console.log( 'uniawe', icon, uni )
    temp.remove()
    uni

export default Vis