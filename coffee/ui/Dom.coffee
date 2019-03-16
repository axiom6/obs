
import Util    from '../util/Util.js'
import UI      from '../ui/UI.js'

class Dom

  Dom.opacity = 1.0

  constructor:() ->
    @choiceColor = "yellow"
    @hoverColor  = "wheat"
    @basisColor  = "black"
    Util.noop( Dom.onChoice, Dom.horz, Dom.vertBtns, Dom.hasJQueryPlugin, Dom.isEmptyElem )

  @element:( $elem ) ->
    # console.log( 'Dom.element()', $elem, Dom.isJQueryElem( $elem ) )
    if Dom.isJQueryElem( $elem )
      $elem.get(0)
    else if Util.isStr( $elem )
      $($elem).get(0)
    else
      console.error('Dom.domElement( $elem )', typeof($elem), $elem,
        '$elem is neither jQuery object nor selector' )
      $().get(0)

  @isJQueryElem:( $elem ) ->
    $? and $elem? and ( $elem instanceof $ || 'jquery' in Object($elem) )

  @isEmptyElem:( $elem ) ->
    $elem?.length is 0


  # ------ Tag Attributes ------

  @klass:( name ) ->
    #console.log( 'Dom.klass()', { name:name } )
    """class="#{name}" """

  @htmlId:( name, type, ext="" ) ->
    """id="#{Util.htmlId( name, type, ext )}" """

  @style:( ...props ) ->
    css  = ""
    css += prop + ' ' for prop in props
    """style="#{css}" """

  # ------ CSS Propterties ------

  @position:( x, y, w, h, pos="absolute", uom="%" ) ->
    """position:#{pos}; left:#{x}#{uom}; top:#{y}#{uom}; width:#{w}#{uom}; height:#{h}#{uom}; """

  @margin:( l, t, r, b ) ->
    """margin:#{t} #{r} #{b} #{l}; """ # Uoms supplies in args

  @padding:( l, t, r, b ) ->
    """padding:#{t} #{r} #{b} #{l}; """ # Uoms supplies in args

  @border:( color, thick ) ->
    """border:solid #{color} #{thick} """

  # ------ Html Constructs ------

  @panel:( x, y, w, h, align="center" ) ->
    """class="panel" style="position:relative; left:#{x}%; top:#{y}%; width:#{w}%; height:#{h}%; text-align:#{align};" """

  @label:( x, y, w, h, klass="label" ) ->
    """class="#{klass}" style="position:absolute; left:#{x}%; top:#{y}%; width:#{w}%; height:#{h}%; text-align:center;" """

  @image:( src, mh, mw, label="", radius="6px" ) ->
    tstyle  = "justify-self:center; align-self:center; font-size:#{mh*0.1}vh; padding-top:3px;"
    tstyle +=  "padding-top:3px;" if src?
    htm  = """<div class="dom-wrapp" style="display:grid; width:100%; height:100%;">"""
    htm += """<img class="dom-image" style="justify-self:center; align-self:center; max-height:#{mh}%; max-width:#{mw}%; border-radius:#{radius};" src="#{src}"/>""" if src?
    htm += """<div class="dom-label" style="#{tstyle}">#{label}</div>"""  if Util.isStr(label)
    htm += """</div>"""
    htm

  @branch:( x, y, w, h, label="" ) ->
    htm  = """<div class="branch" style="position:absolute; left:#{x}%; top:#{y}%; width:#{w}%; height:#{h}%; display:table;">"""
    htm += """<div style="">#{label}</div>"""  if Util.isStr(label)
    htm += """</div>"""
    htm

  @img:( src ) ->
    """<div class="img" style="display:table-cell; vertical-align:middle;"><img style="display:block; margin-left:auto; margin-right:auto;" src="#{src}"/></div>"""

  @txt:( str ) ->
    """<div class="txt"">#{str}</div>"""

  @doClick:( stream, widget, spec, key, study, event  ) ->
    Util.noop( event )
    $e = widget.btns[key].$e
    if study?.chosen
      study.chosen = false
      $e.css( { color:Dom.basisColor } )
      $e.find("button").removeClass( "btn-nice-active")
      choice = UI.toTopic( spec.name, spec.name, UI.DelChoice, key ) # spec.name and source are the same
      stream.publish( 'Choice', choice )
    else
      study.chosen = true
      $e.css( { color:Dom.choiceColor } )
      $e.find("button").addClass( "btn-nice-active" )
      choice = UI.toTopic( spec.name, spec.name, UI.AddChoice, key ) # spec.name and source are the same
      stream.publish( 'Choice', choice )
    #console.log( 'Dom.doClick', choice )
    return

  @onChoice:( choice, name, widget ) ->
    return if choice.name isnt name or choice.source is name
    # console.log( 'Dom.onChoice()', { name:name, choice:choice, btns:widget.btns, choiceName:choice.name } )
    if not ( widget.btns[choice.study]? and widget.btns[choice.study].$e? )
      console.error( 'Dom.onChoice()', { name:name, study:choice.study, btns:widget.btns } )
      return
    $e = widget.btns[choice.study].$e
    if   $e?
      if choice.intent is UI.AddChoice
        $e.find("button").addClass(    "btn-nice-active" )
      else
        $e.find("button").removeClass( "btn-nice-active" )
    else
      console.error( "Dom.onChoice() $e missing for", { name:name, choice:choice } )
    return

  @doEnter:( widget, key, study ) -> widget.btns[key].$e.css( { color:Dom.hoverColor } ) if not study?.chosen
  @doLeave:( widget, key, study ) -> widget.btns[key].$e.css( { color:Dom.basisColor } ) if not study?.chosen

  @onEvents:( stream, widget, spec, key, study ) ->
    $e = widget.btns[key].$e
    $e.on( 'click',      (event) -> Dom.doClick( stream, widget, spec, key, study, event ) )
    $e.on( 'mouseenter', (     ) -> Dom.doEnter( widget, key, study ) )
    $e.on( 'mouseleave', (     ) -> Dom.doLeave( widget, key, study ) )
    return

  @horz:( stream, spec, imgDir, hpc=1.00, x0=0, y0=0 ) ->
    th = if spec.name is 'Roast' then 18 else 13  # A hack
    $p  = $( """<div   #{Dom.panel(0, 0,100,100)}></div>""" )
    $p.append(  """<h2 #{Dom.label(0,th, 10, 90)}>#{spec.name}</h2>""" )
    n  =  Util.lenObject( spec, Util.isChild )
    x  =  x0
    y  =  y0
    dx = (100-x0) / n
    for own key, study of spec when Util.isChild(key)
      src = if study.icon? then imgDir + study.icon else null
      $e  = $( """#{Dom.image(x,y,dx,100*hpc,src,9*hpc,study.name)}"""  )
      Dom.addWidgetBtn( widget, key, $e )
      Dom.onEvents( stream,  widget, spec, key, study )
      $p.append( $e )
      x   =   x + dx
    $p

  @vert:( stream, spec, widget, imgDir, hpc=1.00, x0=0, y0=0 ) ->
    $p = $( """<div    #{Dom.panel(0,0,100,100,align)}></div>""" )
    $p.append( """<div #{Dom.label(0,3,100, 10)}>#{spec.name}</div>""" )
    n  =  Util.lenObject( spec, Util.isChild )
    x  = x0
    y  = y0
    dy = (100-y0-5) / n
    for own key, study of spec when Util.isChild(key)
      src = if study.icon? then imgDir + study.icon else null
      mh = spec.pane.toVh(dy) * 0.6
      $e = $( """#{Dom.image(x,y,100,dy*hpc,src,mh,study.name)}"""  )
      Dom.addWidgetBtn( widget, key, $e )
      Dom.onEvents( stream, widget, spec, key, study )
      $p.append( $e )
      y =   y + dy
    $p

  @vertBtns:( stream, spec, widget, imgDir, w=50, x0=0, y0=0 ) ->
    $p = $( """<div    #{Dom.panel(0,0,100,100)}></div>""" )
    $p.append( """<div #{Dom.label(0,3,100, 10)}>#{spec.name}</div>""" )
    n  =  Util.lenObject( spec, Util.isChild )
    x  = x0
    y  = y0
    dy = (100-y0-5) / n
    for own key, study of spec when Util.isChild(key)
      src   = if study.img?  then imgDir + study.img            else null
      icon  = if not src?    and  study.icon  then study.icon   else null
      iconc = if icon?       and  study.iconc then study.iconc  else null   # icon color
      back  = if study.back?                  then study.back   else  "#3B5999"
      mh    = 90
      $e = $( Dom.btn( x, y, w, dy, back, study.name, icon, iconc, src, mh ) )
      Dom.addWidgetBtn( widget, key, $e )
      Dom.onEvents( stream, widget, spec, key, study )
      $p.append( $e )
      y =   y + dy  # https://is.gd/CEPUez
    # console.log( 'Dom.vertButtons()', { btns:widget.btns } )
    $p

  @btn:( x, y, w, h, back="#3B5999", label=null, icon=null, iconc=null, src=null, mh=null ) ->
    mvh  = w * mh * 0.001
    htm  = """<div style="position:absolute; left:#{x}%; top:#{y}%; width:#{w}%; height:#{h}%;">"""
    htm += """<button class="btn-nice" style="max-height:#{mh}%; background-color:#{back}">"""
    htm += """<i      class="btn-icons #{icon} fa-lg" style="color:#{iconc}"></i>"""   if icon? and iconc?
    htm += """<img    class="btn-image" style="max-height:#{mvh}vh;" src="#{src}"/>"""   if src?  and mh?
    htm += """<div    class="btn-label">#{label}</div>"""                              if label?
    htm += """</button></div>"""
    htm

  @tree:( stream, spec, name, widget, x0=0, y0=0 ) ->
    $p = $( """<div    #{Dom.panel(0,0,100,100,"left")}></div>""" )
    $p.append( """<div #{Dom.label(0,3,100, 10)}>#{name}</div>""" )
    n  =  Util.lenObject( spec, Util.isChild )
    x  = x0
    y  = y0
    dy = (100-y0) / n
    for own key, study of spec when Util.isChild(key)
      $e  = $( """#{Dom.branch(x,y,100,dy,study.name)}"""  )
      #study.num = 0
      Dom.addWidgetBtn( widget, key, $e )
      Dom.onEvents( stream, widget, spec, key, study )
      $p.append( $e )
      y =   y + dy
    $p

  @addWidgetBtn:( widget, key, $e ) ->
    widget.btns[key]    = {}
    widget.btns[key].$e = $e
    return

  @hasJQueryPlugin:( plugin, issue=true ) ->
    glob = Util.firstTok(plugin,'.')
    plug = Util.lastTok( plugin,'.')
    has  = window[glob]? and window[glob][plug]?
    console.error( "Util.hasPlugin()  $#{glob+'.'+plug} not present" )  if not has and issue
    has

  @cssPosition:( screen, port, land ) ->
    array = if screen.orientation is 'Portrait' then port else land
    $.css( Util.toPositionPc(array) )
    return

  @isHidden:( $e ) ->
    $e.css('display') is 'none'

`export default Dom`