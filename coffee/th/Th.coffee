import Util  from '../util/Util.js'
import Data  from '../util/Data.js'
import Build from '../prac/Build.js'
import Cube  from '../th/Cube.js'
import Rect  from '../th/Rect.js'
import * as THREE    from '../three/three.module.js'
import OrbitControls from '../three/OrbitControls.js'

class Th

  @load:() ->
    Data.local  = "http://localhost:63342/muse/public/"
    Data.hosted = "https://ui-48413.firebaseapp.com/"
    Th.FontUrl  = "webfonts/helvetiker_regular.typeface.json"
    Th.Batch =
      Muse: { url:'json/pract/Muse.json', data:null, type:'Spec' }
      Info: { url:'json/pract/Info.json', data:null, type:'Pack' }
      Know: { url:'json/pract/Know.json', data:null, type:'Pack' }
      Wise: { url:'json/pract/Wise.json', data:null, type:'Pack' }
      Font: { url:Th.FontUrl,             data:null, type:'Spec' }

    Data.batchRead( Th.Batch, Th.init )
    return

  @init:( batch ) ->
    Util.ready ->
      build = new Build( batch )
      th    = new Th( build, 'Th', false )
      th.animate()
      return

  constructor:( @build, @parId, @guiFlag ) ->

    # console.trace()
    @stream  = null # Set by subscribe()
    @parElem = document.getElementById(@parId)
    [@ikwElem,@guiElem] = @createElems( @parElem, @guiFlag )

    @scene    = new THREE.Scene()
    @renderer = new THREE.WebGLRenderer( { antialias:true } )
    @ikwElem.appendChild( @renderer.domElement )
    [@screenWidth,@screenHeight,@aspectRatio] = @resizeScreen() # Accesses @ikwElem
    @renderer.setSize( @screenWidth, @screenHeight )
    @renderer.setClearColor( 0x000000, 1) # 0x333F47, 1
    @renderer.shadowMap.enabled = true
    @renderer.shadowMapSoft = true

    @camera = new THREE.PerspectiveCamera( 45, @aspectRatio, 1, 10000 )
    @camera.position.set( 0, 6, 1200 )
    @camera.lookAt( @scene.position )
    @scene.add(@camera)

    @axes = new THREE.AxesHelper( 2 )
    @scene.add( @axes )

    @fontPrac = new THREE.Font( @build.batch.Font.data )

    @group = @ikw()
    @lights()
    [@gui,@act] = @ui( @group, @guiElem ) if @guiFlag

    @controls = new OrbitControls( @camera, @renderer.domElement )
    window.addEventListener( 'resize', @resizeScreen, false )

  subscribe:( stream ) ->
    @stream     = stream
    @act        = @createAct( @group )
    @traversals = @createTraversals( @act )
    @stream.subscribe( 'Select', 'Th', (topic) => @onSelect(topic) )
    return

  onSelect:( topic ) =>
    # console.log( 'Th.onCube()', name )
    switch   topic.name
      when 'Cube'         then Util.noop()
      when 'Planes'       then Util.noop()
      when 'Information'  then @traversals.info()
      when 'Knowledge'    then @traversals.know()
      when 'Wisdom'       then @traversals.wise()
      when 'Dimensions'   then Util.noop()
      when 'Embrace'      then @traversals.embrace()
      when 'Innovate'     then @traversals.innovate()
      when 'Encourage'    then @traversals.encourage()
      when 'Perspectives' then Util.noop()
      when 'Learn'        then @traversals.learn()
      when 'Do'           then @traversals.doDo()
      when 'Share'        then @traversals.share()
      else console.error( 'Th.onSelect()', topic )
    return

  deg2rad:( degree ) ->
   degree*(Math.PI/180)

  resizeScreen:() =>
    @screenWidth  = @ikwElem.clientWidth   # window.innerWidth
    @screenHeight = @ikwElem.clientHeight  # window.innerHeight
    @aspectRatio  = @screenWidth  / @screenHeight
    if @camera? and @renderer?
       @camera.aspect = @aspectRatio
       @camera.updateProjectionMatrix();
       @renderer.setSize( @screenWidth, @screenHeight )
    #console.log( "resizeScreen", { width:@screenWidth, height:@screenHeight } )
    [@screenWidth,@screenHeight,@aspectRatio]

  space:() ->
    sp = {}
    sp.modelRatio    =  @aspectRatio / 2
    sp.cubeSize      =  144
    sp.cubeWidth     =  sp.cubeSize * 2.0
    sp.cubeHeight    =  sp.cubeSize * sp.modelRatio * 0.8
    sp.colsHeight    =  sp.cubeSize * sp.modelRatio * 0.5

    sp.cubeDepth     =  sp.cubeSize
    sp.cubeHalf      =  sp.cubeSize   / 2
    sp.horzSpace     =  sp.cubeSize   * 2 / 3
    sp.vertSpace     =  sp.horzSpace  * sp.modelRatio
    sp.zzzzSpace     =  sp.horzSpace
    sp.colsDepth     =  sp.cubeSize * 3 + sp.zzzzSpace * 2
    sp.x1            =  sp.cubeWidth  + sp.horzSpace
    sp.x2            =  0
    sp.x3            = -sp.cubeWidth  - sp.horzSpace
    sp.yc            =  sp.cubeHeight + sp.vertSpace * 2.2
    sp.y1            =  sp.cubeHeight + sp.vertSpace
    sp.y2            =     0
    sp.y3            = -sp.cubeHeight - sp.vertSpace
    sp.z1            =  sp.cubeDepth  + sp.zzzzSpace
    sp.z2            =  0
    sp.z3            = -sp.cubeDepth  - sp.zzzzSpace
    sp.zc            =  0
    sp.studyWidth    =  sp.cubeWidth  / 3
    sp.studyHeight   =  sp.cubeHeight / 3
    sp.sw            =  sp.studyWidth
    sp.sh            =  sp.studyHeight
    sp.cw            =  sp.studyWidth
    sp.ch            =  sp.studyHeight * 0.5
    sp.sx            = { center:0, west:-sp.sw, north:0,         east:sp.sw, south:0          }
    sp.sy            = { center:0, west:0,      north:sp.sh,     east:0,     south:-sp.sh     }
    sp.cx            = { center:0, west:-sp.sw, north:0,         east:sp.sw, south:0          }
    sp.cy            = { center:0, west:0,      north:sp.sh*0.5, east:0,     south:-sp.sh*0.5 }
    sp

  ikw: () ->
    sp    = @space()
    group = new THREE.Group()
    for plane   in [ { name:'Info',    z:sp.z1 }, { name:'Know',     z:sp.z2 }, { name:'Wise',      z:sp.z3 } ]
      for row   in [ { name:'Learn',   y:sp.y1 }, { name:'Do',       y:sp.y2 }, { name:'Share',     y:sp.y3 } ]
        for col in [ { name:'Embrace', x:sp.x3 }, { name:'Innovate', x:sp.x2 }, { name:'Encourage', x:sp.x1 } ]
          practice  = @build.getPractice( row.name, col.name, plane.name )
          # console.log( 'Th.ikw()', practice.name, row.name, col.name, plane.name )
          pracCube  = new Cube( plane.name, row.name, col.name, practice.name, [col.x,row.y,plane.z],
            [sp.cubeWidth,sp.cubeHeight,sp.cubeDepth],practice['hsv'], 0.6, @fontPrac )
          pracGroup = new THREE.Group()
          pracGroup.add( pracCube.mesh  )
          for key, study of practice when Util.isChild(key)
            x = col.x + sp.sx[study.dir]
            y = row.y + sp.sy[study.dir]
            z = plane.z
            studyCube = new Rect( plane.name, row.name, col.name, study.name, [x,y,z], [sp.sw,sp.sh],study['hsv'], 1.0, @fontPrac, 0x000000 )
            pracGroup.add( studyCube.mesh  )
          group.add( pracGroup )
    group.add( @cols() )
    @convey(  sp, group )
    @flow(    sp, group )
    @conduit( sp, group )
    group.material = new THREE.MeshLambertMaterial( { color:0x888888, transparent:true, opacity:0.5, side:THREE.DoubleSide } )
    group.rotation.set( 0, 0, 0 )
    group.position.set( 0, 0, 0 )
    group.scale.set(    1, 1, 1 )
    @scene.add( group )
    group

  cols: () ->
    sp    = @space()
    group = new THREE.Group()
    for col in [ { name:'Embrace', x:sp.x3 }, { name:'Innovate', x:sp.x2 }, { name:'Encourage', x:sp.x1 } ]
      practice  = @build.getCol( col.name )
      pracCube  = new Cube( 'Cols', 'Dim', col.name, col.name, [col.x,sp.yc,sp.zc],
        [sp.cubeWidth,sp.colsHeight,sp.colsDepth],practice['hsv'], 0.6, @fontPrac )
      pracGroup = new THREE.Group()
      pracGroup.add( pracCube.mesh  )
      for plane in [ { name:'Info', z:sp.z1 }, { name:'Know', z:sp.z2 }, { name:'Wise', z:sp.z3 } ]
        x = col.x
        y = sp.yc
        z = plane.z
        studyCube = new Rect( plane, 'Dim', col.name, col.name, [x,y,z], [sp.cw,sp.ch], [0,0,0], 0.0, @fontPrac, 0xFFFFFF )
        pracGroup.add( studyCube.mesh  )
        for key, study of practice when Util.isChild(key)
          x = col.x + sp.cx[study.dir]
          y = sp.yc + sp.cy[study.dir]
          z = plane.z
          studyCube = new Rect( 'Cols', 'Dim', col.name, key, [x,y,z], [sp.cw,sp.ch],study['hsv'], 1.0, @fontPrac, 0x000000 )
          pracGroup.add( studyCube.mesh  )
      group.add( pracGroup )
    group.material = new THREE.MeshLambertMaterial( { color:0x888888, transparent:true, opacity:0.5, side:THREE.DoubleSide } )
    group.rotation.set( 0, 0, 0 )
    group.position.set( 0, 0, 0 )
    group.scale.set(    1, 1, 1 )
    @scene.add( group )
    group

  convey:( sp, group ) ->
    hsv = [0,50,50]
    w =   sp.horzSpace
    h =   sp.studyHeight
    x = ( sp.cubeWidth + w ) / 2
    for plane   in [ { name:'Info',    z:sp.z1 },   { name:'Know',     z:sp.z2 }, { name:'Wise',     z:sp.z3 } ]
      for row   in [ { name:'Learn',   y:sp.y1 },   { name:'Do',       y:sp.y2 }, { name:'Share',    y:sp.y3 } ]
        for col in [ { name:'Embrace', x:sp.x3+x }, { name:'Innovate', x:sp.x2+x } ]
          practice  = @build.getPractice( row.name, col.name, plane.name )
          name = @build.connectName( practice, 'east', false )
          rect = new Rect( plane.name, row.name, col.name, name, [col.x,row.y,plane.z], [w,h],hsv, 0.7, @fontPrac, 0xFFFFFF  )
          group.add( rect.mesh )
    return

  flow:( sp, group ) ->
    hsv = [0,50,50]
    w =   sp.studyWidth
    h =   sp.vertSpace
    y = ( sp.cubeHeight + h ) / 2
    for plane   in [ { name:'Info',    z:sp.z1 },  { name:'Know',     z:sp.z2   }, { name:'Wise',      z:sp.z3 } ]
      for row   in [ { name:'Learn',   y:sp.y1-y}, { name:'Do',       y:sp.y2-y } ]
        for col in [ { name:'Embrace', x:sp.x3},   { name:'Innovate', x:sp.x2   }, { name:'Encourage', x:sp.x1 } ]
          practice  = @build.getPractice( row.name, col.name, plane.name )
          name = @build.connectName( practice, 'south', false )
          rect = new Rect( plane.name, row.name, col.name, name, [col.x,row.y,plane.z], [w,h],hsv, 0.7, @fontPrac, 0xFFFFFF  )
          group.add( rect.mesh )
    return

  conduit:( sp, group ) ->
    hsv = [0,50,50]
    w =   sp.studyWidth
    h =   sp.zzzzSpace
    z = ( sp.cubeDepth + h ) / 2
    for plane   in [ { name:'Info', z:sp.z1-z }, { name:'Know', z:sp.z2-z } ]
      for row   in [ { name:'Learn',       y:sp.y1 },   { name:'Do',        y:sp.y2   }, { name:'Share',    y:sp.y3 } ]
        for col in [ { name:'Embrace',     x:sp.x3 },   { name:'Innovate',  x:sp.x2   }, { name:'Encourage',x:sp.x1 } ]
          practice  = @build.getPractice( row.name, col.name, plane.name )
          name = @build.connectName( practice, 'next', true )
          rect = new Rect( plane.name, row.name, col.name, name, [0,0,0], [w,h],hsv, 0.7, @fontPrac, 0xFFFFFF )
          rect.mesh.rotation.x = -Math.PI / 2
          rect.mesh.position.x = col.x
          rect.mesh.position.y = row.y
          rect.mesh.position.z = plane.z
          group.add( rect.mesh )
    return
  
  lights:() ->

    object3d  = new THREE.DirectionalLight( 'white', 0.15 )
    object3d.position.set(6,3,9)
    object3d.name = 'Back light'
    @scene.add(object3d)

    object3d = new THREE.DirectionalLight( 'white', 0.35 );
    object3d.position.set(-6, -3, 0)
    object3d.name   = 'Key light'
    @scene.add(object3d)

    object3d = new THREE.DirectionalLight( 'white', 0.55 )
    object3d.position.set(9, 9, 6)
    object3d.name = 'Fill light'
    @scene.add(object3d)

    spotLight = new THREE.SpotLight( 0xffffff )
    spotLight.position.set( 3, 30, 3 )
    spotLight.castShadow = true
    spotLight.shadow.mapSize.width  = 2048
    spotLight.shadow.mapSize.height = 2048
    spotLight.shadow.camera.near    = 1
    spotLight.shadow.camera.far     = 4000
    spotLight.shadow.camera.fov     = 45
    @scene.add( spotLight )
    return

  createElems:( parElem, guiFlag ) ->
    return [parElem,null] if not guiFlag
    ikwElem  = document.createElement( 'div'  )
    guiElem  = document.createElement( 'div'  )
    parElem.appendChild( ikwElem )
    parElem.appendChild( guiElem )
    ikwStyle = document.createAttribute('style')
    guiStyle = document.createAttribute('style')
    ikwStyle.value = "position:absolute; left:  0; top:0; width:80%; height:100%;"
    guiStyle.value = "position:absolute; left:80%; top:0; width:20%; height:100%; background-color:black;"
    ikwElem.setAttributeNode( ikwStyle )
    guiElem.setAttributeNode( guiStyle )

    [ikwElem,guiElem]

  traverse:( prop, name, act ) =>
    act[name] = not act[name] if @stream?
    # console.log( 'Th.traverse()', { prop:prop, name:name, visible:act[name] } )
    reveal = (child) =>
      # console.log( 'Th.traverse.beg', { name:child.name, tprop:prop, cprop:child[prop], value:value, visible:child.visible } )
      if child[prop]? and child[prop] is name
         child.visible = act[name]
      # console.log( 'Th.traverse.end', { name:child.name, geom:child.geom, prop:prop, value:value, visible:child.visible } )
    @group.traverse( reveal ) if @group?
    return

  createAct:( group ) ->
    {
      Info    : true, Know      : true, Wise      : true,
      Learn   : true, Do        : true, Share     : true,
      Embrace : true, Innovate  : true, Encourage : true,
      Opacity:group.material.opacity, Color:group.material.color,
      RotationX:group.rotation.x, RotationY:group.rotation.y, RotationZ:group.rotation.z,
      PositionX:0, PositionY:0,  PositionZ:0,
      ScaleX:1,    ScaleY:1,     ScaleZ:1
    }

  createTraversals:( act ) ->
    {
      info:      () => @traverse( 'plane', 'Info',      act )
      know:      () => @traverse( 'plane', 'Know',      act )
      wise:      () => @traverse( 'plane', 'Wise',      act )
      learn:     () => @traverse( 'row',   'Learn',     act )
      doDo:      () => @traverse( 'row',   'Do',        act )
      share:     () => @traverse( 'row',   'Share',     act )
      embrace:   () => @traverse( 'col',   'Embrace',   act )
      innovate:  () => @traverse( 'col',   'Innovate',  act )
      encourage: () => @traverse( 'col',   'Encourage', act )
    }

  ui:( group, guiElem ) ->

    act       = @createAct( group )
    traverals = @createTraversals( act )

    dat = Util.getGlobal('dat')
    gui = dat.GUI( { autoPlace: false } )
    guiElem.appendChild( gui.domElement )

    f1 = gui.addFolder('Planes')
    f1.add( act, 'Info' ).onChange( traverals.info )
    f1.add( act, 'Know' ).onChange( traverals.know )
    f1.add( act, 'Wise' ).onChange( traverals.wise )

    f2 = gui.addFolder('Rows')
    f2.add( act, 'Learn' ).onChange( traverals.learn )
    f2.add( act, 'Do'    ).onChange( traverals.doDo  )
    f2.add( act, 'Share' ).onChange( traverals.share )

    f3 = gui.addFolder('Cols')
    f3.add( act, 'Embrace'   ).onChange( traverals.embrace   )
    f3.add( act, 'Innovate'  ).onChange( traverals.innovate  )
    f3.add( act, 'Encourage' ).onChange( traverals.encourage )

    f4 = gui.addFolder('Rotation')
    f4.add( act, 'RotationX', -180, 180 ).onChange( () => group.rotation.x = @deg2rad(act.RotationX) )
    f4.add( act, 'RotationY', -180, 180 ).onChange( () => group.rotation.y = @deg2rad(act.RotationY) )
    f4.add( act, 'RotationZ', -180, 180 ).onChange( () => group.rotation.z = @deg2rad(act.RotationZ) )

    f5 = gui.addFolder('Position');
    f5.add( act, 'PositionX', -500, 500 ).onChange( () -> group.position.x = act.PositionX )
    f5.add( act, 'PositionY', -500, 500 ).onChange( () -> group.position.y = act.PositionY )
    f5.add( act, 'PositionZ', -500, 500 ).onChange( () -> group.position.z = act.PositionZ )

    f6 = gui.addFolder('Scale')
    f6.add( act, 'ScaleX', 0.1, 5 ).onChange( () -> group.scale.x = act.ScaleX )
    f6.add( act, 'ScaleY', 0.1, 5 ).onChange( () -> group.scale.y = act.ScaleY )
    f6.add( act, 'ScaleZ', 0.1, 5 ).onChange( () -> group.scale.z = act.ScaleZ )

    [gui,act]

  animate:() =>
    requestAnimationFrame( @animate )
    @controls.update();
    @renderScene()
    return

  renderScene:() ->
    @renderer.render( @scene, @camera )
    return

  geom:() ->

    geometry = new THREE.BoxGeometry( 2, 2, 2 )
    material = new THREE.MeshLambertMaterial({ color:color, transparent:true } )
    mesh     = new THREE.Mesh(geometry, material)
    mesh.position.set(0, 0, 0)
    mesh.rotation.set(0, 0, 0)
    mesh.rotation.y = @deg2rad(-90)
    mesh.scale.set(1, 1, 1)
    mesh.doubleSided = true
    mesh.castShadow = true
    @scene.add(mesh)

    geometry2 = new THREE.BoxGeometry( 1, 1, 1 )
    material2 = new THREE.MeshLambertMaterial({ color:color, transparent:true } )
    mesh2     = new THREE.Mesh(geometry2, material2)
    @scene.add(mesh2)
    return

export default Th

