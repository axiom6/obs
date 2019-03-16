var Pane;

import Util from '../util/Util.js';

import UI from '../ui/UI.js';

import Dom from '../ui/Dom.js';

Pane = class Pane {
  constructor(ui, stream, view, spec) {
    var i, j, m, n;
    this.animateCall = this.animateCall.bind(this);
    this.onContent = this.onContent.bind(this);
    this.ui = ui;
    this.stream = stream;
    this.view = view;
    this.spec = spec;
    this.spec.pane = this;
    this.cells = this.spec.cells;
    j = 0;
    m = 0;
    i = 0;
    n = 0;
    [j, m, i, n] = this.view.jmin(this.cells);
    [this.left, this.top, this.width, this.height] = this.view.position(j, m, i, n, this.spec);
    this.name = this.spec.name;
    this.classPrefix = Util.isStr(this.spec.css) ? this.spec.css : 'ui-pane';
    this.$ = UI.$empty;
    this.wscale = this.view.wscale;
    this.hscale = this.view.hscale;
    this.margin = this.view.margin;
    this.speed = this.view.speed;
    this.wpx = 0;
    this.hpx = 0;
    Util.noop(this.toVmin, this.xcente2, this.northPane, this.southPane, this.eastPane, this.westPane);
  }

  ready() {
    this.htmlId = this.ui.htmlId(this.name, 'Pane');
    this.$ = this.createHtml();
    this.view.$view.append(this.$);
    this.hide();
    this.adjacentPanes();
    this.$.css(this.scaleReset());
    this.show();
    [this.wpx, this.hpx] = this.size();
  }

  size() {
    var hpx, isPaneHidden, isViewHidden, wpx;
    isViewHidden = Dom.isHidden(this.view.$view);
    isPaneHidden = Dom.isHidden(this.$);
    if (isViewHidden) {
      this.view.show();
    }
    if (isPaneHidden) {
      this.show();
    }
    wpx = 0;
    hpx = 0;
    [wpx, hpx] = [this.$.innerWidth(), this.$.innerHeight()];
    if (Util.isNum(wpx) && Util.isNum(hpx)) {
      [this.wpx, this.hpx] = [wpx, hpx];
    } else {
      console.error("Pane.size() wpx hpx undefined and kept at ready size");
      console.trace();
    }
    if (isPaneHidden) {
      this.hide();
    }
    if (isViewHidden) {
      this.view.hide();
    }
    return [this.wpx, this.hpx];
  }

  geom(cells = this.spec.cells, wgpx, hgpx) {
    var g, height, left, top, width;
    wgpx = wgpx != null ? wgpx : this.wpx;
    hgpx = hgpx != null ? hgpx : this.hpx;
    g = {};
    g.name = this.name;
    [g.j, g.m, g.i, g.n] = this.view.jmin(cells);
    [left, top, width, height] = this.view.position(g.j, g.m, g.i, g.n, this.spec, this.view.wscale, this.view.hscale);
    [g.w, g.h] = this.size(); // @view.positionpx( g.j,g.m,g.i,g.n, @spec ) # Pane size in AllPage usually 3x3 View
    g.r = Math.min(g.w, g.h) * 0.2; // Use for hexagons
    g.x0 = g.w * 0.5;
    g.y0 = g.h * 0.5;
    g.sx = g.w / wgpx;
    g.sy = g.h / hgpx;
    g.s = Math.min(g.sx, g.sy);
    g.fontSize = this.toVh(5) + 'vh';
    g.iconSize = this.toVh(5) + 'vh';
    // console.log( "Pane.geom()", { wgpx:wgpx, hgpx:hgpx }, g )
    return g;
  }

  // Converts a pane percent to vmin unit by determining the correct pane scaling factor
  toVmin(pc) {
    var sc;
    sc = this.view.wpx > this.view.hpx ? this.hpx : this.wpx;
    return Util.toFixed(sc * pc * 0.01, 2);
  }

  toVw(pc) {
    return Util.toFixed(this.width * pc * 0.01, 2);
  }

  toVh(pc) {
    return Util.toFixed(this.height * pc * 0.01, 2);
  }

  show() {
    this.$.show();
  }

  hide() {
    this.$.hide();
  }

  pc(v) {
    return this.view.pc(v);
  }

  xs(x) {
    return this.view.xs(x);
  }

  ys(y) {
    return this.view.ys(y);
  }

  xcenter(left, width, w, scale = 1.0, dx = 0) {
    return scale * (left + 0.5 * width - 11 + dx / this.wscale);
  }

  xcente2(left, width, w, scale = 1.0, dx = 0) {
    return scale * (left + 0.5 * width - 0.5 * w / this.wscale + dx / this.wscale);
  }

  ycenter(top, height, h, scale = 1.0, dy = 0) {
    return scale * (top + 0.5 * height - 0.5 * h / this.hscale + dy / this.hscale);
  }

  right(left, width, w, scale = 1.0, dx = 0) {
    return scale * (left + width - 0.5 * w / this.wscale + dx / this.wscale);
  }

  bottom(top, height, h, scale = 1.0, dy = 0) {
    return scale * (top + height - 0.5 * h / this.hscale + dy / this.hscale);
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

  adjacentPanes() {
    var i, ip, j, jp, k, len, m, mp, n, np, pane, ref;
    jp = 0;
    mp = 0;
    ip = 0;
    np = 0;
    [jp, mp, ip, np] = this.view.jmin(this.cells);
    [this.northPane, this.southPane, this.eastPane, this.westPane] = [UI.$empty, UI.$empty, UI.$empty, UI.$empty];
    ref = this.view.panes;
    for (k = 0, len = ref.length; k < len; k++) {
      pane = ref[k];
      j = 0;
      m = 0;
      i = 0;
      n = 0;
      [j, m, i, n] = this.view.jmin(pane.cells);
      if (j === jp && m === mp && i === ip - n) {
        this.northPane = pane;
      }
      if (j === jp && m === mp && i === ip + np) {
        this.southPane = pane;
      }
      if (i === ip && n === np && j === jp - m) {
        this.westPane = pane;
      }
      if (i === ip && n === np && j === jp + mp) {
        this.eastPane = pane;
      }
    }
  }

  createHtml() {
    var $p;
    $p = $(`<div id="${this.htmlId}" class="${this.classPrefix}"></div>`);
    this.navArrows($p);
    return $p;
  }

  doNav(event) {
    var name, select;
    name = $(event.target).attr('data-name');
    select = UI.toTopic(name, 'Pane.doNav()', UI.SelectPack);
    this.stream.publish('Select', select);
  }

  navArrows($p) {
    var fontvw, leftvw;
    fontvw = this.toVw(33) + 'vw';
    leftvw = '25%';
    if (this.spec['bak'] != null) {
      this.navIcon('bak', leftvw, fontvw, this.spec['bak'], $p);
    }
    if (this.spec['fwd'] != null) {
      this.navIcon('fwd', leftvw, fontvw, this.spec['fwd'], $p);
    }
    if (this.spec['top'] != null) {
      this.navIcon('top', leftvw, fontvw, this.spec['top'], $p);
    }
    if (this.spec['bot'] != null) {
      this.navIcon('bot', leftvw, fontvw, this.spec['bot'], $p);
    }
  }

  navIcon(loc, leftvw, fontvw, name, $p) {
    var $a;
    $a = (function() {
      switch (loc) {
        case 'bak':
          return $(`<i style="position:absolute; left:${leftvw}; top: 40%; font-size:${fontvw}; z-index:4;" class="arrow fas fa-arrow-alt-circle-left"  data-name="${name}"></i>`);
        case 'fwd':
          return $(`<i style="position:absolute; left:${leftvw}; top: 40%; font-size:${fontvw}; z-index:4;" class="arrow fas fa-arrow-alt-circle-right" data-name="${name}"></i>`);
        case 'top':
          return $(`<i style="position:absolute; left:${leftvw}; top:   0; font-size:${fontvw}; z-index:4;" class="arrow fas fa-arrow-alt-circle-up"    data-name="${name}"></i>`);
        case 'bot':
          return $(`<i style="position:absolute; left:${leftvw}; bottom:0; font-size:${fontvw}; z-index:4;" class="arrow fas fa-arrow-alt-circle-down"  data-name="${name}"></i>`);
      }
    })();
    $a.on('click', (event) => {
      return this.doNav(event);
    });
    $p.append($a);
  }

  scaleReset() {
    return {
      left: this.xs(this.left),
      top: this.ys(this.top),
      width: this.xs(this.width),
      height: this.ys(this.height)
    };
  }

  scaleParam(left, top, width, height) {
    return {
      left: this.pc(left),
      top: this.pc(top),
      width: this.pc(width),
      height: this.pc(height)
    };
  }

  emptyParam() {
    return {
      left: "",
      top: "",
      width: "",
      height: ""
    };
  }

  reset(select) {
    this.resetStudiesDir(true);
    this.$.css(this.scaleReset());
    //@onContent( select )
    Util.noop(select);
  }

  css(left, top, width, height) {
    this.$.css(this.scaleParam(left, top, width, height));
  }

  //@onContent( select )
  animate(left, top, width, height, select, aniLinks = false, callback = null) {
    this.$.show().animate(this.scaleParam(left, top, width, height), this.view.speed, () => {
      return this.animateCall(callback, select);
    });
  }

  animateCall(callback, select) {
    this.onContent(select);
    if (callback != null) {
      callback(this);
    }
  }

  resetStudiesDir(show) {
    var dir, k, len, ref;
    ref = ['west', 'north', 'east', 'south', 'prac'];
    for (k = 0, len = ref.length; k < len; k++) {
      dir = ref[k];
      this.resetStudyDir(false, show, dir);
    }
  }

  resetStudyDir(expand, show, dir) {
    var $study;
    $study = this.$.find(this.dirClass(dir));
    if (expand) {
      $study.css(this.scaleParam(this.view.margin.west, this.view.margin.north, 100 * this.view.wview, 100 * this.view.hview));
    } else {
      $study.css(this.emptyParam());
    }
    if (show) {
      $study.show();
    } else {
      $study.hide();
    }
  }

  dirClass(dir) {
    return `.study-${dir}`;
  }

  onContent(select) {
    var content;
    if (this.stream.hasSubject('Content')) {
      content = UI.toTopic(select.name, 'Pane', select.intent);
      this.stream.publish('Content', content);
    }
  }

};

export default Pane;
