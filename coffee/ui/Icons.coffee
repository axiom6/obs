
import Basic from '../ui/Basic.js'

class Icons extends Basic

  constructor:( stream, ui, pane ) ->
    super(      stream, ui, pane, 'Icons' )

  ready:() ->
    @$ = @readyCenter()
    @$

  layout:( intent ) ->
    @layoutCenter( intent )
    return

`export default Icons`