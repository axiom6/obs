
import Util   from '../util/Util.js'
import Data   from '../util/Data.js'
import Stream from '../util/Stream.js'

class Obs

  Data.local  = "http://localhost:63342/obs/public/"
  Data.hosted = "https://ui-48413.firebaseapp.com/"
  Data.asyncJSON( "json/basic/Obs.json", Obs.init )

  @init = ( data ) ->
    App.Spec   = Data.createPracs( data )
    UI.ncol    = 36
    UI.nrow    = 36
    UI.hasPack = false
    UI.hasTocs = true
    UI.hasLays = true
    Util.ready ->
      subjects = ["Ready","Select","Choice","Test"]
      subjects = subjects.concat( App.NavbSubjects )
      infoSpec = { subscribe:false, publish:false, subjects:["Select","Choice","Test"]}
      stream   = new Stream( subjects, infoSpec )
      ui       = new UI(  stream,  App.Spec, 'App', App.NavbSpecs )
      app      = new App( stream, ui )
      app.onReady()
      return
    return

  constructor:( @stream, @ui ) ->
    @stream.subscribe( "Ready", "App", () => @onReady() )

  onReady:() =>
    @createPages()
    @ui.pagesReady('Icons')
    return

  createPages:() ->
    for pane in @ui.view.panes
      # console.log( 'App.createPages()', pane.name )
      pane.page = new Icons( @ui.stream, @ui, pane )
    return

  App.NavbSubjects = ["Search","Contact","Settings","SignOn"]
  @NavbSpecs    = [
    { type:"NavBarLeft" }
    { type:"Item",      name:"Home",   icon:"fa-home", topic:UI.toTopic("View",'Navb',UI.SelectView), subject:"Select" }
    { type:"NavBarEnd" }
    { type:"NavBarRight"}
    { type:"Search",    name:"Search",    icon:"fa-search", size:"10", topic:'Search', subject:"Search" }
    { type:"Contact",   name:"Contact",   icon:"fa-user", topic:"http://twitter.com/TheTomFlaherty", subject:"Contact" }
    { type:"Dropdown",  name:"Settings",  icon:"fa-cog", items: [
      { type:"Item",    name:"Preferences", topic:"Preferences", subject:"Settings" }
      { type:"Item",    name:"Connection",  topic:"Connection",  subject:"Settings" }
      { type:"Item",    name:"Privacy",     topic:"Privacy",     subject:"Settings" } ] }
    { type:"SignOn",    name:"SignOn", icon:"fa-sign-in", size:"10", topic:'SignOn', subject:"SignOn" }
    { type:"NavBarEnd"  } ]

`export default Obs`

