var Navb;

import Util from '../util/Util.js';

import Dom from '../ui/Dom.js';

Navb = class Navb {
  constructor(ui, stream, navbSpecs) {
    this.search = this.search.bind(this);
    this.signon = this.signon.bind(this);
    this.searchForm = this.searchForm.bind(this);
    this.signonForm = this.signonForm.bind(this);
    this.ui = ui;
    this.stream = stream;
    this.specs = this.createSpecs(navbSpecs);
    this.htmlId = Util.getHtmlId('Corp');
  }

  createSpecs(navbSpecs) {
    var i, len, navbSpec, specs;
    specs = [];
    for (i = 0, len = navbSpecs.length; i < len; i++) {
      navbSpec = navbSpecs[i];
      specs.push(navbSpec);
    }
    return specs;
  }

  ready() {
    this.$navb = $('#' + this.htmlId);
    this.$navb.append(this.html());
    return this.publish();
  }

  id(spec, ext = '') {
    return Util.htmlId(spec.name, 'Navb', ext);
  }

  publish() {
    var elem, eventType, i, item, j, len, len1, ref, ref1, spec;
    ref = this.specs;
    for (i = 0, len = ref.length; i < len; i++) {
      spec = ref[i];
      if (spec.htmlId != null) {
        spec.$ = $('#' + spec.htmlId);
        eventType = spec.subject === 'Submit' ? 'keyup' : 'click';
        elem = Dom.element(spec.$);
        if (Util.isDef(elem)) {
          if (spec.topic != null) {
            this.stream.event(spec.subject, spec.topic, Dom.element(spec.$), eventType);
          }
        } else {
          console.error('Navb.publish spec elem null', spec);
        }
      }
      if (spec.items != null) {
        ref1 = spec.items;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          item = ref1[j];
          if (!(item.htmlId != null)) {
            continue;
          }
          item.$ = $('#' + item.htmlId);
          elem = Util.element(item.$);
          if (Util.isDef(elem)) {
            if (item.topic != null) {
              this.stream.event(item.subject, item.topic, elem, 'click');
            }
          } else {
            console.error('Navb.publish item elem null', item);
          }
        }
      }
    }
  }

  getSpec(id) { // Not really needed
    var i, len, ref, spec;
    ref = this.specs;
    for (i = 0, len = ref.length; i < len; i++) {
      spec = ref[i];
      if (spec.id === id) {
        return spec;
      }
    }
    console.error('Navb.getSpec(id) spec null for id', id);
    return null;
  }

  html() {
    var htm, i, len, ref, spec;
    htm = "<div class=\"navb\">";
    ref = this.specs;
    for (i = 0, len = ref.length; i < len; i++) {
      spec = ref[i];
      switch (spec.type) {
        case 'Brand':
          htm += `<a  class="navb-brand" href="${spec.href}">${spec.name}</a>`;
          break;
        case 'NavBarLeft':
          htm += "<ul class=\"navb-ul-left\">";
          break;
        case 'NavBarRight':
          htm += "<ul class=\"navb-ul-right\">";
          break;
        case 'NavBarEnd':
          htm += "</ul>";
          break;
        case 'Item':
          htm += this.item(spec);
          break;
        case 'Link':
          htm += this.link(spec);
          break;
        case 'Dropdown':
          htm += this.dropdown(spec);
          break;
        case 'FileInput':
          htm += this.fileInput(spec);
          break;
        case 'Image':
          htm += this.image(spec);
          break;
        case 'Search':
          htm += this.search(spec);
          break;
        case 'Contact':
          htm += this.contact(spec);
          break;
        case 'SignOn':
          htm += this.signon(spec);
          break;
        default:
          console.error('Navb unknown spec type', spec.type);
      }
    }
    htm += "</div>";
    return htm;
  }

  show() {
    this.$navb.show();
  }

  hide() {
    this.$navb.hide();
  }

  item(spec) {
    spec.htmlId = this.id(spec);
    return `<li id="${spec.htmlId}" class="navb-item"><i class="fa ${spec.icon} fa-lg"></i> ${spec.name}</li>`;
  }

  link(spec) {
    spec.htmlId = this.id(spec); //  href="{spec.href}"
    return `<li class="navb-link"><a id="${spec.htmlId}"><i title="${spec.name}" class="fa ${spec.icon} fa-lg"></i> ${spec.name}</a></li>`;
  }

  dropdown(spec) {
    var htm, i, item, len, ref;
    htm = "<li class=\"navb-drop\">";
    htm += `<i class="fa ${spec.icon} fa-lg"/> ${spec.name}  <i class="fa fa-caret-down"/>`;
    htm += "<ul>";
    ref = spec.items;
    for (i = 0, len = ref.length; i < len; i++) {
      item = ref[i];
      item.htmlId = this.id(item, spec.name);
      htm += `<li id="${item.htmlId}">${item.name
    // <i class="fa #{item.icon}"></i>
}</li>`;
    }
    htm += "</ul></li>";
    return htm;
  }

  image(spec) {
    spec.htmlId = this.id(spec);
    return `<li id="${spec.htmlId}" class="navb-image-li"><i class="fa ${spec.icon}"/>&nbsp;Image</li>`;
  }

  fileInput(spec) {
    spec.htmlId = this.id(spec);
    return `<li class="navb-fileinput-li"><input id="${spec.htmlId}" class="navb-fileinput" placeholder="  &#xF0F6; Input File"  type="file" size="${spec.size}"></li>`;
  }

  search(spec) {
    spec.htmlId = this.id(spec);
    return `<li class="navb-search-li"><input id="${spec.htmlId}" class="navb-search" placeholder="  &#xF002; Search"  type="text" size="${spec.size}"></li>`;
  }

  signon(spec) {
    spec.htmlId = this.id(spec);
    return `<li class="navb-signon-li"><input id="${spec.htmlId}" class="navb-signon" placeholder="  &#xF090; Sign On" type="text" size="${spec.size}"></li>`;
  }

  searchForm(spec) {
    spec.htmlId = this.id(spec);
    return `<li><form id="${spec.htmlId}" name="search" class="navb-search">\n<input name="criteria" placeholder=" &#xF002; ${spec.name}" type="text" size="${spec.size}">\n<label for="SEARCH"></label></form></li>`;
  }

  signonForm(spec) {
    spec.htmlId = this.id(spec);
    return `<li><form id="${spec.htmlId}" name="login" class="navb-signon">\n<input name="user" placeholder="  &#xF090;  Sign On" type="text" size="${spec.size}">\n<label for="SIGNON"></label></form></li>`;
  }

  contact(spec) {
    spec.htmlId = this.id(spec);
    return `<li class="navb-contact"><a id="${spec.htmlId}"><i class="fa ${spec.icon} fa-lg"></i> ${spec.name}</a></li>`;
  }

};

export default Navb;
