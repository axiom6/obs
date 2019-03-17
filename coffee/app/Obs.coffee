
import Util   from '../util/Util.js'
import Data   from '../util/Data.js'
import Stream from '../util/Stream.js'
import UI     from '../ui/UI.js'
import Icons  from '../ui/Icons.js'

class Obs

  Data.local  = "http://localhost:63342/obs/public/"
  Data.hosted = "https://ui-48413.firebaseapp.com/"
  Data.asyncJSON( "json/app/Obs.json", Obs.init )

  Obs.init = ( data ) ->
    # console.log( window )
    Obs.Specs  = data
    UI.ncol    = 36
    UI.nrow    = 36
    UI.hasPack = false
    UI.hasTocs = true
    UI.hasLays = true
    Util.ready ->
      subjects = ["Ready","Select","Choice","Test"]
      subjects = subjects.concat( Obs.NavbSubjects )
      infoSpec = { subscribe:false, publish:false, subjects:["Select","Choice","Test"]}
      stream   = new Stream( subjects, infoSpec )
      ui       = new UI(  stream,  Obs.Specs, 'Obs', Obs.NavbSpecs )
      app      = new Obs( stream, ui )
      app.onReady()

      return
    return

  constructor:( @stream, @ui ) ->
    @stream.subscribe( "Ready", "Obs", () => @onReady() )

  onReady:() =>
    @createPages()
    @ui.pagesReady('Icons')
    return

  createPages:() ->
    for pane in @ui.view.panes
      pane.page = new Icons( @ui.stream, @ui, pane )
    return

  Obs.NavbSubjects = ["Search","Contact","Settings","SignOn"]
  Obs.NavbSpecs    = [
    { type:"NavBarLeft" }
    { type:"Item", name:"Home",icon:"fa-home",topic:UI.toTopic("View",'Navb',UI.SelectView),subject:"Select" }
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

