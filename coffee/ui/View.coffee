import Util  from '../util/Util.js'
import UI    from '../ui/UI.js'
import Dom   from '../ui/Dom.js'
import Pane  from '../ui/Pane.js'
import Pack  from '../ui/Pack.js'

class View

  constructor:( @ui, @stream, @specs ) ->
    @speed          = 400
    @$view          = UI.$empty
    @margin         = UI.margin
    @ncol           = UI.ncol
    @nrow           = UI.nrow
    @classPrefix    = if Util.isStr(@specs.css) then @spec.css else 'ui-view'
    [@wpane,@hpane,@wview,@hview,@wscale,@hscale] = @percents( @nrow, @ncol, @margin )
    [@packs,@panes] = @createPacksPanes(@specs)
    @sizeCallback   = null
    @paneCallback   = null
    @$empty         = UI.$empty # Empty jQuery singleton for intialization
    @wpx = 0
    @hpx = 0
    @lastPaneName   = 'None'
    @allCells       = [ 1, @ncol, 1, @nrow ]
    Util.noop( @lastPaneName, @allCells, @hPanes, @wPanes, @positionpx, @positionPane )

  ready:() ->
    parent = $('#'+@ui.getHtmlId('View') ) # parent is outside of planes
    htmlId = @ui.htmlId( 'View','Plane' )
    @$view = $( """<div id="#{htmlId}" class="#{@classPrefix}"></div>""" )
    parent.append( @$view )
    pane.ready()  for pane  in @panes
    @subscribe()
    [@wpx,@hpx] = @size()
    return

  subscribe:() ->
    @stream.subscribe( 'Select', 'View', (select) => @onSelect(select) )

  percents:( nrow, ncol, margin ) ->
    wpane  = 100 / ncol
    hpane  = 100 / nrow
    wview  = 1.0 - ( margin.west  + margin.east  ) / 100
    hview  = 1.0 - ( margin.north + margin.south ) / 100
    wscale = 1.0 - ( margin.west  + (ncol-1) * margin.width  + margin.east  ) / 100  # Scaling factor for panes once all
    hscale = 1.0 - ( margin.north + (nrow-1) * margin.height + margin.south ) / 100  # margins gutters are accounted for
    [wpane,hpane,wview,hview,wscale,hscale]

  pc:(v) -> v.toString() + if v isnt 0 then '%' else ''
  xs:(x) -> @pc( x * @wscale )
  ys:(y) -> @pc( y * @hscale )

  left:(j)   -> j * @wpane
  top:(i)    -> i * @hpane
  width:(m)  -> m * @wpane + (m-1) * @margin.width  / @wscale
  height:(n) -> n * @hpane + (n-1) * @margin.height / @hscale

  size:() ->
    isViewHidden = Dom.isHidden( @$view )
    @show() if isViewHidden
    wpx = 0
    hpx = 0
    [wpx,hpx] = [@$view.innerWidth(),@$view.innerHeight()]
    if Util.isNum(wpx) and Util.isNum(hpx)
      [@wpx,@hpx] = [wpx,hpx]
    else
      console.error( "View.size() wpx hpx undefined and kept at ready size" )
      console.trace()
    @hide() if isViewHidden
    [@wpx,@hpx]

  wPanes:()   -> @wview * @wpx
  hPanes:()   -> @hview * @hpx

  north:(  top,  height, h, scale=1.0, dy=0 ) -> scale * ( top           - h + dy/@hscale )
  south:(  top,  height, h, scale=1.0, dy=0 ) -> scale * ( top  + height     + dy/@hscale )
  east:(   left, width,  w, scale=1.0, dx=0 ) -> scale * ( left + width      + dx/@wscale )
  west:(   left, width,  w, scale=1.0, dx=0 ) -> scale * ( left          - w + dx/@wscale )

  isRow:( specPanePack ) -> specPanePack.css is 'ikw-row'
  isCol:( specPanePack ) -> specPanePack.css is 'ikw-col'

  positionUnionPane:( unionCells, paneCells, spec, xscale=1.0, yscale=1.0 ) ->
    ju = 0
    mu = 0
    iu = 0
    nu = 0
    jp = 0
    mp = 0
    ip = 0
    np = 0
    [ju,mu,iu,nu] = @jmin( unionCells )
    [jp,mp,ip,np] = @jmin(  paneCells )
    @position( (jp-ju)*@ncol/mu, mp*@ncol/mu, (ip-iu)*@nrow/nu, np*@nrow/nu, spec, xscale, yscale )

  positionPack:( packCells, spec, xscale=1.0, yscale=1.0 ) ->
    j = 0
    m = 0
    i = 0
    n = 0
    [j,m,i,n] = @jmin( packCells )
    @position( j,m,i,n, spec, xscale, yscale )

  position:( j,m,i,n, spec, xscale=1.0, yscale=1.0 ) ->
    wStudy = if spec.name? then @margin.wStudy else 0
    hStudy = if spec.name? then @margin.hStudy else 0
    left   = xscale * ( @left(j)   + ( wStudy + @margin.west  + j * @margin.width  ) / @wscale )
    top    = yscale * ( @top(i)    + ( hStudy + @margin.north + i * @margin.height ) / @hscale )
    width  = xscale * ( @width(m)  -   wStudy * 2 / @wscale )
    height = yscale * ( @height(n) -   hStudy * 2 / @hscale )
    [left,top,width,height]

  positionPane:( paneCells, spec, xscale=1.0, yscale=1.0 ) ->
    j = 0
    m = 0
    i = 0
    n = 0
    [j,m,i,n] = @jmin( paneCells )
    @position( j,m,i,n, spec, xscale, yscale )

  # Should only be called when view is fully visible
  positionpx:( j,m,i,n, spec ) ->
    left   = 0
    top    = 0
    width  = 0
    height = 0
    [left,top,width,height] = @position( j,m,i,n, spec, @wscale, @hscale )
    [width*@wpx/100, height*@hpx/100]

  reset:( select ) ->
    for pane  in @panes
      pane.reset( select )
    return

  resize:() =>
    saveName  = @lastPaneName
    @lastPaneName = ''
    @onSelect( UI.toTopic( saveName, 'View', UI.SelectPane ) )
    @lastPaneName  = saveName
    return

  hide:() ->
    @$view.hide()
    return

  show:() ->
    @$view.show()
    return

  hideAll:( name='None' ) ->
    pane.hide() for pane  in @panes when pane.name isnt name
    @$view.hide()
    return

  showAll:( panes ) ->
    @$view.hide()
    pane.  show() for pane  in panes
    @$view.show( @speed, () => @sizeCallback(@) if @sizeCallback )
    return

  onSelect:( select ) ->
    UI.verifyTopic( select, 'View' )
    name    = select.name
    intent  = select.intent
    switch intent
      when UI.SelectPack   then @expandPack(  select, @getPane(name) )
      when UI.SelectView   then @expandView(  select )
      when UI.SelectPane   then @expandPane(  select, @getPane(name) )
      when UI.SelectStudy  then @expandStudy( select, @getPane(name) )
      when 'None'          then Util.noop()
      else console.error( 'UI.View.onSelect() name not processed for intent', name, select )
    return

  expandPack:( select, pack, callback=null ) ->
    # console.log( 'View.expandPack()', pack.name, @ui.okPub(pack.spec) )
    @hideAll('Interact')
    if  pack.panes?
      for pane in pack.panes when @inPack(pane)
        pane.show()
        left   = 0
        top    = 0
        width  = 0
        height = 0
        [left,top,width,height] = @positionUnionPane( pack.cells, pane.cells, pane.spec, @wscale, @hscale )
        pane.animate( left, top, width, height, select, true, callback )
    # else
    #   console.error( 'View.expandPack pack.panes null' )
    @show()
    # @lastPaneName  = 'None'
    return

  inPack:( pane ) ->
    pane.classPrefix isnt 'ui-plane' # bad condition for determining that pane is in pack

  expandView:( select ) ->
    @hideAll()
    @reset( select )
    @showAll( @panes )

  expandPane:( select, pane,  callback=null ) ->
    paneCallback = if callback? then callback else @paneCallback
    pane = @getPane( pane, false ) # don't issue errors
    return unless pane?
    @hideAll()
    pane.resetStudiesDir( true )
    pane.show()
    pane.animate( @margin.west, @margin.north, 100*@wview, 100*@hview, select, true, paneCallback )
    @show()
    # @lastPaneName   = pane.name
    return

  expandStudy:(   select, pane,  callback=null ) ->
    @expandPane(  select, pane,  callback )
    console.info( 'View.expandStudy()', { study:select.study } ) if @stream.isInfo('Select','view')
    return unless select.study?
    pane.resetStudiesDir( false )                  # Hide all studies
    pane.resetStudyDir(   true,  true, select.study.dir ) # Expand selected
    return

  getPane:( name, issueError=true  ) ->
    return  name if Util.isObj(name)
    for pane in @panes
      return pane if pane.name is name
    for pack in @packs
      return pack if pack.name is name
    console.error( 'View.getPane() null for key ', name ) if issueError
    console.log( { packs:@packs, panes:@panes } )
    null

  createPacksPanes:( specs ) ->
    # console.log( 'View.createPackPanes() ------')
    packs = []
    panes = []
    for own key, spec of specs when Util.isChild(key)
      if spec.type is 'pack'
        # console.log( '  Pack', key )
        pack = new Pack( @ui, @stream, @, spec )
        packs.push( pack  )
        for own pey, ppec of spec when Util.isChild(pey) and ppec.type is 'pane'
          # console.log( '    Pane', pey )
          pane = new Pane( @ui, @stream, @, ppec )
          pack.panes.push( pane )
          panes.push(      pane )
      else if spec.type is 'pane'
        panes.push( new Pane( @ui, @stream, @, spec ) )
    [packs,panes]


  jmin:( cells ) ->
    console.trace() if not cells?
    [ cells[0]-1,cells[1],cells[2]-1,cells[3] ]

  ###


  paneInUnion:( paneCells, unionCells ) ->
    [jp,mp,ip,np] = @jmin(  paneCells )
    [ju,mu,iu,nu] = @jmin( unionCells )
    ju <= jp and jp+mp <= ju+mu and iu <= ip and ip+np <= iu+nu

  expandCells:( unionCells, allCells ) ->  # Not Implemented
    [ju,mu,iu,nu] = @jmin( unionCells )
    [ja,ma,ia,na] = @jmin(   allCells )
    [ (ju-ja)*ma/mu, ma, (iu-ia)*na/nu, na ]


  toCells:( jmin ) ->
    [ jmin[0]+1,jmin[1],jmin[2]+1,jmin[3] ]

  unionCells:( cells1, cells2 ) ->
    [j1,m1,i1,n1] = UI.jmin( cells1 )
    [j2,m2,i2,n2] = UI.jmin( cells2 )
    [ Math.min(j1,j2)+1, Math.max(j1+m1,j2+m2)-Math.min(j1,j2), Math.min(i1,i2)+1, Math.max(i1+n1,i2+n2)-Math.min(i1,i2) ]

  intersectCells:( cells1, cells2 ) ->
    [j1,m1,i1,n1] = UI.jmin( cells1 )
    [j2,m2,i2,n2] = UI.jmin( cells2 )
    [ Math.max(j1,j2)+1, Math.min(j1+m1,j2+m2), Math.max(i1,i2)+1, Math.min(i1+n1,i2+n2) ]

  ###

export default View