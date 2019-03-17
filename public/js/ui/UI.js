var UI,
  hasProp = {}.hasOwnProperty;

import Util from '../util/Util.js';

import Navb from '../ui/Navb.js';

import Tocs from '../ui/Tocs.js';

import View from '../ui/View.js';

UI = (function() {
  class UI {
    constructor(stream, specs, uiId, navbs = null) {
      this.pagesReady = this.pagesReady.bind(this);
      this.resize = this.resize.bind(this);
      this.stream = stream;
      this.specs = specs;
      this.uiId = uiId;
      this.navbs = navbs;
      this.pages = {};
      this.cname = 'Study';
      if (this.navbs != null) {
        //$text  = UI.$empty
        this.navb = new Navb(this, this.stream, this.navbs);
      }
      if (UI.hasTocs) {
        this.tocs = new Tocs(this, this.stream, this.specs);
      }
      this.view = new View(this, this.stream, this.specs);
      this.ready();
    }

    addPage(name, page) {
      return this.pages[name] = page;
    }

    ready() {
      $('#' + this.htmlId(this.uiId)).html(this.html());
      if (this.navbs != null) {
        this.navb.ready();
      }
      if (UI.hasTocs) {
        this.tocs.ready();
      }
      this.view.ready();
      this.stream.publish("Ready", "Ready"); // Just notification. No topic
    }

    pagesReady(cname, append = true) {
      var name, page, pane, ref;
      this.cname = cname;
      ref = this.pages;
      for (name in ref) {
        if (!hasProp.call(ref, name)) continue;
        page = ref[name];
        pane = this.view.getPane(name);
        page.pane = pane;
        page.name = pane.name;
        page.spec = pane.spec;
        if (append) {
          page.$pane = page.ready(cname);
          page.isSvg = this.isElem(page.$pane.find('svg')) && page.pane.name !== 'Flavor';
          if (!page.isSvg) {
            pane.$.append(page.$pane);
          }
        } else {
          page.$pane = page.ready(cname);
        }
      }
    }

    // console.log( 'UI.pagesReady()', name )
    html() {
      var htm;
      htm = "";
      if (UI.hasLays) {
        htm += `<div class="layout-logo     " id="${this.htmlId('Logo')}"></div>`;
      }
      if (UI.hasLays || (this.navbs != null)) {
        htm += `<div class="layout-corp"      id="${this.htmlId('Corp')}"></div>`;
      }
      if (UI.hasLays) {
        htm += `<div class="layout-find"      id="${this.htmlId('Find')}"></div>`;
      }
      if (UI.hasTocs) {
        htm += `<div class="layout-tocs tocs" id="${this.htmlId('Tocs')}"></div>`;
      }
      htm += `<div class="layout-view"      id="${this.htmlId('View')}"></div>`;
      if (UI.hasLays) {
        htm += `<div class="layout-side"      id="${this.htmlId('Side')}"></div>`;
      }
      if (UI.hasLays) {
        htm += `<div class="layout-pref     " id="${this.htmlId('Pref')}"></div>`;
      }
      if (UI.hasLays) {
        htm += `<div class="layout-foot"      id="${this.htmlId('Foot')}"></div>`;
      }
      if (UI.hasLays) {
        htm += `<div class="layout-trak"      id="${this.htmlId('Trak')}"></div>`;
      }
      return htm;
    }

    show() {
      if (UI.hasTocs) {
        this.tocs.show();
      }
      this.view.showAll();
    }

    hide() {
      if (UI.hasTocs) {
        this.tocs.hide();
      }
      this.view.hideAll();
    }

    resize() {
      this.view.resize();
    }

    // Html and jQuery Utilities in UI because it is passed around everywhere
    htmlId(name, type = '', ext = '') {
      return Util.htmlId(name, type, ext);
    }

    getHtmlId(name, ext = '') {
      return Util.getHtmlId(name, "", ext); // consider @uniqueIdExt
    }

    isEmpty($elem) {
      return ($elem != null) && ($elem.length != null) && $elem.length === 0;
    }

    isElem($elem) {
      return ($elem != null) && ($elem.length != null) && $elem.length > 0;
    }

    okPub(spec) {
      return !((spec['pub'] != null) && !spec['pub']);
    }

    static toTopic(name, source, intent, study = null) {
      var obj, tname;
      tname = name.replace(' ', '');
      obj = {
        name: tname,
        source: source,
        intent: intent
      };
      if (study != null) {
        obj.study = study;
      }
      UI.verifyTopic(obj, "UI.toTopic()");
      return obj;
    }

    static verifyTopic(topic, source) {
      var verify;
      verify = Util.isStr(topic.name) && Util.isStr(topic.source);
      if (topic.name === 'Select') {
        verify = verify && Util.inArray(UI.intents, topic.intent);
      }
      if (!verify) {
        console.log('UI.verifyTopic()', {
          topic: topic,
          source: source
        });
        console.trace();
      }
      return verify;
    }

  };

  UI.hasTocs = true;

  UI.hasLays = true;

  UI.$empty = $();

  UI.ncol = 36;

  UI.nrow = 36;

  UI.margin = {
    width: 1,
    height: 1,
    west: 1,
    north: 1,
    east: 1,
    south: 1,
    wStudy: 0.5,
    hStudy: 0.5
  };

  UI.SelectPlane = 'SelectPlane';

  UI.SelectPack = 'SelectPack';

  UI.SelectView = 'SelectView';

  UI.SelectPane = 'SelectPane';

  UI.SelectStudy = 'SelectStudy';

  UI.SelectTopic = 'SelectTopic';

  UI.SelectItems = 'SelectItems';

  UI.AddChoice = 'AddChoice';

  UI.DelChoice = 'DelChoice';

  UI.intents = [UI.SelectPlane, UI.SelectPack, UI.SelectView, UI.SelectPane, UI.SelectStudy, UI.SelectTopic, UI.SelectItems, UI.AddChoice, UI.DelChoice];

  return UI;

}).call(this);

export default UI;
