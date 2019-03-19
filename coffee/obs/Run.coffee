
import Util from '../util/Util.js'
import {Inspector, Runtime} from 'https://unpkg.com/@observablehq/notebook-runtime@1?module'
#mport notebook from '../../html/download/standard.js';

class Run

  constructor:() ->
    Util.noop( @req )

  run:( htmlId, notebook ) ->
    Runtime.load( notebook, Inspector['into']( document.querySelector('#'+htmlId ) ) )

  # Dynamic import no working
  dyn:( htmlId, notebookURL ) ->
    Util.noop( htmlId, notebookURL )
    `import( notebookURL ).then( (notebook) =>
      Runtime.load( notebook, Inspector['into']( document.querySelector('#'+htmlId ) ) ) );`

  # Node.js require not working
  req:( htmlId, notebookURL ) ->
    rnotebook = d3.require( notebookURL )
    Runtime.load( rnotebook, Inspector['into']( document.querySelector('#'+htmlId ) ) )



`export default Run`