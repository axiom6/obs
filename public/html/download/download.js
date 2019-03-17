// URL: https://observablehq.com/@observablehq/downloading-and-embedding-notebooks
// Title: Downloading and Embedding Notebooks
// Author: Observable (@observablehq)
// Version: 525
// Runtime version: 1

const m0 = {
  id: "c2a04e7b9a9d03bb@525",
  variables: [
    {
      inputs: ["md"],
      value: (function(md){return(
md`# Downloading and Embedding Notebooks

<img src="https://etc.usf.edu/clipart/54200/54238/54238_book_pile_md.gif" style="max-width:450px" />

**tl;dr** *[Notebooks can be embedded and customized](http://ashkenas.com/breakout/) anywhere on the web (or off it).*

So, you’ve written your magnum opus: an awesome notebook full of splendor and delight. Now, the problem is — How do you display it on your website? How do you integrate its nifty charts into your web app? How do you save it to your hard drive, to file away for posterity alongside your old Word documents and vacation photos?

As you’ve probably noticed by now, Observable notebooks are a little bit different than the regular old JavaScripts you know and love. They execute in order of dependency and data flow rather than in a linear sequence of statements, and contain strange and marvelous reactive primitives, like [viewof](https://beta.observablehq.com/@mbostock/a-brief-introduction-to-viewof) and [mutable](https://beta.observablehq.com/@jashkenas/introduction-to-mutable-state).

Luckily, Observable provides an open-source [runtime](https://github.com/observablehq/notebook-runtime), which stitches together a notebook’s cells into a dependency graph and brings them to life through evaluation; a [standard library](https://github.com/observablehq/notebook-stdlib), which provides helpful functions for working with HTML, SVG, generators, files and promises among [other useful sundries](https://beta.observablehq.com/@mbostock/standard-library); and an [inspector](https://github.com/observablehq/notebook-inspector), which implements the default strategy for rendering DOM and JavaScript values into a live web page — although you’re free to write your own.

We’ll use the Observable runtime to render notebooks outside of observablehq.com.`
)})
    },
    {
      inputs: ["iconHeader"],
      value: (function(iconHeader){return(
iconHeader("Notebooks as ES Modules", `<path d="M8.688 1H3.875C3.115 1 2.5 1.627 2.5 2.4v11.2c0 .773.616 1.4 1.375 1.4h8.25c.76 0 1.375-.627 1.375-1.4V5.9L8.687 1z"></path><path d="M8.5 1v5h5"></path>`)
)})
    },
    {
      inputs: ["md"],
      value: (function(md){return(
md`After you share or publish a notebook, a copy of it, compiled to JavaScript, may be downloaded or linked as an [ES module](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/). Click the **Download code** link in a notebook’s menu to retrieve the URL for your notebook.

<img src="https://gist.githubusercontent.com/jashkenas/4553bbb196e54b301eeca39c7d5cf3cb/raw/3fd26b98b5e7b1b29faacc17379b93066f527220/code.png" style="max-width: 300px;" />

The URL will look something like this:

\`https://api.observablehq.com/@jashkenas/my-neat-notebook.js\``
)})
    },
    {
      inputs: ["md"],
      value: (function(md){return(
md`
Using this ES module version of your notebook, you can run and render cells in any web or JavaScript environment.

Here’s a basic example script that renders every cell in a notebook into an empty HTML page:

\`\`\`html
<script type="module">
  // Load the Observable runtime and inspector.
  import {Runtime, Inspector} from "https://unpkg.com/@observablehq/notebook-runtime?module";

  // Your notebook, compiled as an ES module.
  import notebook from "https://api.observablehq.com/@jashkenas/my-neat-notebook.js";

  // Or, your notebook, downloaded locally.
  import notebook from "./my-neat-notebook.js";

  // Load the notebook, observing its cells with a default Inspector
  // that simply renders the value of each cell into the provided DOM node.
  Runtime.load(notebook, Inspector.into(document.body));
</script>
\`\`\``
)})
    },
    {
      inputs: ["md"],
      value: (function(md){return(
md`\`Runtime.load()\` takes two or three arguments: a **notebook** module, an optional **builtins** object (which defaults to the Observable [standard library](https://github.com/observablehq/notebook-stdlib)), and an **observer callback**, which is invoked for each cell in your notebook, and may choose to return an **observer object** that can receive or render values as the cell is computed.

Define your **observer object** with three optional methods: 

**pending()** is called whenever the cell is reevaluated.

**fulfilled(value)** is passed the resolved value of the cell, whenever the evaluation has finished.

**rejected(error)** is passed the error when a cell fails to resolve for any reason.`
)})
    },
    {
      inputs: ["md"],
      value: (function(md){return(
md`
As a first example, let’s build our own version of \`Inspector.into()\`, still using the [notebook-inspector](https://github.com/observablehq/notebook-inspector) library:

\`\`\`js
Runtime.load(notebook, (cell) => {
  var div = document.createElement("div");
  document.body.appendChild(div);
  return new Inspector(div);
});
\`\`\``
)})
    },
    {
      inputs: ["md"],
      value: (function(md){return(
md`
Here's an example of an observer callback that doesn't touch the DOM at all, instead logging all evaluation to the console:

\`\`\`js
Runtime.load(notebook, (cell) => {
  return {
    pending: () => console.log(\`\${cell.name} is running...\`),
    fulfilled: (value) => console.log(cell.name, value),
    rejected: (error) => console.error(error)
  };
});
\`\`\``
)})
    },
    {
      inputs: ["md"],
      value: (function(md){return(
md`
Finally, here's an example of an observer callback that inserts just a single cell from your notebook into the page:

\`\`\`js
Runtime.load(notebook, (cell) => {
  if (cell.name === "chart") {
    return {
      fulfilled: (value) => {
        document.getElementById("chart").appendChild(value);
      }
    };
  }
});
\`\`\``
)})
    },
    {
      inputs: ["md"],
      value: (function(md){return(
md`*Nota bene:* On observablehq.com, each cell in your notebook is evaluated eagerly by default, because each cell is visible on the page. With embedded notebooks, cells for which you do not provide an *observer* will not be evaluated (unless other cells depend on them). This gives you the flexibility to evaluate as much or as little of your notebook as you like, but may also make things appear broken if your notebook uses a lot of side effects. To force evaluation of a cell, just return an observer object (or \`true\`) from the observer callback.

\`\`\`js
Runtime.load(notebook, (cell) => {
  if (cell.name === "canvas") {
    return {fulfilled: (value) => $("#canvas").append(value)};
  } else {
    // Force evaluation of all the other cells in the notebook.
    return true;
  }
});
\`\`\``
)})
    },
    {
      inputs: ["iconHeader"],
      value: (function(iconHeader){return(
iconHeader("Notebooks as npm modules", `<path d="M14 4v9H2V4M1 1h14v3H1zM6.5 6.5h3" />`)
)})
    },
    {
      inputs: ["md"],
      value: (function(md){return(
md`Observable also provides a copy of your notebook as an installable npm module, in gzipped tarball flavor.

<img src="https://gist.githubusercontent.com/jashkenas/4553bbb196e54b301eeca39c7d5cf3cb/raw/3fd26b98b5e7b1b29faacc17379b93066f527220/tarball.png" style="max-width: 300px;" />

Right-clicking and copying that link, will get you something that looks like this: <br>
\`https://api.observablehq.com/@jashkenas/my-neat-notebook.tgz\`

You can use this URL to install a notebook into your project with **npm**, **Yarn** or the JavaScript package manager of your choice:

\`\`\`
npm i https://api.observablehq.com/@jashkenas/my-neat-notebook.tgz

yarn add https://api.observablehq.com/@jashkenas/my-neat-notebook.tgz
\`\`\`

This will install the notebook as a package under its published name ("my-neat-notebook"). Notebooks are versioned with every change that you make, and requests to the Observable API for the ES Module or Tarball will receive the latest published or shared version.

If you want to lock your request to a specific version, you can add the version number of any published or shared version of your notebook to the URL:

\`\`\`
https://api.observablehq.com/@jashkenas/my-neat-notebook@42.js
https://api.observablehq.com/@jashkenas/my-neat-notebook@365.tgz
\`\`\``
)})
    },
    {
      name: "demo",
      inputs: ["md"],
      value: (function(md){return(
md`## ✨ Live Demonstrations ✨

As an off-site example of an embedded notebook in action, check out http://ashkenas.com/breakout. It loads the runtime and [this Observable notebook](https://beta.observablehq.com/@jashkenas/breakout), rendering values from four of the notebook cells into the page: the **game canvas**, the **"New Game" button**, the **current score**, and the **high score**.


<a href="http://ashkenas.com/breakout"><img src="https://gist.githubusercontent.com/jashkenas/4553bbb196e54b301eeca39c7d5cf3cb/raw/8fe3d464429e2db7ef78cd99979f05652fb31379/breakout.png" style="max-width: 400px;" /></a>`
)})
    },
    {
      inputs: ["md"],
      value: (function(md){return(
md`As a second, more minimal, example: [this CodePen](https://codepen.io/jashkenas/pen/gzZXPG) embeds a [simple notebook](https://beta.observablehq.com/d/e8186dc6a68b5179) that exposes a single \`tick\` cell, incrementing every second.

As a third example, [Philippe Rivière](https://beta.observablehq.com/@fil) wrote a brief tutorial that demonstrates embedding [this notebook on Tissot’s indicatrix](https://beta.observablehq.com/@fil/tissots-indicatrix) into a [Jekyll blog post](https://visionscarto.net/observable-jekyll/).

And finally, as an arcane demonstration of the dark arts of recursive embedding, we can use the Observable environment to demonstrate the brainbending reality of a [notebook embedding *itself*](https://beta.observablehq.com/@jashkenas/ouroboros-a-notebook-embeds-itself). Wow!`
)})
    },
    {
      inputs: ["md"],
      value: (function(md){return(
md`We’re hoping to continue working to make notebook embedding more useful over time — with your help. If you have interesting use cases, publishing workflows, npm module ideas, website embed techniques, or just want to talk about anything else you’d like to see embedded notebooks do, please join the conversation on [talk.observablehq.com](https://talk.observablehq.com/).`
)})
    },
    {
      name: "iconHeader",
      inputs: ["html"],
      value: (function(html){return(
function iconHeader(title, svg) {
  return html`<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" width="32" height="32" style="stroke-width: 1.5;">${svg}</svg>
<h2 style="display: inline; vertical-align: top; margin-left: 5px;">${title}</h2>`;
}
)})
    },
    {
      inputs: ["md"],
      value: (function(md){return(
md`*Thanks for the pile of books, [ClipArt ETC](http://etc.usf.edu/clipart/54200/54238/54238_book_pile.htm).*`
)})
    }
  ]
};

const notebook = {
  id: "c2a04e7b9a9d03bb@525",
  modules: [m0]
};

export default notebook;
