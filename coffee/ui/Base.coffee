

class Base

  constructor: ( @stream, @ui, @name ) ->
    @ui.addPage( @name, @ )

  ready:( cname ) =>
    console.error( "Subclass #{@name} needs to implements ready(#{cname})" )

  readyView:() =>
    $("""<h1 style=" display:grid; justify-self:center; align-self:center; ">#{@name}</h1>""" )

export default Base