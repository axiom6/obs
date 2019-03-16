var Data,
  hasProp = {}.hasOwnProperty;

import Util from '../util/Util.js';

Data = (function() {
  class Data {
    // ---- Read JSON with batch async
    static batchRead(batch, callback, create = null) {
      var key, obj;
      for (key in batch) {
        if (!hasProp.call(batch, key)) continue;
        obj = batch[key];
        this.batchJSON(obj, batch, callback, create);
      }
    }

    static batchComplete(batch) {
      var key, obj;
      for (key in batch) {
        if (!hasProp.call(batch, key)) continue;
        obj = batch[key];
        if (!obj['data']) {
          return false;
        }
      }
      return true;
    }

    static batchJSON(obj, batch, callback, create = null) {
      var settings, url;
      if (Util.jQueryHasNotBeenLoaded()) {
        return;
      }
      url = Data.baseUrl() + obj.url;
      settings = {
        url: url,
        type: 'GET',
        dataType: 'json',
        processData: false,
        contentType: 'application/json',
        accepts: 'application/json'
      };
      settings.success = (data, status, jqXHR) => {
        Util.noop(status, jqXHR);
        obj['data'] = Util.isFunc(create) ? create(data, obj.type) : data;
        if (Data.batchComplete(batch)) {
          return callback(batch);
        }
      };
      settings.error = (jqXHR, status, error) => {
        Util.noop(jqXHR);
        return console.error("Data.batchJSON()", {
          url: url,
          status: status,
          error: error
        });
      };
      $.ajax(settings);
    }

    static planeData(batch, plane) {
      return batch[plane].data[plane];
    }

    static baseUrl() {
      if (window.location.href.includes('localhost')) {
        return Data.local;
      } else {
        return Data.hosted;
      }
    }

    static asyncJSON(url, callback) {
      var settings;
      if (Util.jQueryHasNotBeenLoaded()) {
        return;
      }
      url = Data.baseUrl() + url;
      settings = {
        url: url,
        type: 'GET',
        dataType: 'json',
        processData: false,
        contentType: 'application/json',
        accepts: 'application/json'
      };
      settings.success = (data, status, jqXHR) => {
        Util.noop(status, jqXHR);
        return callback(data);
      };
      settings.error = (jqXHR, status, error) => {
        Util.noop(jqXHR);
        return console.error("Data.asyncJSON()", {
          url: url,
          status: status,
          error: error
        });
      };
      $.ajax(settings);
    }

    static syncJSON(path) {
      var jqxhr;
      if (Util.jQueryHasNotBeenLoaded()) {
        return {};
      }
      jqxhr = $.ajax({
        type: "GET",
        url: path,
        dataType: 'json',
        cache: false,
        async: false
      });
      return jqxhr['responseJSON'];
    }

    // ------ Quick JSON read ------
    static read(url, doJson) {
      if (Util.isObj(url)) {
        Data.readFile(url, doJson);
      } else {
        Data.readAjax(url, doJson);
      }
    }

    static readFile(fileObj, doJson) {
      var fileReader;
      fileReader = new FileReader();
      fileReader.onerror = function(e) {
        return console.error('Store.readFile', fileObj.name, e.target.error);
      };
      fileReader.onload = function(e) {
        return doJson(JSON.parse(e.target.result));
      };
      fileReader.readAsText(fileObj);
    }

    static readAjax(url, doJson) { //jsonp
      var settings;
      settings = {
        url: url,
        type: 'get',
        dataType: 'json',
        processData: false,
        contentType: 'application/json',
        accepts: 'application/json'
      };
      settings.success = (data, status, jqXHR) => {
        var json;
        Util.noop(status, jqXHR);
        json = JSON.parse(data);
        return doJson(json);
      };
      settings.error = (jqXHR, status, error) => {
        return console.error('Store.ajaxGet', {
          url: url,
          status: status,
          error: error
        });
      };
      $.ajax(settings);
    }

    static saveFile(data, fileName) {
      var downloadLink, htmlBlob, htmlUrl;
      htmlBlob = new Blob([data], {
        type: "text/html;charset=utf-8"
      });
      htmlUrl = window['URL'].createObjectURL(htmlBlob);
      downloadLink = document.createElement("a");
      downloadLink.href = htmlUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }

  };

  Data.hosted = "https://ui-48413.firebaseapp.com/";

  Data.local = "http://localhost:63342/muse/public/";

  Data.localJSON = "http://localhost:63342/muse/public/json";

  Util.noop(Data.hosted, Data.expandStudys, Data.syncJSON);

  Data.Databases = {
    color: {
      id: "color",
      key: "id",
      uriLoc: Data.localJSON + '/color',
      uriWeb: 'https://github.com/axiom6/ui/data/color',
      tables: ['master', 'ncs', 'gray']
    },
    exit: {
      id: "exit",
      key: "_id",
      uriLoc: Data.localJSON + '/exit',
      uriWeb: 'https://github.com/axiom6/ui/data/exit',
      tables: ['ConditionsEast', 'ConditionsWest', 'Deals', 'Forecasts', 'I70Mileposts', 'SegmentsEast', 'SegmentsWest']
    },
    radar: {
      id: "radar",
      key: "name",
      uriLoc: Data.localJSON + '/radar',
      uriWeb: 'https://github.com/axiom6/ui/data/radar',
      tables: ['axiom-techs', 'axiom-quads', 'axiom-techs-schema', 'axiom-quads-schema', 'polyglot-principles']
    },
    sankey: {
      id: "radar",
      uriLoc: Data.localJSON + '/sankey',
      uriWeb: 'https://github.com/axiom6/ui/data/sankey',
      tables: ['energy', 'flare', 'noob', 'plot']
    },
    muse: {
      id: "muse",
      uriLoc: Data.localJSON + '/muse',
      uriWeb: 'https://github.com/axiom6/ui/data/muse',
      tables: ['Columns', 'Rows', 'Practices']
    },
    pivot: {
      id: "pivot",
      uriLoc: Data.localJSON + '/pivot',
      uriWeb: 'https://github.com/axiom6/ui/data/pivot',
      tables: ['mps']
    },
    geo: {
      id: "geo",
      uriLoc: Data.localJSON + '/geo',
      uriWeb: 'https://github.com/axiom6/ui/data/geo',
      tables: ['upperLarimerGeo'],
      schemas: ['GeoJSON']
    },
    f6s: {
      id: "f6s",
      uriLoc: Data.localJSON + '/f6s',
      uriWeb: 'https://github.com/axiom6/ui/data/fs6',
      tables: ['applications', 'followers', 'mentors', 'profile', 'teams']
    }
  };

  return Data;

}).call(this);

export default Data;
