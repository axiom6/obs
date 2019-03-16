
class Util

  constructor:() ->
    @dummy = ""
    Util.noop( Util.loadScript, Util.hasMethod, Util.dependsOn, Util.setInstance, Util.getInstance )
    Util.noop( Util.toError, Util.logJSON, Util.isNot, Util.isVal, Util.isntStr )
    Util.noop( Util.inIndex, Util.isEvent, Util.atArray, Util.atLength, Util.isStrInteger )
    Util.noop( Util.isStrCurrency, Util.isStrFloat, Util.isDefs, Util.toPosition, Util.xyScale )
    Util.noop( Util.resizeTimeout, Util.eventErrorCode, Util.toAlpha, Util.hashCode, Util.pdfCSS )
    Util.noop( Util.padStr, Util.isoDateTime, Util.toHMS, Util.toInt, Util.hex32 )
    Util.noop( Util.toFloat, Util.toCap, Util.match_test, Util.svgId, Util.saveFile )

  Util.myVar      =  'myVar'
  Util.skipReady  =  false
  Util.isCommonJS =  false
  Util.isWebPack  =  false

  Util.Load          = null
  Util.ModuleGlobals = []
  Util.app           = {}
  Util.testTrue      = true
  Util.debug         = false
  Util.message       = false
  Util.count         = 0
  Util.modules       = []
  Util.instances     = []
  Util.globalPaths   = []
  Util.root          = '../../' # Used internally
  Util.rootJS        =  Util.root + 'js/'
  Util.databases     = {}
  Util.htmlIds       = {} # Object of unique Html Ids
  Util.logStackNum   = 0
  Util.logStackMax   = 100
  Util.fills         = {}
  Util.uniqueIdExt   = ''

  @element:( $elem ) ->
    # console.log( 'Dom.element()', $elem, Dom.isJQueryElem( $elem ) )
    if Util.isJQueryElem( $elem )
      $elem.get(0)
    else if Util.isStr( $elem )
      $($elem).get(0)
    else
      console.error('Dom.domElement( $elem )', typeof($elem), $elem,
        '$elem is neither jQuery object nor selector' )
      $().get(0)

  @isJQueryElem:( $elem ) ->
    $? and $elem? and ( $elem instanceof $ || 'jquery' in Object($elem) )

  @loadScript:( path, fn ) ->
    head          = document.getElementsByTagName('head')[0];
    script        = document.createElement('script')
    script.src    = path
    script.async  = false
    script.onload = fn if Util.isFunc( fn )
    head.appendChild( script )
    return

  @ready:( fn ) ->
    if not Util.isFunc( fn )                  # Sanity check
      return
    else if Util.skipReady
      fn()
    else if document.readyState is 'complete' # If document is already loaded, run method
      fn()
    else
      document.addEventListener( 'DOMContentLoaded', fn, false )
    return

  @isChild:( key ) ->
    a = key.charAt(0)
    a is a.toUpperCase() and a isnt '$'

  # ---- Inquiry ----

  @hasMethod:( obj, method, issue=false ) ->
    has = typeof obj[method] is 'function'
    console.log( 'Util.hasMethod()', method, has )  if not has and issue
    has

  @hasGlobal:( global, issue=true ) ->
    has = window[global]?
    console.error( "Util.hasGlobal() #{global} not present" )  if not has and issue
    has

  @getGlobal:( global, issue=true ) ->
    if Util.hasGlobal( global, issue ) then window[global] else null

  @hasModule:( path, issue=true ) ->
    has = Util.modules[path]?
    console.error( "Util.hasModule() #{path} not present" )  if not has and issue
    has

  @dependsOn:() ->
    ok = true
    for arg in arguments
      has = Util.hasGlobal(arg,false) or Util.hasModule(arg,false) or Util.hasPlugin(arg,false)
      console.error( 'Missing Dependency', arg ) if not has
      ok = has if has is false
    ok

  # ---- Instances ----

  @setInstance:( instance, path ) ->
    console.log( 'Util.setInstance()', path )
    if not instance? and path?
      console.error('Util.setInstance() instance not defined for path', path )
    else if instance? and not path?
      console.error('Util.setInstance() path not defined for instance', instance.toString() )
    else
      Util.instances[path] = instance
    return

  @getInstance:( path, dbg=false ) ->
    console.log( 'getInstance', path ) if dbg
    instance = Util.instances[path]
    if not instance?
      console.error('Util.getInstance() instance not defined for path', path )
    instance

  # ---- Logging -------

  # args should be the arguments passed by the original calling function
  # This method should not be called directly
  @toStrArgs:( prefix, args ) ->
    Util.logStackNum = 0
    str = if Util.isStr(prefix) then prefix + " "  else ""
    for arg in args
      str += Util.toStr(arg) + " "
    str

  @toStr:( arg ) ->
    Util.logStackNum++
    return '' if Util.logStackNum > Util.logStackMax
    switch typeof(arg)
      when 'null'   then 'null'
      when 'string' then Util.toStrStr(arg)
      when 'number' then arg.toString()
      when 'object' then Util.toStrObj(arg)
      else arg

  # Recusively stringify arrays and objects
  @toStrObj:( arg ) ->
    str = ""
    if not arg?
      str += "null"
    else if Util.isArray(arg)
      str += "[ "
      for a in arg
        str += Util.toStr(a) + ","
      str = str.substr(0, str.length - 1) + " ]"
    else if Util.isObjEmpty(arg)
      str += "{}"
    else
      str += "{ "
      for own key, val of arg
        str += key + ":" + Util.toStr(val) + ", "
      str = str.substr(0, str.length - 2) + " }" # Removes last comma
    str

  @toStrStr:( arg ) ->
    if arg.length > 0 then arg
    else '""'

  @toOut:( obj, level=0 ) ->
    ind = Util.indent(level*2)
    out = ""
    for own key, val of obj when key.charAt(0) is key.charAt(0).toUpperCase()
      out += ind + key + '\n'
      out += Util.toOut(val,level+1) if Util.isObj(val)
    out


  # Consume unused but mandated variable to pass code inspections
  @noop:( ...args ) ->
    console.log( args ) if false
    return

  @toError:() ->
    str = Util.toStrArgs( 'Error:', arguments )
    new Error( str )

  @alert:(  ) ->
    str = Util.toStrArgs( '', arguments )
    console.log( str )
    alert( str )
    return

  @logJSON:(json) ->
    obj = JSON.parse( json )
    console.log( obj )
    return

  @jQueryHasNotBeenLoaded:() ->
    if typeof jQuery == 'undefined'
      console.error( 'Util JQuery has not been loaded' )
      true
    else
      false

  # ------ Validators ------

  @isDef:(d)         ->  d isnt null and typeof(d) isnt 'undefined'
  @isNot:(d)         ->  not Util.isDef(d)
  @isStr:(s)         ->  Util.isDef(s) and typeof(s)=="string" and s.length > 0
  @isntStr:(s)       ->  not Util.isStr(s)
  @isNum:(n)         ->  not isNaN(n)
  @isObj:(o)         ->  Util.isDef(o) and typeof(o) is "object"
  @isVal:(v)         ->  typeof(v)=="number" or typeof(v)=="string" or typeof(v)=="boolean"
  @isNaN:(v)         ->  Util.isDef(v) and typeof(v)=="number" and Number.isNaN(v)
  @isSym:(v)         ->  typeof(v)=="symbol"
  @isObjEmpty:(o)    ->  Util.isObj(o) and Object.getOwnPropertyNames(o).length is 0
  @isFunc:(f)        ->  Util.isDef(f) and typeof(f)=="function"
  @isArray:(a)       ->  Util.isDef(a) and typeof(a)!="string" and a.length? and a.length > 0
  @isEvent:(e)       ->  Util.isDef(e) and e.target?
  @inIndex:(a,i)     ->  Util.isArray(a) and 0 <= i and i < a.length
  @inArray:(a,e)     ->  Util.isArray(a) and a.indexOf(e) > -1
  @atArray:(a,e)     ->  if Util.inArray(a,e) then a.indexOf(e) else -1
  @inString:(s,e)    ->  Util.isStr(s)   and s.indexOf(e) > -1
  @atLength:(a,n)    ->  Util.isArray(a) and a.length==n
  @head:(a)          ->  if Util.isArray(a) then a[0]          else null
  @tail:(a)          ->  if Util.isArray(a) then a[a.length-1] else null
  @time:()           ->  new Date().getTime()
  @isStrInteger:(s)  -> /^\s*(\+|-)?\d+\s*$/.test(s)
  @isStrFloat:(s)    -> /^\s*(\+|-)?((\d+(\.\d+)?)|(\.\d+))\s*$/.test(s)
  @isStrCurrency:(s) -> /^\s*(\+|-)?((\d+(\.\d\d)?)|(\.\d\d))\s*$/.test(s)
  #@isStrEmail:(s)   -> /^\s*[\w\-\+_]+(\.[\w\-\+_]+)*\@[\w\-\+_]+\.[\w\-\+_]+(\.[\w\-\+_]+)*\s*$/.test(s)

  @isDefs:() ->
    for arg in arguments
      if not arg?
        return false
    true

  @checkTypes:( type, args ) ->
    for own key, arg of args
      # console.log( "Util.checkTypes isNum() argument #{key} is #{type}", arg, Util.isNum(arg) )
      if not Util.checkType( type, arg )
        console.log( "Util.checkTypes(type,args) argument #{key} is not #{type}", arg )
        console.trace()
    return

  @checkType:( type, arg ) ->
    switch type
      when "string"   then Util.isStr(arg)
      when "number"   then Util.isNum(arg)
      when "object"   then Util.isObj(arg)
      when "symbol"   then Util.isSym(arg)
      when "function" then Util.isFunc(arg)
      when "array"    then Util.isArray(arg)
      else                 false

  @copyProperties:( to, from ) ->
    for own key, val of from
      to[key] = val
    to

  @contains:( array, value ) ->
    Util.isArray(array) and array.indexOf(value) isnt -1

  # Screen absolute (left top width height) percent positioning and scaling

  # Percent array to position mapping
  @toPosition:( array ) ->
    { left:array[0], top:array[1], width:array[2], height:array[3] }

  # Adds Percent from array for CSS position mapping
  @toPositionPc:( array ) ->
    { position:'absolute', left:array[0]+'%', top:array[1]+'%', width:array[2]+'%', height:array[3]+'%' }

  @xyScale:( prev, next, port, land ) ->
    xp = 0
    yp = 0
    xn = 0
    yn = 0
    [xp,yp] = if prev.orientation is 'Portrait' then [port[2],port[3]] else [land[2],land[3]]
    [xn,yn] = if next.orientation is 'Portrait' then [port[2],port[3]] else [land[2],land[3]]
    xs = next.width  * xn  / ( prev.width  * xp )
    ys = next.height * yn  / ( prev.height * yp )
    [xs,ys]

  # ----------------- Guarded jQuery dependent calls -----------------

  @resize:( callback ) ->
    window.onresize = () ->
      setTimeout( callback, 100 )
    return

  @resizeTimeout:( callback, timeout = null ) ->
    window.onresize = () ->
      clearTimeout( timeout ) if timeout?
      timeout = setTimeout( callback, 100 )
    return

  # ------ Html ------------

  @getHtmlId:( name, type='', ext='' ) ->
    id = name + type + ext + Util.uniqueIdExt
    id.replace( /[ \.]/g, "" )

  @htmlId:( name, type='', ext='', issueError=true ) ->
    id = Util.getHtmlId( name, type, ext )
    console.error( 'Util.htmlId() duplicate html id', id ) if Util.htmlIds[id]? and issueError
    Util.htmlIds[id] = id
    id

  @clearHtmlIds:() ->
    Util.htmlIds = {}

  # ------ Converters ------

  @extend:( obj, mixin ) ->
    for own name, method of mixin
      obj[name] = method
    obj

  @include:( klass, mixin ) ->
    Util.extend( klass.prototype, mixin )

  @eventErrorCode:( e ) ->
    errorCode = if e.target? and e.target.errorCode then e.target.errorCode else 'unknown'
    { errorCode:errorCode }

  @toName:( s1 ) ->
    if not  s1?
      console.trace()
      return "???"
    s2 =  s1.replace('_',' ')
    s3 =  s2.replace(/([A-Z][a-z])/g, ' $1' )
    s4 =  s3.replace(/([A-Z]+)/g,     ' $1' )
    s5 =  s4.replace(/([0-9][A-Z])/g, ' $1' )
    s5

  @toAlpha:( s1 ) ->
    s1.replace( /\W/g, '' )

  @indent:(n) ->
    str = ''
    for i in [0...n]
      str += ' '
    str

  @hashCode:( str ) ->
    hash = 0
    for i in [0...str.length]
      hash = (hash<<5) - hash + str.charCodeAt(i)
    hash

  @lastTok:( str, delim ) ->
    str.split(delim).pop()

  @firstTok:( str, delim ) ->
    if Util.isStr(str) and str.split?
      str.split(delim)[0]
    else
      console.error( "Util.firstTok() str is not at string", str )
      ''

  @pdfCSS:( href ) ->
    return if not window.location.search.match(/pdf/gi)
    link      = document.createElement('link')
    link.rel  = 'stylesheet'
    link.type = 'text/css'
    link.href =  href
    document.getElementsByTagName('head')[0].appendChild link
    return

  ###
    parse = document.createElement('a')
    parse.href =  "http://example.com:3000/dir1/dir2/file.ext?search=test#hash"
    parse.protocol  "http:"
    parse.hostname  "example.com"
    parse.port      "3000"
    parse.pathname  "/dir1/dir2/file.ext"
    parse.segments  ['dir1','dir2','file.ext']
    parse.fileExt   ['file','ext']
    parse.file       'file'
    parse.ext        'ext'
    parse.search    "?search=test"
    parse.hash      "#hash"
    parse.host      "example.com:3000"
  ###

  @parseURI:( uri ) ->
    parse          = {}
    parse.params   = {}
    a              = document.createElement('a')
    a.href         = uri
    parse.href     = a.href
    parse.protocol = a.protocol
    parse.hostname = a.hostname
    parse.port     = a.port
    parse.segments = a.pathname.split('/')
    parse.fileExt  = parse.segments.pop().split('.')
    parse.file     = parse.fileExt[0]
    parse.ext      = if parse.fileExt.length==2 then parse.fileExt[1] else ''
    parse.dbName   = parse.file
    parse.fragment = a.hash
    parse.query    = if Util.isStr(a.search) then a.search.substring(1) else ''
    nameValues     = parse.query.split('&')
    if Util.isArray(nameValues)
      for nameValue in nameValues
        name  = ''
        value = ''
        [name,value] = nameValue.split('=')
        parse.params[name] = value
    parse

  @quicksort:( array ) ->
    return [] if array.length == 0
    head = array.pop()
    small = ( a for a in array when a <= head )
    large = ( a for a in array when a >  head )
    (Util.quicksort(small)).concat([head]).concat( Util.quicksort(large) )

  @pad:( n ) ->
    if n < 10 then '0'+n else n

  @padStr:( n ) ->
    if n < 10 then '0'+n.toString() else n.toString()

  # Return and ISO formated data string
  @isoDateTime:( dateIn ) ->
    date = if dateIn? then dateIn else new Date()
    console.log( 'Util.isoDatetime()', date )
    console.log( 'Util.isoDatetime()', date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes, date.getUTCSeconds )
    pad = (n) -> Util.pad(n)
    date.getFullYear()     +'-'+pad(date.getUTCMonth()+1)+'-'+pad(date.getUTCDate())+'T'+
    pad(date.getUTCHours())+':'+pad(date.getUTCMinutes())+':'+pad(date.getUTCSeconds())+'Z'

  @toHMS:( unixTime ) ->
    date =  new Date()
    date.setTime(unixTime) if Util.isNum(unixTime)
    hour = date.getHours()
    ampm = 'AM'
    if hour > 12
      hour = hour - 12
      ampm = 'PM'
    min  = ('0' + date.getMinutes()).slice(-2)
    sec  = ('0' + date.getSeconds()).slice(-2)
    time = "#{hour}:#{min}:#{sec} #{ampm}"
    time

  # Generate four random hex digits
  @hex4:() ->
    (((1+Math.random())*0x10000)|0).toString(16).substring(1)

  # Generate a 32 bits hex
  @hex32:() ->
    hex = @hex4()
    for i in [1..4]
      Util.noop(i)
      hex += @hex4()
    hex

  # Return a number with fixed decimal places
  @toFixed:( arg, dec=2 ) ->
    num = switch typeof(arg)
      when 'number' then arg
      when 'string' then parseFloat(arg)
      else 0
    num.toFixed(dec)

  @toInt:( arg ) ->
    switch typeof(arg)
      when 'number' then Math.floor(arg)
      when 'string' then  parseInt(arg)
      else 0

  @toFloat:( arg ) ->
    switch typeof(arg)
      when 'number' then arg
      when 'string' then parseFloat(arg)
      else 0

  @toCap:( str ) ->
    str.charAt(0).toUpperCase() + str.substring(1)

  @unCap:( str ) ->
    str.charAt(0).toLowerCase() + str.substring(1)

  @toArray:( objects, whereIn=null, keyField='id' ) ->
    where = if whereIn? then whereIn else () -> true
    array = []
    if Util.isArray(objects)
      for object in array  when where(object)
        object[keyField] = object['id'] if object['id']? and keyField isnt 'id'
        array.push( object )
    else
      for own key, object of objects when where(key,object)
        object[keyField] = key
        array.push(object)
    array

  @toObjects:( rows, whereIn=null, keyField='id' ) ->
    where = if whereIn? then whereIn else () -> true
    objects = {}
    if Util.isArray(rows)
      for row in rows when where(row)
        row[keyField] = row['id'] if row['id']? and keyField isnt 'id'
        objects[row[keyField]] = row
    else
      for key, row of rows when where(row)
        row[keyField] = key
        objects[key]  = row
    objects

  @lenObject:( object, where=()->true ) ->
    len = 0
    for own key, obj of object when where(key)
      len = len + 1
    len

  # Beautiful Code, Chapter 1.
  # Implements a regular expression matcher that supports character matches,
  # '.', '^', '$', and '*'.

  # Search for the regexp anywhere in the text.
  @match:(regexp, text) ->
    return Util.match_here(regexp.slice(1), text) if regexp[0] is '^'
    while text
      return true if Util.match_here(regexp, text)
      text = text.slice(1)
    false

  # Search for the regexp at the beginning of the text.
  @match_here:(regexp, text) ->
    cur = ""
    next = ""
    [cur, next] = [regexp[0], regexp[1]]
    if regexp.length is 0 then return true
    if next is '*' then return Util.match_star(cur, regexp.slice(2), text)
    if cur is '$' and not next then return text.length is 0
    if text and (cur is '.' or cur is text[0]) then return Util.match_here(regexp.slice(1), text.slice(1))
    false

  # Search for a kleene star match at the beginning of the text.
  @match_star:(c, regexp, text) ->
    loop
      return true if Util.match_here(regexp, text)
      return false unless text and (text[0] is c or c is '.')
      text = text.slice(1)

  @match_test:() ->
    console.log( Util.match_args("ex", "some text") )
    console.log( Util.match_args("s..t", "spit") )
    console.log( Util.match_args("^..t", "buttercup") )
    console.log( Util.match_args("i..$", "cherries") )
    console.log( Util.match_args("o*m", "vrooooommm!") )
    console.log( Util.match_args("^hel*o$", "hellllllo") )

  @match_args:( regexp, text ) ->
    console.log( regexp, text, Util.match(regexp,text) )

  @svgId:( name, type, svgType, check=false ) ->
    if check then @id( name, type, svgType ) else name + type + svgType
  @css:(   name, type=''       ) -> name + type
  @icon:(  name, type, fa      ) -> name + type + ' fa fa-' + fa

  # json - "application/json;charset=utf-8"
  # svg

  @mineType:( fileType ) ->
    mine = switch fileType
      when 'json' then "application/json"
      when 'adoc' then "text/plain"
      when 'html' then "text/html"
      when 'svg'  then "image/svg+xml"
      else             "text/plain"
    mine += ";charset=utf-8"
    mine

  @saveFile:( stuff, fileName, fileType ) ->
    blob = new Blob( [stuff], { type:@mineType(fileType) } )
    url  = window['URL'].createObjectURL(blob)
    downloadLink      = document.createElement("a")
    downloadLink.href = url;
    downloadLink.download = fileName
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    return

export default Util



