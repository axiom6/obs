var Base;

Base = class Base {
  constructor(stream, ui, name) {
    this.ready = this.ready.bind(this);
    this.readyView = this.readyView.bind(this);
    this.stream = stream;
    this.ui = ui;
    this.name = name;
    this.ui.addPage(this.name, this);
  }

  ready(cname) {
    return console.error(`Subclass ${this.name} needs to implements ready(${cname})`);
  }

  readyView() {
    return $(`<h1 style=" display:grid; justify-self:center; align-self:center; ">${this.name}</h1>`);
  }

};

export default Base;
