
import Util from '../util/Util.js'
import UI   from '../ui/UI.js'
import Dom  from '../ui/Dom.js'

class Tocs

  Tocs.MaxTocLevel  = 12

  constructor:( @ui, @stream, @practices ) ->
    [@specs,@stack] = @createTocsSpecs( @practices )
    @htmlIdApp   = @ui.getHtmlId('Tocs','')
    @classPrefix = if Util.isStr(@practices.css) then @practices.css else 'tocs'
    @last        = @specs[0]
    @speed       = 400

  createTocsSpecs:( practs ) ->
    spec0     = { level:0, name:"Beg",  hasChild:true }
    stack     = new Array(Tocs.MaxTocLevel)
    stack[0]  = spec0
    specs     = []
    specs.push( spec0 )
    for own            keyPract, pract of practs when @isToc(keyPract,pract)
      @enrichSpec(     keyPract, pract,   specs, 1, spec0 )
      for own          keyStudy, study of pract  when @isToc(keyStudy,study)
        @enrichSpec(   keyStudy, study,   specs, 2, pract )
        for own        keyTopic, topic of study  when @isToc(keyTopic,topic)
          @enrichSpec( keyTopic, topic,   specs, 3, study )
    specN = { level:0, name:"End", hasChild:false }
    specs.push( specN )
    [specs,stack]

  isToc:( key, obj ) ->
    Util.isChild(key) and not ( obj['toc']? and not obj['toc'] )

  hasChild:( spec ) ->
    return false if spec.level >= 3
    for own key, child of spec when Util.isChild(key)
      return true
    false

  infoSpecs:() ->
    for spec in @specs
      console.info( 'Tocs.spec', Util.indent(spec.level*2), spec.name, spec.hasChild )
    return

  enrichSpec:( key, spec, specs, level, parent ) ->
    #console.log( 'Tocs', key, spec )
    spec.level    = level
    spec.parent   = parent
    spec.on       = false
    spec.hasChild = @hasChild(spec)
    specs.push( spec )
    # console.log( Util.indent(spec.level*2), spec.name )
    return

  ready:() ->
    @$tocs = $( @html() )
    @$tocp = $('#'+@htmlIdApp)
    @$tocp.append( @$tocs )
    for spec in @specs when spec.level > 0
      spec.$elem = if spec.hasChild then $('#'+spec.ulId) else $('#'+spec.liId)
      spec.$li   = $('#'+spec.liId )
      select     = @toSelect(  spec )
      subject    = if spec.type? and spec.type is 'plane'  then 'Plane' else 'Select'
      @stream.event( subject, select, Dom.element(spec.$li), 'click'  )
    @subscribe()
    return

  toSelect:( spec ) ->
    if      spec.type? and spec.type is 'plane'
      UI.toTopic( spec.name, 'Tocs', UI.SelectPack )
    else if spec.type? and spec.type is 'pack'
      select = if @ui.okPub(spec) then  UI.SelectPack else UI.SelectView
      UI.toTopic( spec.name, 'Tocs', select )
    else if  spec.type? and ( spec.type is 'menu' or spec.type is 'item' )
      UI.toTopic( spec.name, 'Tocs', 'None' )
    else if spec.column?                              # Pane
      UI.toTopic( spec.name, 'Tocs', UI.SelectPane )
    else if spec.dir                                  # Study
      UI.toTopic(  spec.parent.name, 'Tocs', UI.SelectStudy, spec.parent[spec.name] )
    else if spec.name is 'View'                       # View - not used now
      UI.toTopic( spec.name, 'Tocs', UI.SelectView )
    else
      console.error( 'Toc.toSelect() unable to determine spec type or level', spec )
      UI.toTopic( spec.name, 'Tocs', UI.SelectPane )

  subscribe:() ->
    @stream.subscribe( 'Select', 'Tocs', (select) => @onSelect(select) )
    return

  htmlId:( spec, ext = '' ) ->
    suffix = if spec.parent? then ext + spec.parent.name else ext
    @ui.htmlId( spec.name, 'Tocs', suffix )

  getSpec:( select, issueError=true ) ->
    for spec in @specs
      return spec if spec.name is select.name
    if issueError and @nameNotOk( select.name )
      console.error( 'Tocs.getSpec(id) spec null for select', select )
      @infoSpecs()
    null

  nameNotOk:( name ) ->
    okNames = ['None','View','Embrace','Innovate','Encourage','Learn','Do','Share']
    for okName in okNames
      return false if name is okName
    true

  html:() ->
    @specs[0].ulId = @htmlId(@specs[0],'UL')
    htm  = """<ul class="#{@classPrefix}ul0" id="#{@specs[0].ulId}">"""
    for i in [1...@specs.length]
      htm += @process( i  )
    htm

  show:() ->
    @$tocs.show()
    return

  hide:() ->
    @$tocs.hide()
    return

  process:( i ) ->
    htm  = ""
    prev = @specs[i-1]
    spec = @specs[i]
    if  spec.level >= prev.level
      htm += @htmlBeg( spec )
      @stack[spec.level] = spec
    else
      for level in [prev.level..spec.level]
        htm += @htmlEnd(  @stack[level] ) if @stack[level]?
      htm += @htmlBeg(  spec ) if i < @specs.length-1
    htm

  htmlBeg:( spec ) ->
    spec.liId = @htmlId(spec,'LI')
    spec.ulId = @htmlId(spec,'UL')
    #console.log( 'Tocs htmlBeg()', spec.id, spec.liId, spec.ulId )
    htm  = """<li class="#{@classPrefix}li#{spec.level}" id="#{spec.liId}" >"""
    htm += """#{@htmIconName(spec)}"""
    htm += """<ul class="#{@classPrefix}ul#{spec.level}" id="#{spec.ulId}">""" if spec.hasChild
    htm

  htmIconName:( spec ) ->
    console.log( 'Tocs.htmIconName()', { spec:spec } ) if not spec.name?
    name = if spec.title? then spec.title else spec.name
    htm  = """<div style="display:table;">"""
    htm += """<i class="fa #{spec.icon} fa-lg"></i>""" if spec.icon
    htm += """<span style="display:table-cell; vertical-align:middle; padding-left:12px;">#{Util.toName(name)}</span>"""
    htm += """</div>"""

  htmlEnd:( spec ) ->
    if spec.level == 0    then """</ul>"""
    else if spec.hasChild then """</ul></li>"""
    else                       """</li>"""

  onSelect:( select ) =>
    # console.log( 'Toc.onSelect()', select )
    UI.verifyTopic(  select, 'Tocs' )
    spec = @getSpec( select, true ) # spec null ok not all Tocs available for views
    if spec?
      @update( spec )
    else if select.name is 'View' and @last?
      @reveal( @last )
      @last = @specs[0]
    return

  update:( spec ) ->
    @stack[spec.level] = spec
    for level in  [spec.level..2] by -1  # Build stack to turn on spec levels
      @stack[level-1] =  @stack[level].parent
    last = @last
    for level in [@last.level..1] by -1  # Turn off items that are different or below level
      @reveal( last ) if last.name isnt @stack[level].name or level > spec.level
      last = last.parent
    for level in [1..spec.level]  by  1  # Turn  on  items in the spec stack
      @reveal( @stack[level] ) if not @stack[level].on
    @last = spec
    return

  reveal:( spec ) ->
    spec.on = not spec.on
    return if spec.level == 0
    if spec.hasChild
      spec.$elem.toggle(@speed)
    else
      spec.$elem.css( color: if spec.on then '#FFFF00' else '#FFFFFF' )
    return

`export default Tocs`