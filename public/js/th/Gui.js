var Gui;

import Util from '../util/Util.js';

Gui = class Gui {
  constructor(act, elem, fun) {
    this.act = act;
    this.elem = elem;
    this.fun = fun;
    this.dat = Util.getGlobal('dat');
    this.gui = new this.dat.GUI({
      autoPlace: false
    });
    this.elem.appendChild(this.gui.domElement);
    this.gui.remember(this.act);
    this.fun.slide = function() {
      return Util.noop();
    };
    this.fun.select = function() {
      return Util.noop();
    };
    this.fun.num = function() {
      return Util.noop();
    };
    this.fun.str = function() {
      return Util.noop();
    };
    this.fun.color0 = function() {
      return Util.noop();
    };
    this.fun.color1 = function() {
      return Util.noop();
    };
    this.fun.color2 = function() {
      return Util.noop();
    };
    this.fun.color3 = function() {
      return Util.noop();
    };
    this.planes();
    this.rows();
    this.cols();
    this.misc();
    this.colors();
  }

  check(folder, obj, prop, onChange) {
    var controller;
    controller = folder.add(obj, prop);
    controller.onChange(onChange);
  }

  slider(folder, obj, prop, onChange, min, max, step) {
    var controller;
    controller = folder.add(obj, prop).min(min).max(max).step(step);
    if (onChange != null) {
      controller.onFinishChange(onChange);
    }
  }

  select(folder, obj, prop, onChange, items) {
    var controller;
    controller = folder.add(obj, prop, items);
    if (onChange != null) {
      controller.onChange(onChange);
    }
  }

  input(folder, obj, prop, onChange) {
    var controller;
    controller = folder.add(obj, prop);
    if (onChange != null) {
      controller.onFinishChange(onChange);
    }
  }

  color(folder, obj, prop, onChange) {
    var controller;
    controller = folder.addColor(obj, prop);
    if (onChange != null) {
      controller.onChange(onChange);
    }
  }

  planes() {
    var folder;
    folder = this.gui.addFolder('Planes');
    this.check(folder, this.act, 'Info', this.fun.info);
    this.check(folder, this.act, 'Know', this.fun.know);
    this.check(folder, this.act, 'Wise', this.fun.wise);
    folder.open();
  }

  rows() {
    var folder;
    folder = this.gui.addFolder('Rows');
    this.check(folder, this.act, 'Learn', this.fun.learn);
    this.check(folder, this.act, 'Do', this.fun.do);
    this.check(folder, this.act, 'Share', this.fun.share);
    folder.open();
  }

  cols() {
    var folder;
    folder = this.gui.addFolder('Cols');
    this.check(folder, this.act, 'Embrace', this.fun.embrace);
    this.check(folder, this.act, 'Innovate', this.fun.innovate);
    this.check(folder, this.act, 'Encourage', this.fun.encourage);
    folder.open();
  }

  misc() {
    var folder;
    folder = this.gui.addFolder('Misc');
    this.slider(folder, this.act, 'Slide', this.fun.slide, 0, 100, 10);
    this.select(folder, this.act, 'Select', this.fun.select, ['Life', 'Liberty', 'Happiness']);
    this.input(folder, this.act, 'Num', this.fun.num);
    this.input(folder, this.act, 'Str', this.fun.str);
    folder.open();
  }

  colors() {
    var folder;
    folder = this.gui.addFolder('Colors');
    this.color(folder, this.act, 'Color0', this.fun.color0);
    this.color(folder, this.act, 'Color1', this.fun.color1);
    this.color(folder, this.act, 'Color2', this.fun.color2);
    this.color(folder, this.act, 'Color3', this.fun.color3);
    folder.open();
  }

};

export default Gui;
