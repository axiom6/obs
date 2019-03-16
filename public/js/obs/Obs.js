var Obs;

import Util from '../util/Util.js';

import Data from '../util/Data.js';

import Stream from '../util/Stream.js';

Obs = (function() {
  class Obs {
    static init(data) {
      App.Spec = Data.createPracs(data);
      UI.ncol = 36;
      UI.nrow = 36;
      UI.hasPack = false;
      UI.hasTocs = true;
      UI.hasLays = true;
      Util.ready(function() {
        var app, infoSpec, stream, subjects, ui;
        subjects = ["Ready", "Select", "Choice", "Test"];
        subjects = subjects.concat(App.NavbSubjects);
        infoSpec = {
          subscribe: false,
          publish: false,
          subjects: ["Select", "Choice", "Test"]
        };
        stream = new Stream(subjects, infoSpec);
        ui = new UI(stream, App.Spec, 'App', App.NavbSpecs);
        app = new App(stream, ui);
        app.onReady();
      });
    }

    constructor(stream1, ui1) {
      this.onReady = this.onReady.bind(this);
      this.stream = stream1;
      this.ui = ui1;
      this.stream.subscribe("Ready", "App", () => {
        return this.onReady();
      });
    }

    onReady() {
      this.createPages();
      this.ui.pagesReady('Icons');
    }

    createPages() {
      var i, len, pane, ref;
      ref = this.ui.view.panes;
      for (i = 0, len = ref.length; i < len; i++) {
        pane = ref[i];
        // console.log( 'App.createPages()', pane.name )
        pane.page = new Icons(this.ui.stream, this.ui, pane);
      }
    }

  };

  Data.local = "http://localhost:63342/obs/public/";

  Data.hosted = "https://ui-48413.firebaseapp.com/";

  Data.asyncJSON("json/basic/Obs.json", Obs.init);

  App.NavbSubjects = ["Search", "Contact", "Settings", "SignOn"];

  Obs.NavbSpecs = [
    {
      type: "NavBarLeft"
    },
    {
      type: "Item",
      name: "Home",
      icon: "fa-home",
      topic: UI.toTopic("View",
    'Navb',
    UI.SelectView),
      subject: "Select"
    },
    {
      type: "NavBarEnd"
    },
    {
      type: "NavBarRight"
    },
    {
      type: "Search",
      name: "Search",
      icon: "fa-search",
      size: "10",
      topic: 'Search',
      subject: "Search"
    },
    {
      type: "Contact",
      name: "Contact",
      icon: "fa-user",
      topic: "http://twitter.com/TheTomFlaherty",
      subject: "Contact"
    },
    {
      type: "Dropdown",
      name: "Settings",
      icon: "fa-cog",
      items: [
        {
          type: "Item",
          name: "Preferences",
          topic: "Preferences",
          subject: "Settings"
        },
        {
          type: "Item",
          name: "Connection",
          topic: "Connection",
          subject: "Settings"
        },
        {
          type: "Item",
          name: "Privacy",
          topic: "Privacy",
          subject: "Settings"
        }
      ]
    },
    {
      type: "SignOn",
      name: "SignOn",
      icon: "fa-sign-in",
      size: "10",
      topic: 'SignOn',
      subject: "SignOn"
    },
    {
      type: "NavBarEnd"
    }
  ];

  return Obs;

}).call(this);

export default Obs;
