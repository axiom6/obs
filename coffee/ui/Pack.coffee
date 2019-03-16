
import Util    from '../util/Util.js'
import Vis     from '../util/Vis.js'
import UI      from '../ui/UI.js'
import Dom     from '../ui/Dom.js'
import Pane    from '../ui/Pane.js'

class Pack extends Pane

  constructor:( ui, stream, view, spec ) ->
    super(      ui, stream, view, spec )
    @panes    = [] # Created and pushed by view.createPacksPanes()
    @margin   = @view.margin
    @icon     = @spec.icon
    @css      = if Util.isStr(@spec.css) then @spec.css else 'ui-pack'
    @$        = UI.$empty
    Util.noop( @animateIcon, @unionPanes, @fillPanes )

  id:( name, ext ) ->
    @ui.htmlId( name+'Pack', ext )

  ready:() ->
    return if @spec.type is "pack3by3"
    @htmlId = @id( @name, 'Pack' )
    @$icon = @createIcon()
    @view.$view.append( @$icon )
    select = UI.toTopic( @name, 'Pack', @spec.intent )
    @stream.event( 'Select', select, Dom.element(@$icon), 'click' )
    return

  @show:() ->
    @$.show()
    pane .show() for pane in @panes
    return

  @hide:() ->
    @$.hide()
    pane .hide() for pane in @panes
    return

  createIcon:() ->
    htm   = @htmIconName( @spec )
    $icon = $(htm)
    left = 0
    top  = 0
    width = 0
    height = 0
    [left,top,width,height] = @positionIcon( @spec )
    $icon.css( { left:@xs(left), top:@ys(top), width:@pc(width), height:@pc(height) } )
    $icon

  htmIconName:( spec ) ->
    htm  = """<div  id="#{@id(spec.name,'Icon')}" class="#{@css}-icon" style="display:table; font-size:1.2em;">"""
    htm += """<i class="fa #{spec.icon} fa-lg"></i>""" if spec.icon
    htm += if spec.css is 'ikw-col' then @htmColName(spec) else @htmRowName(spec)
    htm += """</div>"""

  htmColName:( spec ) ->
    """<span style="display:table-cell; vertical-align:middle; padding-left:12px;">#{Util.toName(spec.name)}</span>"""

  htmRowName:( spec ) ->
    """<div style="display:table-cell; vertical-align:middle; padding-left:12px;">#{Util.toName(spec.name)}</div>"""

  positionIcon:( spec ) ->
    w = if spec.w? then spec.w*@wscale*0.5 else 100*@wscale*0.5 # Calulation does not make sense but it works
    #Util.log( 'Pack.positionIcon', @left, @width, w, @xcenter( @left, @width, w ) ) if spec.intent is ub.SelectCol
    switch spec.intent
      #hen UI.SelectRow   then [-10, @ycenter( @top, @height, @margin.west ),     12,  @margin.west ]
      #hen UI.SelectCol   then [@xcenter( @left, @width, w ), 0,  @margin.north, @margin.north ]
      when UI.SelectPack then [@xcenter( @left, @width, w ), 0,  @margin.north, @margin.north ]
      else @positionPackIcon()

  positionPack:() ->
    left   = 0
    top    = 0
    width  = 0
    height = 0
    [left,top,width,height] = @view.positionPack( @cells, @spec )
    @$.css( { left:@xs(left), top:@ys(top), width:@xs(width), height:@ys(height) } ) # , 'background-color':fill } )

  positionPackIcon:() ->
    left   = 0
    top    = 0
    width  = 0
    height = 0
    [left,top,width,height] = @view.positionPack( @cells, @spec )
    [left+20,top+20,20,20]

  animateIcon:( $icon ) ->
    left   = 0
    top    = 0
    width  = 0
    height = 0
    [left,top,width,height] = @positionIcon()
    $icon.animate( { left:@xs(left), top:@ys(top), width:@pc(width), height:@pc(height) } )

  unionPanes:( ) ->
    gpanes = []
    jg = 0
    mg = 0
    ig = 0
    ng = 0
    [jg,mg,ig,ng] = UI.jmin(@cells)
    for pane in @view.panes
      jp = 0
      mp = 0
      ip = 0
      np = 0
      [jp,mp,ip,np] = UI.jmin(pane.cells)
      gpanes.push(pane) if jg <= jp and jp+mp <= jg+mg and ig <= ip and ip+np <= ig+ng
    gpanes

  # Not used
  fillPanes:() ->
    fill = if @spec['hsv']? then Vis.toRgbHsvStr( @spec['hsv'] ) else "#888888"
    for pane in @panes
      pane.$.css( { 'background-color':fill } )
    return

  animate:( left, top, width, height, parent=null, callback=null ) ->
    @$.animate( { left:@pc(left), top:@pc(top), width:@pc(width), height:@pc(height) }, @speed, () => callback(@) if callback? )
    return

export default Pack