var Run;

import Util from '../util/Util.js';

import {
  Inspector,
  Runtime
} from 'https://unpkg.com/@observablehq/notebook-runtime@1?module';

//mport notebook from '../../html/download/standard.js';
Run = class Run {
  constructor() {
    Util.noop(this.req);
  }

  run(htmlId, notebook) {
    return Runtime.load(notebook, Inspector['into'](document.querySelector('#' + htmlId)));
  }

  // Dynamic import no working
  dyn(htmlId, notebookURL) {
    Util.noop(htmlId, notebookURL);
    return import( notebookURL ).then( (notebook) =>
      Runtime.load( notebook, Inspector['into']( document.querySelector('#'+htmlId ) ) ) );;
  }

  // Node.js require not working
  req(htmlId, notebookURL) {
    var rnotebook;
    rnotebook = d3.require(notebookURL);
    return Runtime.load(rnotebook, Inspector['into'](document.querySelector('#' + htmlId)));
  }

};

export default Run;
