
import Util   from '../util/Util.js'
import UI     from '../ui/UI.js'
import Dom    from '../ui/Dom.js'

class Pane

  constructor:( @ui, @stream, @view, @spec ) ->
    @spec.pane   = @
    @cells       = @spec.cells
    j = 0
    m = 0
    i = 0
    n = 0
    [j,m,i,n]    = @view.jmin(@cells)
    [@left,@top,@width,@height] = @view.position(j,m,i,n,@spec)
    @name        = @spec.name
    @classPrefix = if Util.isStr(@spec.css) then @spec.css else 'ui-pane'
    @$           = UI.$empty
    @wscale      = @view.wscale
    @hscale      = @view.hscale
    @margin      = @view.margin
    @speed       = @view.speed
    @wpx = 0
    @hpx = 0
    Util.noop( @toVmin, @xcente2, @northPane, @southPane, @eastPane, @westPane  )

  ready:() ->
    @htmlId = @ui.htmlId( @name, 'Pane' )
    @$      = @createHtml()
    @view.$view.append( @$ )
    @hide()
    @adjacentPanes()
    @$.css( @scaleReset() )
    @show()
    [@wpx,@hpx] = @size()
    return

  size:() ->
    isViewHidden = Dom.isHidden( @view.$view )
    isPaneHidden = Dom.isHidden( @$          )
    @view.show() if isViewHidden
    @show()      if isPaneHidden
    wpx = 0
    hpx = 0
    [wpx,hpx] = [@$.innerWidth(),@$.innerHeight()]
    if Util.isNum(wpx) and Util.isNum(hpx)
      [@wpx,@hpx] = [wpx,hpx]
    else
      console.error( "Pane.size() wpx hpx undefined and kept at ready size" )
      console.trace()
    @hide()      if isPaneHidden
    @view.hide() if isViewHidden
    [@wpx,@hpx]

  geom:( cells=@spec.cells, wgpx, hgpx ) ->
    wgpx = if wgpx? then wgpx else @wpx
    hgpx = if hgpx? then hgpx else @hpx
    g = {}
    g.name = @name
    [g.j,g.m,g.i,g.n] = @view.jmin( cells )
    [left,top,width,height] = @view.position( g.j,g.m,g.i,g.n, @spec, @view.wscale, @view.hscale )
    [g.w,g.h] = @size() # @view.positionpx( g.j,g.m,g.i,g.n, @spec ) # Pane size in AllPage usually 3x3 View
    g.r  = Math.min( g.w, g.h ) * 0.2  # Use for hexagons
    g.x0 = g.w * 0.5
    g.y0 = g.h * 0.5
    g.sx = g.w/wgpx
    g.sy = g.h/hgpx
    g.s  = Math.min( g.sx, g.sy )
    g.fontSize  = @toVh( 5 )+'vh'
    g.iconSize  = @toVh( 5 )+'vh'
    # console.log( "Pane.geom()", { wgpx:wgpx, hgpx:hgpx }, g )
    g

  # Converts a pane percent to vmin unit by determining the correct pane scaling factor
  toVmin:( pc ) ->
    sc = if @view.wpx > @view.hpx then @hpx else @wpx
    Util.toFixed( sc * pc * 0.01, 2 )

  toVw:( pc ) -> Util.toFixed( @width  * pc * 0.01, 2 )
  toVh:( pc ) -> Util.toFixed( @height * pc * 0.01, 2 )

  show:()  ->
    @$.show()
    return

  hide:()  ->
    @$.hide()
    return

  pc:(v) -> @view.pc(v)
  xs:(x) -> @view.xs(x)
  ys:(y) -> @view.ys(y)

  xcenter:( left, width,  w, scale=1.0, dx=0 ) -> scale * ( left + 0.5*width   - 11            + dx/@wscale )
  xcente2:( left, width,  w, scale=1.0, dx=0 ) -> scale * ( left + 0.5*width   - 0.5*w/@wscale + dx/@wscale )
  ycenter:( top,  height, h, scale=1.0, dy=0 ) -> scale * ( top  + 0.5*height  - 0.5*h/@hscale + dy/@hscale )
  right:(   left, width,  w, scale=1.0, dx=0 ) -> scale * ( left + width       - 0.5*w/@wscale + dx/@wscale )
  bottom:(  top,  height, h, scale=1.0, dy=0 ) -> scale * ( top  + height      - 0.5*h/@hscale + dy/@hscale )

  north:(  top,  height, h, scale=1.0, dy=0 ) -> scale * ( top           - h + dy/@hscale )
  south:(  top,  height, h, scale=1.0, dy=0 ) -> scale * ( top  + height     + dy/@hscale )
  east:(   left, width,  w, scale=1.0, dx=0 ) -> scale * ( left + width      + dx/@wscale )
  west:(   left, width,  w, scale=1.0, dx=0 ) -> scale * ( left          - w + dx/@wscale )

  adjacentPanes:() ->
    jp = 0
    mp = 0
    ip = 0
    np = 0
    [jp,mp,ip,np] = @view.jmin(@cells)
    [@northPane,@southPane,@eastPane,@westPane] = [UI.$empty,UI.$empty,UI.$empty,UI.$empty]
    for pane in @view.panes
      j = 0
      m = 0
      i = 0
      n = 0
      [j,m,i,n] = @view.jmin(pane.cells)
      @northPane = pane if j is jp and m is mp and i is ip-n
      @southPane = pane if j is jp and m is mp and i is ip+np
      @westPane  = pane if i is ip and n is np and j is jp-m
      @eastPane  = pane if i is ip and n is np and j is jp+mp
    return

  createHtml:() ->
    $p = $("""<div id="#{@htmlId}" class="#{@classPrefix}"></div>""")
    @navArrows( $p )
    $p

  doNav:( event ) ->
    name = $(event.target).attr('data-name')
    select = UI.toTopic( name, 'Pane.doNav()', UI.SelectPack )
    @stream.publish( 'Select', select )
    return

  navArrows:( $p ) ->
    fontvw = @toVw(33) + 'vw'
    leftvw = '25%'
    @navIcon( 'bak', leftvw, fontvw, @spec['bak'], $p ) if @spec['bak']?
    @navIcon( 'fwd', leftvw, fontvw, @spec['fwd'], $p ) if @spec['fwd']?
    @navIcon( 'top', leftvw, fontvw, @spec['top'], $p ) if @spec['top']?
    @navIcon( 'bot', leftvw, fontvw, @spec['bot'], $p ) if @spec['bot']?
    return

  navIcon:( loc, leftvw, fontvw, name, $p ) ->
    $a = switch loc
      when 'bak' then $("""<i style="position:absolute; left:#{leftvw}; top: 40%; font-size:#{fontvw}; z-index:4;" class="arrow fas fa-arrow-alt-circle-left"  data-name="#{name}"></i>""" )
      when 'fwd' then $("""<i style="position:absolute; left:#{leftvw}; top: 40%; font-size:#{fontvw}; z-index:4;" class="arrow fas fa-arrow-alt-circle-right" data-name="#{name}"></i>""" )
      when 'top' then $("""<i style="position:absolute; left:#{leftvw}; top:   0; font-size:#{fontvw}; z-index:4;" class="arrow fas fa-arrow-alt-circle-up"    data-name="#{name}"></i>""" )
      when 'bot' then $("""<i style="position:absolute; left:#{leftvw}; bottom:0; font-size:#{fontvw}; z-index:4;" class="arrow fas fa-arrow-alt-circle-down"  data-name="#{name}"></i>""" )
    $a.on( 'click', (event) => @doNav(event) )
    $p.append( $a )
    return

  scaleReset:() ->
    { left:@xs(@left), top:@ys(@top), width:@xs(@width), height:@ys(@height) }

  scaleParam:( left, top, width, height ) ->
    { left:@pc(left),  top:@pc(top),  width:@pc(width),  height:@pc(height) }

  emptyParam:() ->
    { left:"",  top:"",  width:"",  height:"" }

  reset:( select ) ->
    @resetStudiesDir( true )
    @$.css( @scaleReset() )
    #@onContent( select )
    Util.noop( select )
    return

  css:(  left, top, width, height ) ->
    @$.css( @scaleParam( left, top, width, height ) )
    #@onContent( select )
    return

  animate:( left, top, width, height, select, aniLinks=false, callback=null ) ->
    @$.show().animate( @scaleParam( left, top, width, height ), @view.speed, () => @animateCall(callback,select) )
    return

  animateCall:( callback, select ) =>
    @onContent( select )
    callback(@) if callback?
    return

  resetStudiesDir:( show ) ->
    for dir in ['west','north','east','south','prac']
      @resetStudyDir( false, show, dir )
    return

  resetStudyDir:( expand, show, dir ) ->
    $study = @$.find( @dirClass(dir) )
    if expand
      $study.css( @scaleParam( @view.margin.west, @view.margin.north, 100*@view.wview, 100*@view.hview ) )
    else
      $study.css( @emptyParam() )
    if show then $study.show() else $study.hide()
    return

  dirClass:( dir) ->
    ".study-#{dir}"

  onContent:( select ) =>
    if @stream.hasSubject('Content')
      content = UI.toTopic( select.name, 'Pane', select.intent )
      @stream.publish( 'Content', content )
    return

export default Pane