
import UI  from '../ui/UI.js'
import Dom from '../ui/Dom.js'

class Btn

  constructor:( @ui, @stream, @pane, @spec, @contents ) ->
    @css = @pane.classPrefix

  ready:() ->
    return if not  @pane.page?
    @$ = $( @html( @contents  ) )
    @pane.$.append( @$ )
    @publish( @contents )
    return


  layout:( geom ) ->
    if geom.w < 200 then @$.hide() else @$.show()
    return

  html:( contents ) ->
    htmlId = @ui.htmlId( @pane.name, 'Btn' )
    html   = """<ul id="#{htmlId}" class="#{@css+'-ul-content'}">"""
    x = 0
    for own key, content of contents when @hasButton( content )
      content.btnId = @ui.htmlId( @pane.name, content.name+'Btn')
      name  = content.name.charAt(0)
      html += """<li id="#{content.btnId}" class="#{@css+'-li-content-btn'}" style="left:#{x}px;"><div>#{name}</div></li>"""
      x = x + 24
    html += """</ul>"""
    html

  publish:( contents ) ->
    for own key, content of contents when @hasButton( content )
      content.$btn = $( '#'+content.btnId )
      msg = UI.content( content.name, 'Btn', UI.SelectStudy, @pane.name )
      @stream.event( 'Content', msg, Dom.element(content.$btn), 'click' )
    return

  hasButton:( content ) ->
    content.has  and content.btn and ( content.name)

`export default Btn`
