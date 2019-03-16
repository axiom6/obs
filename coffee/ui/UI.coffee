
import Util   from '../util/Util.js'
import Navb   from '../ui/Navb.js'
import Tocs   from '../ui/Tocs.js'
import View   from '../ui/View.js'

class UI

  UI.hasTocs = true
  UI.hasLays = true
  UI.$empty  = $()
  UI.ncol    = 36
  UI.nrow    = 36
  UI.margin  = { width:1, height:1, west:1, north:1, east:1, south:1, wStudy:0.5, hStudy:0.5 }

  UI.SelectPlane  = 'SelectPlane'
  UI.SelectPack   = 'SelectPack'
  UI.SelectView   = 'SelectView'
  UI.SelectPane   = 'SelectPane'
  UI.SelectStudy  = 'SelectStudy'
  UI.SelectTopic  = 'SelectTopic'
  UI.SelectItems  = 'SelectItems'
  UI.AddChoice    = 'AddChoice'
  UI.DelChoice    = 'DelChoice'

  UI.intents = [UI.SelectPlane, UI.SelectPack,  UI.SelectView,
                UI.SelectPane,  UI.SelectStudy, UI.SelectTopic,
                UI.SelectItems, UI.AddChoice,   UI.DelChoice ]

  constructor:( @stream, @specs, @planeName, @navbs=null ) ->

    @pages  = {}
    @cname  = 'Study'
    @$text  = UI.$empty
    @navb   = new Navb( @, @stream, @navbs ) if @navbs?
    @tocs   = new Tocs( @, @stream, @specs ) if UI.hasTocs
    @view   = new View( @, @stream, @specs )
    @ready()

  addPage:( name,   page ) ->
     @pages[name] = page

  ready:() ->
    $('#'+@htmlId('App')).html( @html() )
    @navb.ready()  if @navbs?
    @tocs.ready()  if UI.hasTocs
    @view.ready()
    @stream.publish( "Ready", "Ready" ) # Just notification. No topic
    return

  pagesReady:( cname, append=true ) =>
    @cname = cname
    for own name, page of @pages
      pane       = @view.getPane(name)
      page.pane  = pane
      page.name  = pane.name
      page.spec  = pane.spec
      if append
        page.$pane = page.ready( cname )
        page.isSvg = @isElem( page.$pane.find('svg') ) and page.pane.name isnt 'Flavor'
        pane.$.append( page.$pane ) if not page.isSvg
      else
        page.$pane = page.ready( cname )
      # console.log( 'UI.pagesReady()', name )
    return

  html:() ->
    htm = ""
    htm += """<div class="layout-logo     " id="#{@htmlId('Logo')}"></div>""" if UI.hasLays
    htm += """<div class="layout-corp"      id="#{@htmlId('Corp')}"></div>""" if UI.hasLays or  @navbs?
    htm += """<div class="layout-find"      id="#{@htmlId('Find')}"></div>""" if UI.hasLays
    htm += """<div class="layout-tocs tocs" id="#{@htmlId('Tocs')}"></div>""" if UI.hasTocs
    htm += """<div class="layout-view"      id="#{@htmlId('View')}"></div>"""
    htm += """<div class="layout-side"      id="#{@htmlId('Side')}"></div>""" if UI.hasLays
    htm += """<div class="layout-pref     " id="#{@htmlId('Pref')}"></div>""" if UI.hasLays
    htm += """<div class="layout-foot"      id="#{@htmlId('Foot')}"></div>""" if UI.hasLays
    htm += """<div class="layout-trak"      id="#{@htmlId('Trak')}"></div>""" if UI.hasLays
    htm

  show:() ->
    @tocs.show() if UI.hasTocs
    @view.showAll()
    return

  hide:() ->
    @tocs.hide()   if UI.hasTocs
    @view.hideAll()
    return

  resize:() =>
    @view.resize()
    return

  # Html and jQuery Utilities in UI because it is passed around everywhere

  htmlId:( name, type='', ext='' ) ->
    Util.htmlId( name, type, ext )

  getHtmlId:( name, ext='' ) ->
    Util.getHtmlId( name, "", ext ) # consider @uniqueIdExt

  isEmpty:( $elem ) ->
    $elem? and $elem.length? and $elem.length is 0

  isElem:(  $elem ) ->
    $elem? and $elem.length? and $elem.length > 0

  okPub:( spec ) ->
    not ( spec['pub']? and not spec['pub'] )

  @toTopic:( name, source, intent, study=null ) ->
    tname =  name.replace(' ','')
    obj = {  name:tname, source:source, intent:intent }
    obj.study = study if study?
    UI.verifyTopic( obj, "UI.toTopic()" )
    obj

  @verifyTopic:( topic, source ) ->
    verify = Util.isStr(topic.name) and Util.isStr(topic.source)
    verify = verify and Util.inArray(UI.intents,topic.intent) if topic.name is 'Select'
    if not verify
      console.log('UI.verifyTopic()', { topic:topic, source:source } )
      console.trace()
    verify

export default UI