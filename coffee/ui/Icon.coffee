
import Util from '../util/Util.js'
import Vis  from '../util/Vis.js'

class Icon

  constructor:( @stream, @ui, @pane ) ->
    @name = @pane.name
    @spec = @pane.spec

  ready:( cname ) ->
    Util.noop( cname )
    fill  = Vis.toRgbHsvStr( @spec.hsv )
    style = """style="background-color:#{fill}; border-radius:12px; color:black;" """
    $("""<div   class="ui-pane-center">
           <div class="ui-pane-center-div" #{style}><i style="font-size:6vmin;" class="#{@spec.icon}"></i>
              <div class="ui-pane-text">#{@name}</div>
           </div>
         </div>""")

  layout:() ->
    return

export default Icon