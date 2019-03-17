
import Util from '../util/Util.js'
import Dom  from '../ui/Dom.js'

class Navb

  constructor: ( @ui, @stream, navbSpecs ) ->
    @specs  = @createSpecs( navbSpecs )
    @htmlId = Util.getHtmlId('Corp')

  createSpecs:( navbSpecs ) ->
    specs = []
    for navbSpec in navbSpecs
      specs.push( navbSpec )
    specs

  ready:() ->
    @$navb = $('#'+@htmlId )
    @$navb.append( @html() )
    @publish()

  id:( spec, ext = '' ) ->
    Util.htmlId( spec.name, 'Navb', ext )

  publish:() ->
    for spec in @specs
      if spec.htmlId?
        spec.$    = $('#'+spec.htmlId)
        eventType = if spec.subject is 'Submit' then 'keyup' else 'click'
        elem      = Dom.element(spec.$)
        if Util.isDef(elem)
          @stream.event( spec.subject, spec.topic, Dom.element(spec.$), eventType ) if spec.topic?
        else
          console.error( 'Navb.publish spec elem null', spec )
      if spec.items?
        for item in spec.items when item.htmlId?
          item.$ = $('#'+item.htmlId)
          elem   = Util.element(item.$)
          if Util.isDef(elem)
            @stream.event( item.subject, item.topic, elem, 'click' ) if item.topic?
          else
            console.error( 'Navb.publish item elem null', item )

    return

  getSpec:( id ) ->  # Not really needed
    for spec in @specs
      return spec if spec.id == id
    console.error( 'Navb.getSpec(id) spec null for id', id )
    null

  html:() ->
    htm = """<div class="navb">"""
    for spec in @specs
      switch spec.type
        when 'Brand'       then htm += """<a  class="navb-brand" href="#{spec.href}">#{spec.name}</a>"""
        when 'NavBarLeft'  then htm += """<ul class="navb-ul-left">"""
        when 'NavBarRight' then htm += """<ul class="navb-ul-right">"""
        when 'NavBarEnd'   then htm += """</ul>"""
        when 'Item'        then htm += @item(      spec )
        when 'Link'        then htm += @link(      spec )
        when 'Dropdown'    then htm += @dropdown(  spec )
        when 'FileInput'   then htm += @fileInput( spec )
        when 'Image'       then htm += @image(     spec )
        when 'Search'      then htm += @search(    spec )
        when 'Contact'     then htm += @contact(   spec )
        when 'SignOn'      then htm += @signon(    spec )
        else console.error('Navb unknown spec type', spec.type )
    htm += """</div>"""
    htm

  show:() ->
    @$navb.show()
    return

  hide:() ->
    @$navb.hide()
    return

  item:( spec ) ->
    spec.htmlId = @id( spec )
    """<li id="#{spec.htmlId}" class="navb-item"><i class="fa #{spec.icon} fa-lg"></i> #{spec.name}</li>"""

  link:( spec ) ->
    spec.htmlId = @id( spec )   #  href="{spec.href}"
    """<li class="navb-link"><a id="#{spec.htmlId}"><i title="#{spec.name}" class="fa #{spec.icon} fa-lg"></i> #{spec.name}</a></li>"""

  dropdown:( spec ) ->
    htm  = """<li class="navb-drop">"""
    htm += """<i class="fa #{spec.icon} fa-lg"/> #{spec.name}  <i class="fa fa-caret-down"/>"""
    htm += """<ul>"""
    for item in spec.items
      item.htmlId = @id( item, spec.name )
      htm += """<li id="#{item.htmlId}">#{item.name}</li>"""  # <i class="fa #{item.icon}"></i>
    htm += """</ul></li>"""
    htm

  image:( spec ) ->
    spec.htmlId = @id( spec )
    """<li id="#{spec.htmlId}" class="navb-image-li"><i class="fa #{spec.icon}"/>&nbsp;Image</li>"""

  fileInput:( spec ) ->
    spec.htmlId = @id( spec )
    """<li class="navb-fileinput-li"><input id="#{spec.htmlId}" class="navb-fileinput" placeholder="  &#xF0F6; Input File"  type="file" size="#{spec.size}"></li>"""

  search:( spec ) =>
    spec.htmlId = @id( spec )
    """<li class="navb-search-li"><input id="#{spec.htmlId}" class="navb-search" placeholder="  &#xF002; Search"  type="text" size="#{spec.size}"></li>"""

  signon:( spec ) =>
    spec.htmlId = @id( spec )
    """<li class="navb-signon-li"><input id="#{spec.htmlId}" class="navb-signon" placeholder="  &#xF090; Sign On" type="text" size="#{spec.size}"></li>"""

  searchForm:( spec ) =>
    spec.htmlId = @id( spec )
    """<li><form id="#{spec.htmlId}" name="search" class="navb-search">
       <input name="criteria" placeholder=" &#xF002; #{spec.name}" type="text" size="#{spec.size}">
       <label for="SEARCH"></label></form></li>"""

  signonForm:( spec ) =>
    spec.htmlId = @id( spec )
    """<li><form id="#{spec.htmlId}" name="login" class="navb-signon">
       <input name="user" placeholder="  &#xF090;  Sign On" type="text" size="#{spec.size}">
       <label for="SIGNON"></label></form></li>"""

  contact:( spec ) ->
    spec.htmlId = @id( spec )
    """<li class="navb-contact"><a id="#{spec.htmlId}"><i class="fa #{spec.icon} fa-lg"></i> #{spec.name}</a></li>"""

`export default Navb`
