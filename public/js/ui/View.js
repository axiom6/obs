var View,
  hasProp = {}.hasOwnProperty;

import Util from '../util/Util.js';

import UI from '../ui/UI.js';

import Dom from '../ui/Dom.js';

import Pane from '../ui/Pane.js';

import Pack from '../ui/Pack.js';

View = class View {
  constructor(ui, stream, specs1) {
    this.resize = this.resize.bind(this);
    this.ui = ui;
    this.stream = stream;
    this.specs = specs1;
    this.speed = 400;
    this.$view = UI.$empty;
    this.margin = UI.margin;
    this.ncol = UI.ncol;
    this.nrow = UI.nrow;
    this.classPrefix = Util.isStr(this.specs.css) ? this.spec.css : 'ui-view';
    [this.wpane, this.hpane, this.wview, this.hview, this.wscale, this.hscale] = this.percents(this.nrow, this.ncol, this.margin);
    [this.packs, this.panes] = this.createPacksPanes(this.specs);
    this.sizeCallback = null;
    this.paneCallback = null;
    this.$empty = UI.$empty; // Empty jQuery singleton for intialization
    this.wpx = 0;
    this.hpx = 0;
    this.lastPaneName = 'None';
    this.allCells = [1, this.ncol, 1, this.nrow];
    Util.noop(this.lastPaneName, this.allCells, this.hPanes, this.wPanes, this.positionpx, this.positionPane);
  }

  ready() {
    var htmlId, k, len, pane, parent, ref;
    parent = $('#' + this.ui.getHtmlId('View')); // parent is outside of planes
    htmlId = this.ui.htmlId('View', 'Plane');
    this.$view = $(`<div id="${htmlId}" class="${this.classPrefix}"></div>`);
    parent.append(this.$view);
    ref = this.panes;
    for (k = 0, len = ref.length; k < len; k++) {
      pane = ref[k];
      pane.ready();
    }
    this.subscribe();
    [this.wpx, this.hpx] = this.size();
  }

  subscribe() {
    return this.stream.subscribe('Select', 'View', (select) => {
      return this.onSelect(select);
    });
  }

  percents(nrow, ncol, margin) {
    var hpane, hscale, hview, wpane, wscale, wview;
    wpane = 100 / ncol;
    hpane = 100 / nrow;
    wview = 1.0 - (margin.west + margin.east) / 100;
    hview = 1.0 - (margin.north + margin.south) / 100;
    wscale = 1.0 - (margin.west + (ncol - 1) * margin.width + margin.east) / 100; // Scaling factor for panes once all
    hscale = 1.0 - (margin.north + (nrow - 1) * margin.height + margin.south) / 100; // margins gutters are accounted for
    return [wpane, hpane, wview, hview, wscale, hscale];
  }

  pc(v) {
    return v.toString() + (v !== 0 ? '%' : '');
  }

  xs(x) {
    return this.pc(x * this.wscale);
  }

  ys(y) {
    return this.pc(y * this.hscale);
  }

  left(j) {
    return j * this.wpane;
  }

  top(i) {
    return i * this.hpane;
  }

  width(m) {
    return m * this.wpane + (m - 1) * this.margin.width / this.wscale;
  }

  height(n) {
    return n * this.hpane + (n - 1) * this.margin.height / this.hscale;
  }

  size() {
    var hpx, isViewHidden, wpx;
    isViewHidden = Dom.isHidden(this.$view);
    if (isViewHidden) {
      this.show();
    }
    wpx = 0;
    hpx = 0;
    [wpx, hpx] = [this.$view.innerWidth(), this.$view.innerHeight()];
    if (Util.isNum(wpx) && Util.isNum(hpx)) {
      [this.wpx, this.hpx] = [wpx, hpx];
    } else {
      console.error("View.size() wpx hpx undefined and kept at ready size");
      console.trace();
    }
    if (isViewHidden) {
      this.hide();
    }
    return [this.wpx, this.hpx];
  }

  wPanes() {
    return this.wview * this.wpx;
  }

  hPanes() {
    return this.hview * this.hpx;
  }

  north(top, height, h, scale = 1.0, dy = 0) {
    return scale * (top - h + dy / this.hscale);
  }

  south(top, height, h, scale = 1.0, dy = 0) {
    return scale * (top + height + dy / this.hscale);
  }

  east(left, width, w, scale = 1.0, dx = 0) {
    return scale * (left + width + dx / this.wscale);
  }

  west(left, width, w, scale = 1.0, dx = 0) {
    return scale * (left - w + dx / this.wscale);
  }

  isRow(specPanePack) {
    return specPanePack.css === 'ikw-row';
  }

  isCol(specPanePack) {
    return specPanePack.css === 'ikw-col';
  }

  positionUnionPane(unionCells, paneCells, spec, xscale = 1.0, yscale = 1.0) {
    var ip, iu, jp, ju, mp, mu, np, nu;
    ju = 0;
    mu = 0;
    iu = 0;
    nu = 0;
    jp = 0;
    mp = 0;
    ip = 0;
    np = 0;
    [ju, mu, iu, nu] = this.jmin(unionCells);
    [jp, mp, ip, np] = this.jmin(paneCells);
    return this.position((jp - ju) * this.ncol / mu, mp * this.ncol / mu, (ip - iu) * this.nrow / nu, np * this.nrow / nu, spec, xscale, yscale);
  }

  positionPack(packCells, spec, xscale = 1.0, yscale = 1.0) {
    var i, j, m, n;
    j = 0;
    m = 0;
    i = 0;
    n = 0;
    [j, m, i, n] = this.jmin(packCells);
    return this.position(j, m, i, n, spec, xscale, yscale);
  }

  position(j, m, i, n, spec, xscale = 1.0, yscale = 1.0) {
    var hStudy, height, left, top, wStudy, width;
    wStudy = spec.name != null ? this.margin.wStudy : 0;
    hStudy = spec.name != null ? this.margin.hStudy : 0;
    left = xscale * (this.left(j) + (wStudy + this.margin.west + j * this.margin.width) / this.wscale);
    top = yscale * (this.top(i) + (hStudy + this.margin.north + i * this.margin.height) / this.hscale);
    width = xscale * (this.width(m) - wStudy * 2 / this.wscale);
    height = yscale * (this.height(n) - hStudy * 2 / this.hscale);
    return [left, top, width, height];
  }

  positionPane(paneCells, spec, xscale = 1.0, yscale = 1.0) {
    var i, j, m, n;
    j = 0;
    m = 0;
    i = 0;
    n = 0;
    [j, m, i, n] = this.jmin(paneCells);
    return this.position(j, m, i, n, spec, xscale, yscale);
  }

  // Should only be called when view is fully visible
  positionpx(j, m, i, n, spec) {
    var height, left, top, width;
    left = 0;
    top = 0;
    width = 0;
    height = 0;
    [left, top, width, height] = this.position(j, m, i, n, spec, this.wscale, this.hscale);
    return [width * this.wpx / 100, height * this.hpx / 100];
  }

  reset(select) {
    var k, len, pane, ref;
    ref = this.panes;
    for (k = 0, len = ref.length; k < len; k++) {
      pane = ref[k];
      pane.reset(select);
    }
  }

  resize() {
    var saveName;
    saveName = this.lastPaneName;
    this.lastPaneName = '';
    this.onSelect(UI.toTopic(saveName, 'View', UI.SelectPane));
    this.lastPaneName = saveName;
  }

  hide() {
    this.$view.hide();
  }

  show() {
    this.$view.show();
  }

  hideAll(name = 'None') {
    var k, len, pane, ref;
    ref = this.panes;
    for (k = 0, len = ref.length; k < len; k++) {
      pane = ref[k];
      if (pane.name !== name) {
        pane.hide();
      }
    }
    this.$view.hide();
  }

  showAll(panes) {
    var k, len, pane;
    this.$view.hide();
    for (k = 0, len = panes.length; k < len; k++) {
      pane = panes[k];
      pane.show();
    }
    this.$view.show(this.speed, () => {
      if (this.sizeCallback) {
        return this.sizeCallback(this);
      }
    });
  }

  onSelect(select) {
    var intent, name;
    UI.verifyTopic(select, 'View');
    name = select.name;
    intent = select.intent;
    switch (intent) {
      case UI.SelectPack:
        this.expandPack(select, this.getPane(name));
        break;
      case UI.SelectView:
        this.expandView(select);
        break;
      case UI.SelectPane:
        this.expandPane(select, this.getPane(name));
        break;
      case UI.SelectStudy:
        this.expandStudy(select, this.getPane(name));
        break;
      case 'None':
        Util.noop();
        break;
      default:
        console.error('UI.View.onSelect() name not processed for intent', name, select);
    }
  }

  expandPack(select, pack, callback = null) {
    var height, k, left, len, pane, ref, top, width;
    // console.log( 'View.expandPack()', pack.name, @ui.okPub(pack.spec) )
    this.hideAll('Interact');
    if (pack.panes != null) {
      ref = pack.panes;
      for (k = 0, len = ref.length; k < len; k++) {
        pane = ref[k];
        if (!(this.inPack(pane))) {
          continue;
        }
        pane.show();
        left = 0;
        top = 0;
        width = 0;
        height = 0;
        [left, top, width, height] = this.positionUnionPane(pack.cells, pane.cells, pane.spec, this.wscale, this.hscale);
        pane.animate(left, top, width, height, select, true, callback);
      }
    }
    // else
    //   console.error( 'View.expandPack pack.panes null' )
    this.show();
  }

  // @lastPaneName  = 'None'
  inPack(pane) {
    return pane.classPrefix !== 'ui-plane'; // bad condition for determining that pane is in pack
  }

  expandView(select) {
    this.hideAll();
    this.reset(select);
    return this.showAll(this.panes);
  }

  expandPane(select, pane, callback = null) {
    var paneCallback;
    paneCallback = callback != null ? callback : this.paneCallback;
    pane = this.getPane(pane, false); // don't issue errors
    if (pane == null) {
      return;
    }
    this.hideAll();
    pane.resetStudiesDir(true);
    pane.show();
    pane.animate(this.margin.west, this.margin.north, 100 * this.wview, 100 * this.hview, select, true, paneCallback);
    this.show();
  }

  // @lastPaneName   = pane.name
  expandStudy(select, pane, callback = null) {
    this.expandPane(select, pane, callback);
    if (this.stream.isInfo('Select', 'view')) {
      console.info('View.expandStudy()', {
        study: select.study
      });
    }
    if (select.study == null) {
      return;
    }
    pane.resetStudiesDir(false); // Hide all studies
    pane.resetStudyDir(true, true, select.study.dir); // Expand selected
  }

  getPane(name, issueError = true) {
    var k, l, len, len1, pack, pane, ref, ref1;
    if (Util.isObj(name)) {
      return name;
    }
    ref = this.panes;
    for (k = 0, len = ref.length; k < len; k++) {
      pane = ref[k];
      if (pane.name === name) {
        return pane;
      }
    }
    ref1 = this.packs;
    for (l = 0, len1 = ref1.length; l < len1; l++) {
      pack = ref1[l];
      if (pack.name === name) {
        return pack;
      }
    }
    if (issueError) {
      console.error('View.getPane() null for key ', name);
    }
    console.log({
      packs: this.packs,
      panes: this.panes
    });
    return null;
  }

  createPacksPanes(specs) {
    var key, pack, packs, pane, panes, pey, ppec, spec;
    // console.log( 'View.createPackPanes() ------')
    packs = [];
    panes = [];
    for (key in specs) {
      if (!hasProp.call(specs, key)) continue;
      spec = specs[key];
      if (Util.isChild(key)) {
        if (spec.type === 'pack') {
          // console.log( '  Pack', key )
          pack = new Pack(this.ui, this.stream, this, spec);
          packs.push(pack);
          for (pey in spec) {
            if (!hasProp.call(spec, pey)) continue;
            ppec = spec[pey];
            if (!(Util.isChild(pey) && ppec.type === 'pane')) {
              continue;
            }
            // console.log( '    Pane', pey )
            pane = new Pane(this.ui, this.stream, this, ppec);
            pack.panes.push(pane);
            panes.push(pane);
          }
        } else if (spec.type === 'pane') {
          panes.push(new Pane(this.ui, this.stream, this, spec));
        }
      }
    }
    return [packs, panes];
  }

  jmin(cells) {
    if (cells == null) {
      console.trace();
    }
    return [cells[0] - 1, cells[1], cells[2] - 1, cells[3]];
  }

};

/*

paneInUnion:( paneCells, unionCells ) ->
[jp,mp,ip,np] = @jmin(  paneCells )
[ju,mu,iu,nu] = @jmin( unionCells )
ju <= jp and jp+mp <= ju+mu and iu <= ip and ip+np <= iu+nu

expandCells:( unionCells, allCells ) ->  # Not Implemented
[ju,mu,iu,nu] = @jmin( unionCells )
[ja,ma,ia,na] = @jmin(   allCells )
[ (ju-ja)*ma/mu, ma, (iu-ia)*na/nu, na ]

toCells:( jmin ) ->
[ jmin[0]+1,jmin[1],jmin[2]+1,jmin[3] ]

unionCells:( cells1, cells2 ) ->
[j1,m1,i1,n1] = UI.jmin( cells1 )
[j2,m2,i2,n2] = UI.jmin( cells2 )
[ Math.min(j1,j2)+1, Math.max(j1+m1,j2+m2)-Math.min(j1,j2), Math.min(i1,i2)+1, Math.max(i1+n1,i2+n2)-Math.min(i1,i2) ]

intersectCells:( cells1, cells2 ) ->
[j1,m1,i1,n1] = UI.jmin( cells1 )
[j2,m2,i2,n2] = UI.jmin( cells2 )
[ Math.max(j1,j2)+1, Math.min(j1+m1,j2+m2), Math.max(i1,i2)+1, Math.min(i1+n1,i2+n2) ]

*/
export default View;
