
import Util from '../util/Util.js'

# Stream   is standalone base class for all publish and subscribe steams
# StreamRx extends Stream for RxJS
# SteamsXs extends Stream for xstream

class Stream

  constructor:( @subjectNames, @info ) ->
    @subjects = {}
    for subjectName in @subjectNames
      @addSubject( subjectName )
    Util.noop( @allInfo )

  subscribe:( subjectName, subscriberName, onCallback ) ->
    subject  = @getSubject( subjectName, false )
    subject['subscribers'][subscriberName] = onCallback
    if @isInfo( subjectName, 'subscribe' )
      console.info( 'Strean.subscribe()', { subject:subjectName, subscriber:subscriberName } )
    return

  publish:( subjectName, object ) ->
    subject = @getSubject( subjectName, false )
    for own subscriberName, onCallback of subject['subscribers']
      onCallback( object )
    if @isInfo( subjectName, 'publish')
      console.info( 'Stream.publish()', { subject:subjectName, object:object } )
    return

  event:( subjectName, object, element, eventType ) ->
    onEvent = ( event ) =>
      event?.stopPropagation()
      event?.preventDefault()
      @publish( subjectName, object )
      return
    element.addEventListener( eventType, onEvent )
    return

  complete:( subjectName, object, completeName, onComplete, completeObject ) ->
    subject = @getSubject( subjectName, false )
    subject[completeName] = {}
    for own subscriberName, onCallback of subject['subscribers']
      subject[completeName][subscriberName] = false
    for own subscriberName, onCallback of subject['subscribers']
      onSubscribe = ( object ) =>
        onCallback(   object )
        subject[completeName][subscriberName] = true
        if @isComplete( subject, completeName )
          onComplete( completeObject )
          if @isInfo( subjectName, 'complete' )
            console.info( 'Stream.complete()', { subject:subjectName, object:object, complete:completeName, completeObject:completeObject } )
      onSubscribe( object )
    return

  isComplete:( subject, completeName ) ->
    for own subscriberName, status of subject[completeName]
      return false if status is false
    true

  unsubscribe:( subjectName, subscriberName ) ->
    if @hasSubject( subjectName )
      if @hasSubscriber( subjectName, subscriberName )
        delete @subjects[subjectName].subscribers[subscriberName]
      else
        console.error( 'Strean.unsubscribe() unknown subscriber', { subject:subjectName, subscriber:subscriberName } )
    else
      console.error( 'Strean.unsubscribe() unknown subject', { subject:subjectName, subscriber:subscriberName } )

    if @isInfo( subjectName, 'subscribe' )
      console.info( 'Stream.unsubscribe()', { subject:subjectName, subscriber:subscriberName } )
    return

  unsubscribeAll:() ->
    for own subjectName, subject of @subjects
      for own subscriberName, onCallback of subject['subscribers']
        @unsubscribe( subjectName, subscriberName )
    return

  addSubject:( subjectName, warn=true ) ->
    if not @hasSubject(subjectName)
      subject                = {}
      subject['subscribers'] = {}
      @subjects[subjectName] = subject
    else
      console.warn( 'Stream.addSubject() subject already exists', subjectName ) if warn
    return

  hasSubject:( subjectName ) ->
    @subjects[ subjectName ]?

  hasSubscriber:( subjectName, subscriberName ) ->
    @hasSubject(  subjectName ) and @subjects[subjectName]['subscribers'][subscriberName]?

  # Get a subject by name. Create a new one if need with a warning
  getSubject:( subjectName, warn=true ) ->
    if not @hasSubject(subjectName)
      console.warn( 'Stream.getSubject() unknown name for subject so creating one for', subjectName ) if warn
      @addSubject( subjectName, false )
    @subjects[subjectName]

  isInfo:( subjectName, op ) ->
    Util.inArray( @info.subjects, subjectName ) and @info[op]? and @info[op]

  allInfo:() ->
    console.info( '--- Stream.Subjects --- ')
    for   own subjectName,    subject    of @subjects
      console.info( "  Subject #{subjectName}" )
      for own subscriberName, subscriber of subject.subscribers
        console.info( "    Subscriber #{subscriberName}" )
    return

`export default Stream`