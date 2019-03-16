var Tocs,
  hasProp = {}.hasOwnProperty;

import Util from '../util/Util.js';

import UI from '../ui/UI.js';

import Dom from '../ui/Dom.js';

Tocs = (function() {
  class Tocs {
    constructor(ui, stream, practices) {
      this.onSelect = this.onSelect.bind(this);
      this.ui = ui;
      this.stream = stream;
      this.practices = practices;
      [this.specs, this.stack] = this.createTocsSpecs(this.practices);
      this.htmlIdApp = this.ui.getHtmlId('Tocs', '');
      this.classPrefix = Util.isStr(this.practices.css) ? this.practices.css : 'tocs';
      this.last = this.specs[0];
      this.speed = 400;
    }

    createTocsSpecs(practs) {
      var keyPract, keyStudy, keyTopic, pract, spec0, specN, specs, stack, study, topic;
      spec0 = {
        level: 0,
        name: "Beg",
        hasChild: true
      };
      stack = new Array(Tocs.MaxTocLevel);
      stack[0] = spec0;
      specs = [];
      specs.push(spec0);
      for (keyPract in practs) {
        if (!hasProp.call(practs, keyPract)) continue;
        pract = practs[keyPract];
        if (!(this.isToc(keyPract, pract))) {
          continue;
        }
        this.enrichSpec(keyPract, pract, specs, 1, spec0);
        for (keyStudy in pract) {
          if (!hasProp.call(pract, keyStudy)) continue;
          study = pract[keyStudy];
          if (!(this.isToc(keyStudy, study))) {
            continue;
          }
          this.enrichSpec(keyStudy, study, specs, 2, pract);
          for (keyTopic in study) {
            if (!hasProp.call(study, keyTopic)) continue;
            topic = study[keyTopic];
            if (this.isToc(keyTopic, topic)) {
              this.enrichSpec(keyTopic, topic, specs, 3, study);
            }
          }
        }
      }
      specN = {
        level: 0,
        name: "End",
        hasChild: false
      };
      specs.push(specN);
      return [specs, stack];
    }

    isToc(key, obj) {
      return Util.isChild(key) && !((obj['toc'] != null) && !obj['toc']);
    }

    hasChild(spec) {
      var child, key;
      if (spec.level >= 3) {
        return false;
      }
      for (key in spec) {
        if (!hasProp.call(spec, key)) continue;
        child = spec[key];
        if (Util.isChild(key)) {
          return true;
        }
      }
      return false;
    }

    infoSpecs() {
      var j, len, ref, spec;
      ref = this.specs;
      for (j = 0, len = ref.length; j < len; j++) {
        spec = ref[j];
        console.info('Tocs.spec', Util.indent(spec.level * 2), spec.name, spec.hasChild);
      }
    }

    enrichSpec(key, spec, specs, level, parent) {
      //console.log( 'Tocs', key, spec )
      spec.level = level;
      spec.parent = parent;
      spec.on = false;
      spec.hasChild = this.hasChild(spec);
      specs.push(spec);
    }

    // console.log( Util.indent(spec.level*2), spec.name )
    ready() {
      var j, len, ref, select, spec, subject;
      this.$tocs = $(this.html());
      this.$tocp = $('#' + this.htmlIdApp);
      this.$tocp.append(this.$tocs);
      ref = this.specs;
      for (j = 0, len = ref.length; j < len; j++) {
        spec = ref[j];
        if (!(spec.level > 0)) {
          continue;
        }
        spec.$elem = spec.hasChild ? $('#' + spec.ulId) : $('#' + spec.liId);
        spec.$li = $('#' + spec.liId);
        select = this.toSelect(spec);
        subject = (spec.type != null) && spec.type === 'plane' ? 'Plane' : 'Select';
        this.stream.event(subject, select, Dom.element(spec.$li), 'click');
      }
      this.subscribe();
    }

    toSelect(spec) {
      var select;
      if ((spec.type != null) && spec.type === 'plane') {
        return UI.toTopic(spec.name, 'Tocs', UI.SelectPack);
      } else if ((spec.type != null) && spec.type === 'pack') {
        select = this.ui.okPub(spec) ? UI.SelectPack : UI.SelectView;
        return UI.toTopic(spec.name, 'Tocs', select);
      } else if ((spec.type != null) && (spec.type === 'menu' || spec.type === 'item')) {
        return UI.toTopic(spec.name, 'Tocs', 'None');
      } else if (spec.column != null) {
        return UI.toTopic(spec.name, 'Tocs', UI.SelectPane);
      } else if (spec.dir) { // Study
        return UI.toTopic(spec.parent.name, 'Tocs', UI.SelectStudy, spec.parent[spec.name]);
      } else if (spec.name === 'View') { // View - not used now
        return UI.toTopic(spec.name, 'Tocs', UI.SelectView);
      } else {
        console.error('Toc.toSelect() unable to determine spec type or level', spec);
        return UI.toTopic(spec.name, 'Tocs', UI.SelectPane); // Pane
      }
    }

    subscribe() {
      this.stream.subscribe('Select', 'Tocs', (select) => {
        return this.onSelect(select);
      });
    }

    htmlId(spec, ext = '') {
      var suffix;
      suffix = spec.parent != null ? ext + spec.parent.name : ext;
      return this.ui.htmlId(spec.name, 'Tocs', suffix);
    }

    getSpec(select, issueError = true) {
      var j, len, ref, spec;
      ref = this.specs;
      for (j = 0, len = ref.length; j < len; j++) {
        spec = ref[j];
        if (spec.name === select.name) {
          return spec;
        }
      }
      if (issueError && this.nameNotOk(select.name)) {
        console.error('Tocs.getSpec(id) spec null for select', select);
        this.infoSpecs();
      }
      return null;
    }

    nameNotOk(name) {
      var j, len, okName, okNames;
      okNames = ['None', 'View', 'Embrace', 'Innovate', 'Encourage', 'Learn', 'Do', 'Share'];
      for (j = 0, len = okNames.length; j < len; j++) {
        okName = okNames[j];
        if (name === okName) {
          return false;
        }
      }
      return true;
    }

    html() {
      var htm, i, j, ref;
      this.specs[0].ulId = this.htmlId(this.specs[0], 'UL');
      htm = `<ul class="${this.classPrefix}ul0" id="${this.specs[0].ulId}">`;
      for (i = j = 1, ref = this.specs.length; (1 <= ref ? j < ref : j > ref); i = 1 <= ref ? ++j : --j) {
        htm += this.process(i);
      }
      return htm;
    }

    show() {
      this.$tocs.show();
    }

    hide() {
      this.$tocs.hide();
    }

    process(i) {
      var htm, j, level, prev, ref, ref1, spec;
      htm = "";
      prev = this.specs[i - 1];
      spec = this.specs[i];
      if (spec.level >= prev.level) {
        htm += this.htmlBeg(spec);
        this.stack[spec.level] = spec;
      } else {
        for (level = j = ref = prev.level, ref1 = spec.level; (ref <= ref1 ? j <= ref1 : j >= ref1); level = ref <= ref1 ? ++j : --j) {
          if (this.stack[level] != null) {
            htm += this.htmlEnd(this.stack[level]);
          }
        }
        if (i < this.specs.length - 1) {
          htm += this.htmlBeg(spec);
        }
      }
      return htm;
    }

    htmlBeg(spec) {
      var htm;
      spec.liId = this.htmlId(spec, 'LI');
      spec.ulId = this.htmlId(spec, 'UL');
      //console.log( 'Tocs htmlBeg()', spec.id, spec.liId, spec.ulId )
      htm = `<li class="${this.classPrefix}li${spec.level}" id="${spec.liId}" >`;
      htm += `${this.htmIconName(spec)}`;
      if (spec.hasChild) {
        htm += `<ul class="${this.classPrefix}ul${spec.level}" id="${spec.ulId}">`;
      }
      return htm;
    }

    htmIconName(spec) {
      var htm, name;
      if (spec.name == null) {
        console.log('Tocs.htmIconName()', {
          spec: spec
        });
      }
      name = spec.title != null ? spec.title : spec.name;
      htm = "<div style=\"display:table;\">";
      if (spec.icon) {
        htm += `<i class="fa ${spec.icon} fa-lg"></i>`;
      }
      htm += `<span style="display:table-cell; vertical-align:middle; padding-left:12px;">${Util.toName(name)}</span>`;
      return htm += "</div>";
    }

    htmlEnd(spec) {
      if (spec.level === 0) {
        return "</ul>";
      } else if (spec.hasChild) {
        return "</ul></li>";
      } else {
        return "</li>";
      }
    }

    onSelect(select) {
      var spec;
      // console.log( 'Toc.onSelect()', select )
      UI.verifyTopic(select, 'Tocs');
      spec = this.getSpec(select, true); // spec null ok not all Tocs available for views
      if (spec != null) {
        this.update(spec);
      } else if (select.name === 'View' && (this.last != null)) {
        this.reveal(this.last);
        this.last = this.specs[0];
      }
    }

    update(spec) {
      var j, k, l, last, level, ref, ref1, ref2;
      this.stack[spec.level] = spec;
// Build stack to turn on spec levels
      for (level = j = ref = spec.level; j >= 2; level = j += -1) {
        this.stack[level - 1] = this.stack[level].parent;
      }
      last = this.last;
// Turn off items that are different or below level
      for (level = k = ref1 = this.last.level; k >= 1; level = k += -1) {
        if (last.name !== this.stack[level].name || level > spec.level) {
          this.reveal(last);
        }
        last = last.parent;
      }
// Turn  on  items in the spec stack
      for (level = l = 1, ref2 = spec.level; l <= ref2; level = l += 1) {
        if (!this.stack[level].on) {
          this.reveal(this.stack[level]);
        }
      }
      this.last = spec;
    }

    reveal(spec) {
      spec.on = !spec.on;
      if (spec.level === 0) {
        return;
      }
      if (spec.hasChild) {
        spec.$elem.toggle(this.speed);
      } else {
        spec.$elem.css({
          color: spec.on ? '#FFFF00' : '#FFFFFF'
        });
      }
    }

  };

  Tocs.MaxTocLevel = 12;

  return Tocs;

}).call(this);

export default Tocs;
