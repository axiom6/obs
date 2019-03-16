var Th;

import Util from '../util/Util.js';

import Data from '../util/Data.js';

import Build from '../prac/Build.js';

import Cube from '../th/Cube.js';

import Rect from '../th/Rect.js';

import * as THREE from '../three/three.module.js';

import OrbitControls from '../three/OrbitControls.js';

Th = class Th {
  static load() {
    Data.local = "http://localhost:63342/muse/public/";
    Data.hosted = "https://ui-48413.firebaseapp.com/";
    Th.FontUrl = "webfonts/helvetiker_regular.typeface.json";
    Th.Batch = {
      Muse: {
        url: 'json/pract/Muse.json',
        data: null,
        type: 'Spec'
      },
      Info: {
        url: 'json/pract/Info.json',
        data: null,
        type: 'Pack'
      },
      Know: {
        url: 'json/pract/Know.json',
        data: null,
        type: 'Pack'
      },
      Wise: {
        url: 'json/pract/Wise.json',
        data: null,
        type: 'Pack'
      },
      Font: {
        url: Th.FontUrl,
        data: null,
        type: 'Spec'
      }
    };
    Data.batchRead(Th.Batch, Th.init);
  }

  static init(batch) {
    return Util.ready(function() {
      var build, th;
      build = new Build(batch);
      th = new Th(build, 'Th', false);
      th.animate();
    });
  }

  constructor(build1, parId, guiFlag1) {
    this.onSelect = this.onSelect.bind(this);
    this.resizeScreen = this.resizeScreen.bind(this);
    this.traverse = this.traverse.bind(this);
    this.animate = this.animate.bind(this);
    this.build = build1;
    this.parId = parId;
    this.guiFlag = guiFlag1;
    // console.trace()
    this.stream = null; // Set by subscribe()
    this.parElem = document.getElementById(this.parId);
    [this.ikwElem, this.guiElem] = this.createElems(this.parElem, this.guiFlag);
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    this.ikwElem.appendChild(this.renderer.domElement);
    [this.screenWidth, this.screenHeight, this.aspectRatio] = this.resizeScreen(); // Accesses @ikwElem
    this.renderer.setSize(this.screenWidth, this.screenHeight);
    this.renderer.setClearColor(0x000000, 1); // 0x333F47, 1
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMapSoft = true;
    this.camera = new THREE.PerspectiveCamera(45, this.aspectRatio, 1, 10000);
    this.camera.position.set(0, 6, 1200);
    this.camera.lookAt(this.scene.position);
    this.scene.add(this.camera);
    this.axes = new THREE.AxesHelper(2);
    this.scene.add(this.axes);
    this.fontPrac = new THREE.Font(this.build.batch.Font.data);
    this.group = this.ikw();
    this.lights();
    if (this.guiFlag) {
      [this.gui, this.act] = this.ui(this.group, this.guiElem);
    }
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    window.addEventListener('resize', this.resizeScreen, false);
  }

  subscribe(stream) {
    this.stream = stream;
    this.act = this.createAct(this.group);
    this.traversals = this.createTraversals(this.act);
    this.stream.subscribe('Select', 'Th', (topic) => {
      return this.onSelect(topic);
    });
  }

  onSelect(topic) {
    // console.log( 'Th.onCube()', name )
    switch (topic.name) {
      case 'Cube':
        Util.noop();
        break;
      case 'Planes':
        Util.noop();
        break;
      case 'Information':
        this.traversals.info();
        break;
      case 'Knowledge':
        this.traversals.know();
        break;
      case 'Wisdom':
        this.traversals.wise();
        break;
      case 'Dimensions':
        Util.noop();
        break;
      case 'Embrace':
        this.traversals.embrace();
        break;
      case 'Innovate':
        this.traversals.innovate();
        break;
      case 'Encourage':
        this.traversals.encourage();
        break;
      case 'Perspectives':
        Util.noop();
        break;
      case 'Learn':
        this.traversals.learn();
        break;
      case 'Do':
        this.traversals.doDo();
        break;
      case 'Share':
        this.traversals.share();
        break;
      default:
        console.error('Th.onSelect()', topic);
    }
  }

  deg2rad(degree) {
    return degree * (Math.PI / 180);
  }

  resizeScreen() {
    this.screenWidth = this.ikwElem.clientWidth; // window.innerWidth
    this.screenHeight = this.ikwElem.clientHeight; // window.innerHeight
    this.aspectRatio = this.screenWidth / this.screenHeight;
    if ((this.camera != null) && (this.renderer != null)) {
      this.camera.aspect = this.aspectRatio;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.screenWidth, this.screenHeight);
    }
    //console.log( "resizeScreen", { width:@screenWidth, height:@screenHeight } )
    return [this.screenWidth, this.screenHeight, this.aspectRatio];
  }

  space() {
    var sp;
    sp = {};
    sp.modelRatio = this.aspectRatio / 2;
    sp.cubeSize = 144;
    sp.cubeWidth = sp.cubeSize * 2.0;
    sp.cubeHeight = sp.cubeSize * sp.modelRatio * 0.8;
    sp.colsHeight = sp.cubeSize * sp.modelRatio * 0.5;
    sp.cubeDepth = sp.cubeSize;
    sp.cubeHalf = sp.cubeSize / 2;
    sp.horzSpace = sp.cubeSize * 2 / 3;
    sp.vertSpace = sp.horzSpace * sp.modelRatio;
    sp.zzzzSpace = sp.horzSpace;
    sp.colsDepth = sp.cubeSize * 3 + sp.zzzzSpace * 2;
    sp.x1 = sp.cubeWidth + sp.horzSpace;
    sp.x2 = 0;
    sp.x3 = -sp.cubeWidth - sp.horzSpace;
    sp.yc = sp.cubeHeight + sp.vertSpace * 2.2;
    sp.y1 = sp.cubeHeight + sp.vertSpace;
    sp.y2 = 0;
    sp.y3 = -sp.cubeHeight - sp.vertSpace;
    sp.z1 = sp.cubeDepth + sp.zzzzSpace;
    sp.z2 = 0;
    sp.z3 = -sp.cubeDepth - sp.zzzzSpace;
    sp.zc = 0;
    sp.studyWidth = sp.cubeWidth / 3;
    sp.studyHeight = sp.cubeHeight / 3;
    sp.sw = sp.studyWidth;
    sp.sh = sp.studyHeight;
    sp.cw = sp.studyWidth;
    sp.ch = sp.studyHeight * 0.5;
    sp.sx = {
      center: 0,
      west: -sp.sw,
      north: 0,
      east: sp.sw,
      south: 0
    };
    sp.sy = {
      center: 0,
      west: 0,
      north: sp.sh,
      east: 0,
      south: -sp.sh
    };
    sp.cx = {
      center: 0,
      west: -sp.sw,
      north: 0,
      east: sp.sw,
      south: 0
    };
    sp.cy = {
      center: 0,
      west: 0,
      north: sp.sh * 0.5,
      east: 0,
      south: -sp.sh * 0.5
    };
    return sp;
  }

  ikw() {
    var col, group, i, j, k, key, len, len1, len2, plane, pracCube, pracGroup, practice, ref, ref1, ref2, row, sp, study, studyCube, x, y, z;
    sp = this.space();
    group = new THREE.Group();
    ref = [
      {
        name: 'Info',
        z: sp.z1
      },
      {
        name: 'Know',
        z: sp.z2
      },
      {
        name: 'Wise',
        z: sp.z3
      }
    ];
    for (i = 0, len = ref.length; i < len; i++) {
      plane = ref[i];
      ref1 = [
        {
          name: 'Learn',
          y: sp.y1
        },
        {
          name: 'Do',
          y: sp.y2
        },
        {
          name: 'Share',
          y: sp.y3
        }
      ];
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        row = ref1[j];
        ref2 = [
          {
            name: 'Embrace',
            x: sp.x3
          },
          {
            name: 'Innovate',
            x: sp.x2
          },
          {
            name: 'Encourage',
            x: sp.x1
          }
        ];
        for (k = 0, len2 = ref2.length; k < len2; k++) {
          col = ref2[k];
          practice = this.build.getPractice(row.name, col.name, plane.name);
          // console.log( 'Th.ikw()', practice.name, row.name, col.name, plane.name )
          pracCube = new Cube(plane.name, row.name, col.name, practice.name, [col.x, row.y, plane.z], [sp.cubeWidth, sp.cubeHeight, sp.cubeDepth], practice['hsv'], 0.6, this.fontPrac);
          pracGroup = new THREE.Group();
          pracGroup.add(pracCube.mesh);
          for (key in practice) {
            study = practice[key];
            if (!(Util.isChild(key))) {
              continue;
            }
            x = col.x + sp.sx[study.dir];
            y = row.y + sp.sy[study.dir];
            z = plane.z;
            studyCube = new Rect(plane.name, row.name, col.name, study.name, [x, y, z], [sp.sw, sp.sh], study['hsv'], 1.0, this.fontPrac, 0x000000);
            pracGroup.add(studyCube.mesh);
          }
          group.add(pracGroup);
        }
      }
    }
    group.add(this.cols());
    this.convey(sp, group);
    this.flow(sp, group);
    this.conduit(sp, group);
    group.material = new THREE.MeshLambertMaterial({
      color: 0x888888,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    group.rotation.set(0, 0, 0);
    group.position.set(0, 0, 0);
    group.scale.set(1, 1, 1);
    this.scene.add(group);
    return group;
  }

  cols() {
    var col, group, i, j, key, len, len1, plane, pracCube, pracGroup, practice, ref, ref1, sp, study, studyCube, x, y, z;
    sp = this.space();
    group = new THREE.Group();
    ref = [
      {
        name: 'Embrace',
        x: sp.x3
      },
      {
        name: 'Innovate',
        x: sp.x2
      },
      {
        name: 'Encourage',
        x: sp.x1
      }
    ];
    for (i = 0, len = ref.length; i < len; i++) {
      col = ref[i];
      practice = this.build.getCol(col.name);
      pracCube = new Cube('Cols', 'Dim', col.name, col.name, [col.x, sp.yc, sp.zc], [sp.cubeWidth, sp.colsHeight, sp.colsDepth], practice['hsv'], 0.6, this.fontPrac);
      pracGroup = new THREE.Group();
      pracGroup.add(pracCube.mesh);
      ref1 = [
        {
          name: 'Info',
          z: sp.z1
        },
        {
          name: 'Know',
          z: sp.z2
        },
        {
          name: 'Wise',
          z: sp.z3
        }
      ];
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        plane = ref1[j];
        x = col.x;
        y = sp.yc;
        z = plane.z;
        studyCube = new Rect(plane, 'Dim', col.name, col.name, [x, y, z], [sp.cw, sp.ch], [0, 0, 0], 0.0, this.fontPrac, 0xFFFFFF);
        pracGroup.add(studyCube.mesh);
        for (key in practice) {
          study = practice[key];
          if (!(Util.isChild(key))) {
            continue;
          }
          x = col.x + sp.cx[study.dir];
          y = sp.yc + sp.cy[study.dir];
          z = plane.z;
          studyCube = new Rect('Cols', 'Dim', col.name, key, [x, y, z], [sp.cw, sp.ch], study['hsv'], 1.0, this.fontPrac, 0x000000);
          pracGroup.add(studyCube.mesh);
        }
      }
      group.add(pracGroup);
    }
    group.material = new THREE.MeshLambertMaterial({
      color: 0x888888,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide
    });
    group.rotation.set(0, 0, 0);
    group.position.set(0, 0, 0);
    group.scale.set(1, 1, 1);
    this.scene.add(group);
    return group;
  }

  convey(sp, group) {
    var col, h, hsv, i, j, k, len, len1, len2, name, plane, practice, rect, ref, ref1, ref2, row, w, x;
    hsv = [0, 50, 50];
    w = sp.horzSpace;
    h = sp.studyHeight;
    x = (sp.cubeWidth + w) / 2;
    ref = [
      {
        name: 'Info',
        z: sp.z1
      },
      {
        name: 'Know',
        z: sp.z2
      },
      {
        name: 'Wise',
        z: sp.z3
      }
    ];
    for (i = 0, len = ref.length; i < len; i++) {
      plane = ref[i];
      ref1 = [
        {
          name: 'Learn',
          y: sp.y1
        },
        {
          name: 'Do',
          y: sp.y2
        },
        {
          name: 'Share',
          y: sp.y3
        }
      ];
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        row = ref1[j];
        ref2 = [
          {
            name: 'Embrace',
            x: sp.x3 + x
          },
          {
            name: 'Innovate',
            x: sp.x2 + x
          }
        ];
        for (k = 0, len2 = ref2.length; k < len2; k++) {
          col = ref2[k];
          practice = this.build.getPractice(row.name, col.name, plane.name);
          name = this.build.connectName(practice, 'east', false);
          rect = new Rect(plane.name, row.name, col.name, name, [col.x, row.y, plane.z], [w, h], hsv, 0.7, this.fontPrac, 0xFFFFFF);
          group.add(rect.mesh);
        }
      }
    }
  }

  flow(sp, group) {
    var col, h, hsv, i, j, k, len, len1, len2, name, plane, practice, rect, ref, ref1, ref2, row, w, y;
    hsv = [0, 50, 50];
    w = sp.studyWidth;
    h = sp.vertSpace;
    y = (sp.cubeHeight + h) / 2;
    ref = [
      {
        name: 'Info',
        z: sp.z1
      },
      {
        name: 'Know',
        z: sp.z2
      },
      {
        name: 'Wise',
        z: sp.z3
      }
    ];
    for (i = 0, len = ref.length; i < len; i++) {
      plane = ref[i];
      ref1 = [
        {
          name: 'Learn',
          y: sp.y1 - y
        },
        {
          name: 'Do',
          y: sp.y2 - y
        }
      ];
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        row = ref1[j];
        ref2 = [
          {
            name: 'Embrace',
            x: sp.x3
          },
          {
            name: 'Innovate',
            x: sp.x2
          },
          {
            name: 'Encourage',
            x: sp.x1
          }
        ];
        for (k = 0, len2 = ref2.length; k < len2; k++) {
          col = ref2[k];
          practice = this.build.getPractice(row.name, col.name, plane.name);
          name = this.build.connectName(practice, 'south', false);
          rect = new Rect(plane.name, row.name, col.name, name, [col.x, row.y, plane.z], [w, h], hsv, 0.7, this.fontPrac, 0xFFFFFF);
          group.add(rect.mesh);
        }
      }
    }
  }

  conduit(sp, group) {
    var col, h, hsv, i, j, k, len, len1, len2, name, plane, practice, rect, ref, ref1, ref2, row, w, z;
    hsv = [0, 50, 50];
    w = sp.studyWidth;
    h = sp.zzzzSpace;
    z = (sp.cubeDepth + h) / 2;
    ref = [
      {
        name: 'Info',
        z: sp.z1 - z
      },
      {
        name: 'Know',
        z: sp.z2 - z
      }
    ];
    for (i = 0, len = ref.length; i < len; i++) {
      plane = ref[i];
      ref1 = [
        {
          name: 'Learn',
          y: sp.y1
        },
        {
          name: 'Do',
          y: sp.y2
        },
        {
          name: 'Share',
          y: sp.y3
        }
      ];
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        row = ref1[j];
        ref2 = [
          {
            name: 'Embrace',
            x: sp.x3
          },
          {
            name: 'Innovate',
            x: sp.x2
          },
          {
            name: 'Encourage',
            x: sp.x1
          }
        ];
        for (k = 0, len2 = ref2.length; k < len2; k++) {
          col = ref2[k];
          practice = this.build.getPractice(row.name, col.name, plane.name);
          name = this.build.connectName(practice, 'next', true);
          rect = new Rect(plane.name, row.name, col.name, name, [0, 0, 0], [w, h], hsv, 0.7, this.fontPrac, 0xFFFFFF);
          rect.mesh.rotation.x = -Math.PI / 2;
          rect.mesh.position.x = col.x;
          rect.mesh.position.y = row.y;
          rect.mesh.position.z = plane.z;
          group.add(rect.mesh);
        }
      }
    }
  }

  lights() {
    var object3d, spotLight;
    object3d = new THREE.DirectionalLight('white', 0.15);
    object3d.position.set(6, 3, 9);
    object3d.name = 'Back light';
    this.scene.add(object3d);
    object3d = new THREE.DirectionalLight('white', 0.35);
    object3d.position.set(-6, -3, 0);
    object3d.name = 'Key light';
    this.scene.add(object3d);
    object3d = new THREE.DirectionalLight('white', 0.55);
    object3d.position.set(9, 9, 6);
    object3d.name = 'Fill light';
    this.scene.add(object3d);
    spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(3, 30, 3);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 4000;
    spotLight.shadow.camera.fov = 45;
    this.scene.add(spotLight);
  }

  createElems(parElem, guiFlag) {
    var guiElem, guiStyle, ikwElem, ikwStyle;
    if (!guiFlag) {
      return [parElem, null];
    }
    ikwElem = document.createElement('div');
    guiElem = document.createElement('div');
    parElem.appendChild(ikwElem);
    parElem.appendChild(guiElem);
    ikwStyle = document.createAttribute('style');
    guiStyle = document.createAttribute('style');
    ikwStyle.value = "position:absolute; left:  0; top:0; width:80%; height:100%;";
    guiStyle.value = "position:absolute; left:80%; top:0; width:20%; height:100%; background-color:black;";
    ikwElem.setAttributeNode(ikwStyle);
    guiElem.setAttributeNode(guiStyle);
    return [ikwElem, guiElem];
  }

  traverse(prop, name, act) {
    var reveal;
    if (this.stream != null) {
      act[name] = !act[name];
    }
    // console.log( 'Th.traverse()', { prop:prop, name:name, visible:act[name] } )
    reveal = (child) => {
      // console.log( 'Th.traverse.beg', { name:child.name, tprop:prop, cprop:child[prop], value:value, visible:child.visible } )
      if ((child[prop] != null) && child[prop] === name) {
        return child.visible = act[name];
      }
    };
    if (this.group != null) {
      // console.log( 'Th.traverse.end', { name:child.name, geom:child.geom, prop:prop, value:value, visible:child.visible } )
      this.group.traverse(reveal);
    }
  }

  createAct(group) {
    return {
      Info: true,
      Know: true,
      Wise: true,
      Learn: true,
      Do: true,
      Share: true,
      Embrace: true,
      Innovate: true,
      Encourage: true,
      Opacity: group.material.opacity,
      Color: group.material.color,
      RotationX: group.rotation.x,
      RotationY: group.rotation.y,
      RotationZ: group.rotation.z,
      PositionX: 0,
      PositionY: 0,
      PositionZ: 0,
      ScaleX: 1,
      ScaleY: 1,
      ScaleZ: 1
    };
  }

  createTraversals(act) {
    return {
      info: () => {
        return this.traverse('plane', 'Info', act);
      },
      know: () => {
        return this.traverse('plane', 'Know', act);
      },
      wise: () => {
        return this.traverse('plane', 'Wise', act);
      },
      learn: () => {
        return this.traverse('row', 'Learn', act);
      },
      doDo: () => {
        return this.traverse('row', 'Do', act);
      },
      share: () => {
        return this.traverse('row', 'Share', act);
      },
      embrace: () => {
        return this.traverse('col', 'Embrace', act);
      },
      innovate: () => {
        return this.traverse('col', 'Innovate', act);
      },
      encourage: () => {
        return this.traverse('col', 'Encourage', act);
      }
    };
  }

  ui(group, guiElem) {
    var act, dat, f1, f2, f3, f4, f5, f6, gui, traverals;
    act = this.createAct(group);
    traverals = this.createTraversals(act);
    dat = Util.getGlobal('dat');
    gui = dat.GUI({
      autoPlace: false
    });
    guiElem.appendChild(gui.domElement);
    f1 = gui.addFolder('Planes');
    f1.add(act, 'Info').onChange(traverals.info);
    f1.add(act, 'Know').onChange(traverals.know);
    f1.add(act, 'Wise').onChange(traverals.wise);
    f2 = gui.addFolder('Rows');
    f2.add(act, 'Learn').onChange(traverals.learn);
    f2.add(act, 'Do').onChange(traverals.doDo);
    f2.add(act, 'Share').onChange(traverals.share);
    f3 = gui.addFolder('Cols');
    f3.add(act, 'Embrace').onChange(traverals.embrace);
    f3.add(act, 'Innovate').onChange(traverals.innovate);
    f3.add(act, 'Encourage').onChange(traverals.encourage);
    f4 = gui.addFolder('Rotation');
    f4.add(act, 'RotationX', -180, 180).onChange(() => {
      return group.rotation.x = this.deg2rad(act.RotationX);
    });
    f4.add(act, 'RotationY', -180, 180).onChange(() => {
      return group.rotation.y = this.deg2rad(act.RotationY);
    });
    f4.add(act, 'RotationZ', -180, 180).onChange(() => {
      return group.rotation.z = this.deg2rad(act.RotationZ);
    });
    f5 = gui.addFolder('Position');
    f5.add(act, 'PositionX', -500, 500).onChange(function() {
      return group.position.x = act.PositionX;
    });
    f5.add(act, 'PositionY', -500, 500).onChange(function() {
      return group.position.y = act.PositionY;
    });
    f5.add(act, 'PositionZ', -500, 500).onChange(function() {
      return group.position.z = act.PositionZ;
    });
    f6 = gui.addFolder('Scale');
    f6.add(act, 'ScaleX', 0.1, 5).onChange(function() {
      return group.scale.x = act.ScaleX;
    });
    f6.add(act, 'ScaleY', 0.1, 5).onChange(function() {
      return group.scale.y = act.ScaleY;
    });
    f6.add(act, 'ScaleZ', 0.1, 5).onChange(function() {
      return group.scale.z = act.ScaleZ;
    });
    return [gui, act];
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderScene();
  }

  renderScene() {
    this.renderer.render(this.scene, this.camera);
  }

  geom() {
    var geometry, geometry2, material, material2, mesh, mesh2;
    geometry = new THREE.BoxGeometry(2, 2, 2);
    material = new THREE.MeshLambertMaterial({
      color: color,
      transparent: true
    });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 0);
    mesh.rotation.set(0, 0, 0);
    mesh.rotation.y = this.deg2rad(-90);
    mesh.scale.set(1, 1, 1);
    mesh.doubleSided = true;
    mesh.castShadow = true;
    this.scene.add(mesh);
    geometry2 = new THREE.BoxGeometry(1, 1, 1);
    material2 = new THREE.MeshLambertMaterial({
      color: color,
      transparent: true
    });
    mesh2 = new THREE.Mesh(geometry2, material2);
    this.scene.add(mesh2);
  }

};

export default Th;
