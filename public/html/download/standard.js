// URL: https://observablehq.com/@axiom6/standard-library
// Title: Standard Library
// Author: Tom Flaherty (@axiom6)
// Version: 648
// Runtime version: 1

const m0 = {
  id: "72db2064e484bfda@648",
  variables: [
    {
      inputs: ["md"],
      value: (function (md) {
        return (
          md`# Standard Library

<figure><img src="https://user-images.githubusercontent.com/230541/33673828-b7aeb004-da62-11e7-9861-feb5df0ef622.jpg" alt="x"></figure>

A cheatsheet for the [Observable standard library](https://github.com/observablehq/stdlib/blob/master/README.md).`
        )
      })
    },
    {
      inputs: ["md"],
      value: (function (md) {
        return (
          md`## DOM`
        )
      })
    },
    {
      inputs: ["DOM"],
      value: (function (DOM) {
        return (
          DOM
        )
      })
    },
    {
      inputs: ["DOM", "width"],
      value: (function (DOM, width) {
          const context = DOM.context2d(width, 33);
          context.fillText("Hello, I am a canvas!", 0, 20);
          return context.canvas;
        }
      )
    },
    {
      inputs: ["DOM"],
      value: (function (DOM) {
        return (
          DOM.download(
            new Blob([JSON.stringify({hello: "world"})], {type: "application/json"}),
            "hello.json", // optional file name
            "Click to Download" // optional button label
          )
        )
      })
    },
    {
      inputs: ["DOM", "svg"],
      value: (function (DOM, svg) {
          const clip = DOM.uid("clip");
          return svg`<svg width="128" height="128" viewBox="0 0 640 640">
  <defs>
    <clipPath id="${clip.id}">
      <circle cx="320" cy="320" r="320"></circle>
    </clipPath>
  </defs>
  <image
    clip-path="${clip}"
    width="640" height="640"
    preserveAspectRatio="xMidYMin slice"
    xlink:href="https://gist.githubusercontent.com/mbostock/9511ae067889eefa5537eedcbbf87dab/raw/944b6e5fe8dd535d6381b93d88bf4a854dac53d4/mona-lisa.jpg"
  ></image>
</svg>`;
        }
      )
    },
    {
      inputs: ["md"],
      value: (function (md) {
        return (
          md`## HTML`
        )
      })
    },
    {
      inputs: ["html"],
      value: (function (html) {
        return (
          html`I am a text node.`
        )
      })
    },
    {
      inputs: ["DOM"],
      value: (function (DOM) {
        return (
          DOM.text("I am a text node.")
        )
      })
    },
    {
      inputs: ["html", "DOM"],
      value: (function (html, DOM) {
        return (
          html`This is escaped: ${DOM.text("<i>Hello!</i>")}`
        )
      })
    },
    {
      inputs: ["html"],
      value: (function (html) {
        return (
          html`<span style="background:yellow;">
  Hello, <i>world</i>!
</span>`
        )
      })
    },
    {
      inputs: ["html"],
      value: (function (html) {
        return (
          html`<input type=range min=0 max=10 step=1>`
        )
      })
    },
    {
      inputs: ["html"],
      value: (function (html) {
        return (
          html`<select>
  <option>one</option>
  <option>two</option>
  <option>three</option>
</select>`
        )
      })
    },
    {
      inputs: ["md"],
      value: (function (md) {
        return (
          md`## SVG`
        )
      })
    },
    {
      inputs: ["svg", "width"],
      value: (function (svg, width) {
        return (
          svg`<svg width=${width} height=27>
  <text y=22>Hello, I am SVG!</text>
</svg>`
        )
      })
    },
    {
      inputs: ["md"],
      value: (function (md) {
        return (
          md`## Markdown`
        )
      })
    },
    {
      inputs: ["md"],
      value: (function (md) {
        return (
          md`Hello, I am *Markdown*!`
        )
      })
    },
    {
      inputs: ["md", "now"],
      value: (function (md, now) {
        return (
          md`The current time is ${new Date(now).toLocaleString()}.`
        )
      })
    },
    {
      inputs: ["md"],
      value: (function (md) {
        return (
          md`## LaTeX`
        )
      })
    },
    {
      inputs: ["tex"],
      value: (function (tex) {
        return (
          tex`E = mc^2`
        )
      })
    },
    {
      inputs: ["tex"],
      value: (function (tex) {
        return (
          tex`
f(x) = \int_{-\infty}^\infty
    \hat f(\xi)\,e^{2 \pi i \xi x}
    \,d\xi
`
        )
      })
    },
    {
      inputs: ["tex"],
      value: (function (tex) {
        return (
          tex.block`
f(x) = \int_{-\infty}^\infty
    \hat f(\xi)\,e^{2 \pi i \xi x}
    \,d\xi
`
        )
      })
    },
    {
      inputs: ["md"],
      value: (function (md) {
        return (
          md`## Files`
        )
      })
    },
    {
      inputs: ["Files"],
      value: (function (Files) {
        return (
          Files
        )
      })
    },
    {
      name: "viewof file",
      inputs: ["html"],
      value: (function (html) {
        return (
          html`<input type=file>`
        )
      })
    },
    {
      name: "file",
      inputs: ["Generators", "viewof file"],
      value: (G, _) => G.input(_)
    },
    {
      inputs: ["Files", "file"],
      value: (function (Files, file) {
        return (
          Files.buffer(file)
        )
      })
    },
    {
      inputs: ["Files", "file"],
      value: (function (Files, file) {
        return (
          Files.text(file)
        )
      })
    },
    {
      inputs: ["Files", "file"],
      value: (function (Files, file) {
        return (
          Files.url(file)
        )
      })
    },
    {
      inputs: ["md"],
      value: (function (md) {
        return (
          md`## Generators`
        )
      })
    },
    {
      inputs: ["Generators"],
      value: (function (Generators) {
        return (
          Generators
        )
      })
    },
    {
      name: "integers",
      value: (function () {
        return (
          function* integers() {
            let i = -1;
            while (true) {
              yield ++i;
            }
          }
        )
      })
    },
    {
      name: "input",
      inputs: ["html"],
      value: (function (html) {
        return (
          html`<input type=range>`
        )
      })
    },
    {
      name: "inputValue",
      inputs: ["Generators", "input"],
      value: (function (Generators, input) {
        return (
          Generators.input(input)
        )
      })
    },
    {
      inputs: ["Generators"],
      value: (function (Generators) {
        return (
          Generators.observe(notify => {
            const mousemoved = event => notify([event.clientX, event.clientY]);
            window.addEventListener("mousemove", mousemoved);
            return () => window.removeEventListener("mousemove", mousemoved);
          })
        )
      })
    },
    {
      inputs: ["Generators"],
      value: (function (Generators) {
        return (
          Generators.queue(notify => {
            const mousemoved = event => notify([event.clientX, event.clientY]);
            window.addEventListener("mousemove", mousemoved);
            return () => window.removeEventListener("mousemove", mousemoved);
          })
        )
      })
    },
    {
      inputs: ["md"],
      value: (function (md) {
        return (
          md`## Promises`
        )
      })
    },
    {
      inputs: ["Promises"],
      value: (function (Promises) {
        return (
          Promises
        )
      })
    },
    {
      inputs: ["Promises"],
      value: (function (Promises) {
        return (
          Promises.delay(5000, "resolved value")
        )
      })
    },
    {
      inputs: ["Promises"],
      value: (function (Promises) {
        return (
          Promises.tick(1000, "resolved value")
        )
      })
    },
    {
      inputs: ["Promises"],
      value: (function* (Promises) {
          while (true) {
            yield Promises.tick(1000).then(() => new Date);
          }
        }
      )
    },
    {
      inputs: ["Promises"],
      value: (function (Promises) {
          // A somewhat elaborate variation of Promises.delay.
          const date = new Date;
          date.setSeconds(date.getSeconds() + 1);
          return Promises.when(date, "resolved value");
        }
      )
    },
    {
      inputs: ["md"],
      value: (function (md) {
        return (
          md`## require`
        )
      })
    },
    {
      name: "d3",
      inputs: ["require"],
      value: (function (require) {
        return (
          require("d3@5")
        )
      })
    },
    {
      name: "topojson",
      inputs: ["require"],
      value: (function (require) {
        return (
          require("topojson-client", "topojson-simplify")
        )
      })
    },
    {
      inputs: ["require"],
      value: (function (require) {
        return (
          require("https://unpkg.com/d3@5/dist/d3.min.js")
        )
      })
    },
    {
      inputs: ["require"],
      value: (function (require) {
        return (
          require.resolve("d3@5")
        )
      })
    },
    {
      inputs: ["md"],
      value: (function (md) {
        return (
          md`## Reactive Variables`
        )
      })
    },
    {
      inputs: ["html", "d3", "invalidation"],
      value: (function (html, d3, invalidation) {
          let i = 0;
          const div = html`<div>`;
          const timer = d3.timer(() => div.textContent = ++i);
          invalidation.then(() => timer.stop()); // Stop if re-evaluated.
          return div;
        }
      )
    },
    {
      inputs: ["now"],
      value: (function (now) {
        return (
          now
        )
      })
    },
    {
      inputs: ["width"],
      value: (function (width) {
        return (
          width
        )
      })
    }
  ]
};

const notebook = {
  id: "72db2064e484bfda@648",
  modules: [m0]
};

export default notebook;
