var Btn,
  hasProp = {}.hasOwnProperty;

import UI from '../ui/UI.js';

import Dom from '../ui/Dom.js';

Btn = class Btn {
  constructor(ui, stream, pane, spec, contents1) {
    this.ui = ui;
    this.stream = stream;
    this.pane = pane;
    this.spec = spec;
    this.contents = contents1;
    this.css = this.pane.classPrefix;
  }

  ready() {
    if (this.pane.page == null) {
      return;
    }
    this.$ = $(this.html(this.contents));
    this.pane.$.append(this.$);
    this.publish(this.contents);
  }

  layout(geom) {
    if (geom.w < 200) {
      this.$.hide();
    } else {
      this.$.show();
    }
  }

  html(contents) {
    var content, html, htmlId, key, name, x;
    htmlId = this.ui.htmlId(this.pane.name, 'Btn');
    html = `<ul id="${htmlId}" class="${this.css + '-ul-content'}">`;
    x = 0;
    for (key in contents) {
      if (!hasProp.call(contents, key)) continue;
      content = contents[key];
      if (!(this.hasButton(content))) {
        continue;
      }
      content.btnId = this.ui.htmlId(this.pane.name, content.name + 'Btn');
      name = content.name.charAt(0);
      html += `<li id="${content.btnId}" class="${this.css + '-li-content-btn'}" style="left:${x}px;"><div>${name}</div></li>`;
      x = x + 24;
    }
    html += "</ul>";
    return html;
  }

  publish(contents) {
    var content, key, msg;
    for (key in contents) {
      if (!hasProp.call(contents, key)) continue;
      content = contents[key];
      if (!(this.hasButton(content))) {
        continue;
      }
      content.$btn = $('#' + content.btnId);
      msg = UI.content(content.name, 'Btn', UI.SelectStudy, this.pane.name);
      this.stream.event('Content', msg, Dom.element(content.$btn), 'click');
    }
  }

  hasButton(content) {
    return content.has && content.btn && content.name;
  }

};

export default Btn;
