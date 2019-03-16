var Basic;

import Util from '../util/Util.js';

import Vis from '../util/Vis.js';

import UI from '../ui/UI.js';

import Dom from '../ui/Dom.js';

Basic = class Basic {
  constructor(stream, ui, pane, cname) {
    this.readyCenter = this.readyCenter.bind(this);
    this.stream = stream;
    this.ui = ui;
    this.pane = pane;
    this.cname = cname;
    if (this.ui.planeName === 'App') { // Signifies that Page is not present
      this.ui.addPage(this.pane.name, this);
    }
    this.spec = this.pane.spec;
    this.has = true;
    this.btn = true;
    this.$ = $();
    Util.noop(this.hasStudy, this.anyTopics, this.hasItems);
  }

  ready() {
    console.error('Basic.ready() must be overriden');
    return UI.$empty;
  }

  layout(intent) {
    Util.error('Basic.layout() must be overriden', intent);
  }

  scoreClass(prefix, intent) {
    var view;
    view = this.cname === 'Topic' ? 'topic' : 'study';
    return prefix + '-' + (function() {
      switch (intent) {
        case UI.SelectView:
          return this.scoreView(view);
        case UI.SelectPane:
          return 'pane';
        case UI.SelectStudy:
          return 'stud';
        default:
          return view;
      }
    }).call(this);
  }

  scoreView(view) {
    if (this.isPlane(this.spec)) {
      return 'plane';
    } else if (this.isDim(this.spec)) {
      return 'dims';
    } else if (this.isRow(this.spec)) {
      return 'rows';
    } else {
      return view;
    }
  }

  // Need to improve naming conventions
  isPlane(spec) {
    return this.isDim(spec) && this.isRow(spec);
  }

  isDim(spec) {
    return this.spec.row === 'Dim' && this.spec.column !== 'Row';
  }

  isRow(spec) {
    return this.spec.column === 'Row';
  }

  isDimOrRow(spec) {
    return this.isDim(spec) || this.isRow(spec);
  }

  isCol(spec) {
    return this.isDim(spec) && !this.isRow(spec);
  }

  isPer(spec) {
    return this.isRow(spec) && !this.isDim(spec);
  }

  // ------ Tag Attributes ------
  klass(name) {
    return Dom.klass(name);
  }

  htmlId(name, type, exa = "") {
    var exs, ext;
    exs = this.cname === 'Study' ? exa + 'S' : exa;
    ext = this.cname === 'Topic' ? exa + 'T' : exs;
    return Dom.htmlId(name, type, ext);
  }

  style(...props) {
    return Dom.style(props);
  }

  title(purpose) {
    if ((purpose != null) && purpose !== "None") {
      return `title="${purpose}" `;
    } else {
      return "";
    }
  }

  // ------ CSS Propterties ------
  position(x, y, w, h, pos = "absolute", uom = "%") {
    return Dom.position(x, y, w, h, pos = "absolute", uom = "%");
  }

  margin(l, t, r, b) {
    return Dom.margin(l, t, r, b);
  }

  padding(l, t, r, b) {
    return Dom.padding(l, t, r, b);
  }

  border(color, thick) {
    return Dom.border(color, thick);
  }

  fill(spec) {
    return `background-color:${this.toFill(spec)} `;
  }

  toFill(spec) {
    if ((spec.hsv != null) && spec.hsv.length === 3) {
      return Vis.toRgbHsvStr(spec.hsv);
    } else {
      console.error('Basic.toFill() unknown hsv', {
        name: spec.name,
        spec: spec
      });
      return '#888888';
    }
  }

  // ------ Html ------
  main(k, spec, type) {
    return `<div ${this.klass(k)} ${this.htmlId(spec.name, type, 'Main')} ${this.style(this.fill(spec))}>`;
  }

  wrap(k, spec, type) {
    return `<div ${this.klass(k)} ${this.htmlId(spec.name, type, 'Wrap')}>`;
  }

  bloc(k, spec, type) {
    return `<div ${this.klass(k)} ${this.htmlId(spec.name, type, 'Bloc')}>`;
  }

  icon(k, spec) {
    var ki;
    ki = (spec.icon != null) && this.contains(spec.icon, 'fa') ? k + ' ' + spec.icon : k + ' fas fa fa-circle';
    return `<i ${this.klass(ki)}></i>`;
  }

  text(k, spec, tag = 'span') {
    if (spec.name == null) {
      console.log('Basic.text()', spec);
    }
    return `<${tag} ${this.klass(k)} ${this.title(spec.purpose)}>${this.toName(spec.name)}</${tag}>`;
  }

  tesc(k, desc) {
    return `<span ${this.klass(k)}>${desc}</span>`;
  }

  desc(k, spec) {
    return `<div ${this.klass(k)}>${spec.desc}</div>  `;
  }

  abst(k, spec) {
    return `<div ${this.klass(k)}>${spec.desc}</div>  `;
  }

  contains(str, tok) {
    return (str != null) && str.indexOf(tok) !== -1;
  }

  setFontSize(fontVh) {
    return {
      "font-size": `${this.pane.toVh(fontVh)}vh`
    };
  }

  readyCenter(prefix = 'ui-pane') {
    var $p, fill, htm, htmlId, style;
    htmlId = this.htmlId(this.pane.name, this.cname);
    fill = this.toFill(this.spec);
    style = `style="background-color:${fill}; border-radius:12px; color:black;" `;
    htm = `<div    class="${prefix}-center" ${htmlId}>\n  <div   class="${prefix}-center-div" ${style}>\n    ${this.icon(`${prefix}-icon`, this.spec)}\n    <div class="${prefix}-text">${this.toName(this.pane.name)}</div>\n  </div>\n</div>`;
    // console.log('Basic.readyCenter()', htm )
    $p = $(htm);
    return $p;
  }

  layoutCenter(intent) {
    var geom;
    Util.noop(intent);
    geom = this.pane.geom();
    this.$.find('.ui-pane-center-div').css({
      fontSize: geom.fontSize
    });
    this.$.find('.ui-pane-icon').css({
      fontSize: geom.iconSize,
      display: 'block'
    });
  }

  toName(name) {
    return Util.toName(name);
  }

  // Search Studies and Topisc
  hasStudy() {
    var key, ref, study;
    ref = this.spec;
    for (key in ref) {
      study = ref[key];
      if (Util.isChild(key)) {
        return true;
      }
    }
    return false;
  }

  anyTopics() {
    var ref, skey, study, tkey, topic;
    ref = this.spec;
    for (skey in ref) {
      study = ref[skey];
      if (!(Util.isChild(skey))) {
        continue;
      }
      for (tkey in study) {
        topic = study[tkey];
        if (Util.isChild(tkey)) {
          return true;
        }
      }
      false;
    }
  }

  hasTopics(study) {
    var tkey, topic;
    for (tkey in study) {
      topic = study[tkey];
      if (Util.isChild(tkey)) {
        return true;
      }
    }
    return false;
  }

  hasItems(topic) {
    var ikey, item;
    for (ikey in topic) {
      item = topic[ikey];
      if (Util.isChild(ikey)) {
        return true;
      }
    }
    return false;
  }

};

export default Basic;
