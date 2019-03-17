

import Util from '../util/Util.js'

class Data

  Data.hosted    = "https://ui-48413.firebaseapp.com/"
  Data.local     = "http://localhost:63342/obs/public/"
  Data.localJSON = "http://localhost:63342/obs/public/json"

  Util.noop( Data.hosted, Data.syncJSON, Data.planeData )

  # ---- Read JSON with batch async

  @batchRead:( batch, callback, create=null ) ->
    for  own key, obj of batch
      @batchJSON( obj,   batch, callback, create )
    return

  @batchComplete:( batch ) ->
    for own key, obj of batch
      return false if not obj['data']
    true

  @batchJSON:( obj, batch, callback, create=null ) ->
    return if Util.jQueryHasNotBeenLoaded()
    url      = Data.baseUrl() + obj.url
    settings = { url:url, type:'GET', dataType:'json', processData:false, contentType:'application/json', accepts:'application/json' }
    settings.success = ( data,  status, jqXHR ) =>
      Util.noop( status, jqXHR  )
      obj['data'] =     if Util.isFunc(create) then create( data, obj.type ) else data
      callback( batch ) if Data.batchComplete( batch )
    settings.error = ( jqXHR, status, error ) =>
      Util.noop( jqXHR )
      console.error( "Data.batchJSON()", { url:url, status:status, error:error } )
    $.ajax( settings )
    return

  @planeData:( batch, plane ) ->
    batch[plane].data[plane]

  @baseUrl:() ->
    if window.location.href.includes('localhost') then Data.local else Data.hosted

  @asyncJSON:( url, callback ) ->
    return if Util.jQueryHasNotBeenLoaded()
    url = Data.baseUrl() + url
    settings  = { url:url, type:'GET', dataType:'json', processData:false, contentType:'application/json', accepts:'application/json' }
    settings.success = ( data,  status, jqXHR ) =>
      Util.noop( status, jqXHR  )
      callback( data )
    settings.error   = ( jqXHR, status, error ) =>
      Util.noop( jqXHR )
      console.error( "Data.asyncJSON()", { url:url, status:status, error:error } )
    $.ajax( settings )
    return

  @syncJSON:( path ) ->
    return {} if Util.jQueryHasNotBeenLoaded()
    jqxhr = $.ajax( { type:"GET", url:path, dataType:'json', cache:false, async:false } )
    jqxhr['responseJSON']

  # ------ Quick JSON read ------

  @read:( url, doJson ) ->
    if Util.isObj( url )
      Data.readFile( url, doJson )
    else
      Data.readAjax( url, doJson )
    return

  @readFile:( fileObj, doJson ) ->
    fileReader = new FileReader()
    fileReader.onerror = (e) -> console.error( 'Store.readFile', fileObj.name, e.target.error )
    fileReader.onload  = (e) -> doJson( JSON.parse(e.target.result) )
    fileReader.readAsText( fileObj )
    return

  @readAjax:( url, doJson ) ->                   #jsonp
    settings  = { url:url, type:'get', dataType:'json', processData:false, contentType:'application/json', accepts:'application/json' }
    settings.success = ( data,  status, jqXHR ) =>
      Util.noop( status, jqXHR )
      json   = JSON.parse( data )
      doJson( json )
    settings.error   = ( jqXHR, status, error ) =>
      console.error( 'Store.ajaxGet', { url:url, status:status, error:error } )
    $.ajax( settings )
    return

  @saveFile:( data, fileName ) ->
    htmlBlob = new Blob( [data], { type:"text/html;charset=utf-8" } )
    htmlUrl  = window['URL'].createObjectURL(htmlBlob)
    downloadLink          = document.createElement("a")
    downloadLink.href     = htmlUrl
    downloadLink.download = fileName
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    return

  Data.Databases = {
    color: {
      id:"color"
      key:"id"
      uriLoc:Data.localJSON+'/color'
      uriWeb:'https://github.com/axiom6/ui/data/color'
      tables:['master','ncs','gray'] }
    exit: {
      id:"exit"
      key:"_id"
      uriLoc:Data.localJSON+'/exit'
      uriWeb:'https://github.com/axiom6/ui/data/exit'
      tables:['ConditionsEast','ConditionsWest','Deals','Forecasts','I70Mileposts','SegmentsEast','SegmentsWest'] }
    radar:{
      id:"radar"
      key:"name"
      uriLoc:Data.localJSON+'/radar'
      uriWeb:'https://github.com/axiom6/ui/data/radar'
      tables:['axiom-techs','axiom-quads','axiom-techs-schema','axiom-quads-schema','polyglot-principles'] }
    sankey:{
      id:"radar"
      uriLoc:Data.localJSON+'/sankey'
      uriWeb:'https://github.com/axiom6/ui/data/sankey'
      tables:['energy','flare','noob','plot'] }
    muse:{
      id:"muse"
      uriLoc:Data.localJSON+'/muse'
      uriWeb:'https://github.com/axiom6/ui/data/muse'
      tables:['Columns','Rows','Practices'] }
    pivot:{
      id:"pivot"
      uriLoc:Data.localJSON+'/pivot'
      uriWeb:'https://github.com/axiom6/ui/data/pivot'
      tables:['mps'] }
    geo:{
      id:"geo"
      uriLoc:Data.localJSON+'/geo'
      uriWeb:'https://github.com/axiom6/ui/data/geo'
      tables:['upperLarimerGeo']
      schemas:['GeoJSON'] }
    f6s:{
      id:"f6s"
      uriLoc:Data.localJSON+'/f6s'
      uriWeb:'https://github.com/axiom6/ui/data/fs6'
      tables:['applications','followers','mentors','profile','teams'] }
  }

export default Data