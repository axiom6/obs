
import Util from '../util/Util.js'
import Vis  from '../util/Vis.js'
import UI   from '../ui/UI.js'
import Dom  from '../ui/Dom.js'

class Basic

  constructor:( @stream, @ui, @pane, @cname ) ->
    @ui.addPage( @pane.name, @ ) if @ui.planeName is 'App'  # Signifies that Page is not present
    @spec = @pane.spec
    @has  = true
    @btn  = true
    @$    = $()
    Util.noop( @hasStudy, @anyTopics, @hasItems )

  ready:() ->
    console.error( 'Basic.ready() must be overriden' )
    UI.$empty

  layout:( intent ) ->
    Util.error( 'Basic.layout() must be overriden', intent )
    return

  scoreClass:( prefix, intent ) ->
    view = if @cname is 'Topic' then 'topic' else 'study'
    prefix + '-' + switch intent
      when UI.SelectView   then @scoreView(view)
      when UI.SelectPane   then 'pane'
      when UI.SelectStudy  then 'stud'
      else                       view

  scoreView:( view ) ->
    if      @isPlane( @spec ) then 'plane'
    else if @isDim(   @spec ) then 'dims'
    else if @isRow(   @spec ) then 'rows'
    else                            view

  # Need to improve naming conventions
  isPlane:(    spec ) -> @isDim(spec) and @isRow(spec)
  isDim:(      spec ) -> @spec.row    is 'Dim' and @spec.column isnt 'Row'
  isRow:(      spec ) -> @spec.column is 'Row'
  isDimOrRow:( spec ) -> @isDim(spec) or @isRow(spec)
  isCol:(      spec ) -> @isDim(spec) and not @isRow(spec)
  isPer:(      spec ) -> @isRow(spec) and not @isDim(spec)

  # ------ Tag Attributes ------

  klass:( name ) ->
    Dom.klass(  name )

  htmlId:( name, type, exa="" ) ->
    exs = if @cname is 'Study' then exa + 'S' else exa
    ext = if @cname is 'Topic' then exa + 'T' else exs
    Dom.htmlId( name, type, ext )

  style:( ...props ) ->
    Dom.style( props )

  title:( purpose ) ->
    if purpose? and purpose isnt "None" then """title="#{purpose}" """ else ""

  # ------ CSS Propterties ------

  position:( x, y, w, h, pos="absolute", uom="%" ) -> Dom.position( x, y, w, h, pos="absolute", uom="%" )
  margin:(   l, t, r, b )                          -> Dom.margin(   l, t, r, b )
  padding:(  l, t, r, b )                          -> Dom.padding(  l, t, r, b )
  border:( color, thick )                          -> Dom.border( color, thick )

  fill:( spec ) -> """background-color:#{@toFill(spec)} """

  toFill:( spec ) ->
    if     spec.hsv? and spec.hsv.length is 3
      Vis.toRgbHsvStr( spec.hsv )
    else
      console.error( 'Basic.toFill() unknown hsv', { name:spec.name, spec:spec } )
      '#888888'

  # ------ Html ------

  main:( k, spec, type ) ->
    """<div #{@klass(k)} #{@htmlId(spec.name,type,'Main')} #{@style(@fill(spec))}>"""

  wrap:( k, spec, type ) ->
    """<div #{@klass(k)} #{@htmlId(spec.name,type,'Wrap')}>"""

  bloc:( k, spec, type ) ->
    """<div #{@klass(k)} #{@htmlId(spec.name,type,'Bloc')}>"""

  icon:( k, spec ) ->
    ki = if spec.icon? and @contains(spec.icon,'fa') then k+' '+spec.icon else k+' fas fa fa-circle'
    """<i #{@klass(ki)}></i>"""

  text:( k, spec, tag='span' ) ->
    console.log( 'Basic.text()', spec ) if not spec.name?
    """<#{tag} #{@klass(k)} #{@title(spec.purpose)}>#{@toName(spec.name)}</#{tag}>"""

  tesc:( k, desc ) ->
    """<span #{@klass(k)}>#{desc}</span>"""

  desc:( k, spec ) ->
    """<div #{@klass(k)}>#{spec.desc}</div>  """

  abst:( k, spec ) ->
    """<div #{@klass(k)}>#{spec.desc}</div>  """

  contains:( str, tok ) ->
    str? and str.indexOf(tok) isnt -1

  setFontSize:( fontVh ) ->
    { "font-size":"#{@pane.toVh(fontVh)}vh" }

  readyCenter:( prefix='ui-pane' ) =>
    htmlId = @htmlId( @pane.name, @cname )
    fill   = @toFill( @spec )
    style = """style="background-color:#{fill}; border-radius:12px; color:black;" """
    htm = """<div    class="#{prefix}-center" #{htmlId}>
              <div   class="#{prefix}-center-div" #{style}>
                #{@icon("#{prefix}-icon",@spec)}
                <div class="#{prefix}-text">#{@toName(@pane.name)}</div>
              </div>
            </div>"""
    # console.log('Basic.readyCenter()', htm )
    $p = $(htm)
    $p

  layoutCenter:( intent ) ->
    Util.noop( intent )
    geom = @pane.geom()
    @$.find('.ui-pane-center-div').css( { fontSize:geom.fontSize } )
    @$.find('.ui-pane-icon')      .css( { fontSize:geom.iconSize, display:'block' } )
    return

  toName:( name ) ->
    Util.toName( name )

  # Search Studies and Topisc
  hasStudy:() ->
    for key, study of @spec when Util.isChild(key)
      return true
    false

  anyTopics:() ->
    for   skey, study of @spec when Util.isChild(skey)
      for tkey, topic of study when Util.isChild(tkey)
        return true
      false

  hasTopics:( study ) ->
    for tkey, topic of study when Util.isChild(tkey)
      return true
    false

  hasItems:( topic ) ->
    for ikey, item  of topic when Util.isChild(ikey)
      return true
    false

export default Basic