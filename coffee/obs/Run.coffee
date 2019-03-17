
import Util from '../util/Util.js'
import {Inspector, Runtime} from "https://unpkg.com/@observablehq/notebook-runtime@1?module"
#mport notebook from "./html/download/standard.js";

class Run

  constructor:() ->

  run:( htmlId, notebookURL ) ->
    Util.noop( htmlId, notebookURL )
    `import( notebookURL ).then( (notebook) =>
      Runtime.load( notebook, Inspector['into']( document.querySelector('#'+htmlId ) ) ) );`

`export default Run`