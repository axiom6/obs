var Icons;

import Basic from '../ui/Basic.js';

Icons = class Icons extends Basic {
  constructor(stream, ui, pane) {
    super(stream, ui, pane, 'Icons');
  }

  ready() {
    this.$ = this.readyCenter();
    return this.$;
  }

  layout(intent) {
    this.layoutCenter(intent);
  }

};

export default Icons;
