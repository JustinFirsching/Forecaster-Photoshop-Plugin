import path from 'path';

// Define JSON stringify and JSON parse
"object" != typeof JSON && (JSON = {}), function() { "use strict"; var rx_one = /^[\],:{}\s]*$/, rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, rx_four = /(?:^|:|,)(?:\s*\[)+/g, rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, gap, indent, meta, rep; function f(t) { return t < 10 ? "0" + t : t } function this_value() { return this.valueOf() } function quote(t) { return rx_escapable.lastIndex = 0, rx_escapable.test(t) ? '"' + t.replace(rx_escapable, function(t) { var e = meta[t]; return "string" == typeof e ? e : "\\u" + ("0000" + t.charCodeAt(0).toString(16)).slice(-4) }) + '"' : '"' + t + '"' } function str(t, e) { var r, n, o, u, f, a = gap, i = e[t]; switch (i && "object" == typeof i && "function" == typeof i.toJSON && (i = i.toJSON(t)), "function" == typeof rep && (i = rep.call(e, t, i)), typeof i) { case "string": return quote(i); case "number": return isFinite(i) ? String(i) : "null"; case "boolean": case "null": return String(i); case "object": if (!i) return "null"; if (gap += indent, f = [], "[object Array]" === Object.prototype.toString.apply(i)) { for (u = i.length, r = 0; r < u; r += 1)f[r] = str(r, i) || "null"; return o = 0 === f.length ? "[]" : gap ? "[\n" + gap + f.join(",\n" + gap) + "\n" + a + "]" : "[" + f.join(",") + "]", gap = a, o } if (rep && "object" == typeof rep) for (u = rep.length, r = 0; r < u; r += 1)"string" == typeof rep[r] && (o = str(n = rep[r], i)) && f.push(quote(n) + (gap ? ": " : ":") + o); else for (n in i) Object.prototype.hasOwnProperty.call(i, n) && (o = str(n, i)) && f.push(quote(n) + (gap ? ": " : ":") + o); return o = 0 === f.length ? "{}" : gap ? "{\n" + gap + f.join(",\n" + gap) + "\n" + a + "}" : "{" + f.join(",") + "}", gap = a, o } } "function" != typeof Date.prototype.toJSON && (Date.prototype.toJSON = function() { return isFinite(this.valueOf()) ? this.getUTCFullYear() + "-" + f(this.getUTCMonth() + 1) + "-" + f(this.getUTCDate()) + "T" + f(this.getUTCHours()) + ":" + f(this.getUTCMinutes()) + ":" + f(this.getUTCSeconds()) + "Z" : null }, Boolean.prototype.toJSON = this_value, Number.prototype.toJSON = this_value, String.prototype.toJSON = this_value), "function" != typeof JSON.stringify && (meta = { "\b": "\\b", "\t": "\\t", "\n": "\\n", "\f": "\\f", "\r": "\\r", '"': '\\"', "\\": "\\\\" }, JSON.stringify = function(t, e, r) { var n; if (indent = gap = "", "number" == typeof r) for (n = 0; n < r; n += 1)indent += " "; else "string" == typeof r && (indent = r); if ((rep = e) && "function" != typeof e && ("object" != typeof e || "number" != typeof e.length)) throw new Error("JSON.stringify"); return str("", { "": t }) }), "function" != typeof JSON.parse && (JSON.parse = function(text, reviver) { var j; function walk(t, e) { var r, n, o = t[e]; if (o && "object" == typeof o) for (r in o) Object.prototype.hasOwnProperty.call(o, r) && (void 0 !== (n = walk(o, r)) ? o[r] = n : delete o[r]); return reviver.call(t, e, o) } if (text = String(text), rx_dangerous.lastIndex = 0, rx_dangerous.test(text) && (text = text.replace(rx_dangerous, function(t) { return "\\u" + ("0000" + t.charCodeAt(0).toString(16)).slice(-4) })), rx_one.test(text.replace(rx_two, "@").replace(rx_three, "]").replace(rx_four, ""))) return j = eval("(" + text + ")"), "function" == typeof reviver ? walk({ "": j }, "") : j; throw new SyntaxError("JSON.parse") }) }();

// Define forEach if we don't have it
if (!Array.prototype.forEach) {
  Array.prototype.forEach = (function(callback, thisArg) {
    if ((this === void (0)) || (this === null)) {
      throw new TypeError("Array.prototype.forEach called on null or undefined");
    }
    var O = Object(this);
    var len = O.length >>> 0;
    if (callback.__class__ !== "Function") {
      throw new TypeError(callback + " is not a function");
    }
    var T = arguments.length > 1 ? thisArg : void (0);
    for (var k = 0; k < len; k += 1) {
      if (k in O) {
        kValue = O[k];
        callback.call(T, kValue, k, O);
      }
    }
  });
}

$._MYFUNCTIONS = {
  run: function(data) {
    // alert(data)
    runMain(data)
    return true
  },
  getFilesInfo: function() {
    return JSON.stringify(getFilesInformation())
  },

}

// Custom struct of file info?? Not sure what good this does
function getFilesInformation() {
  var arr = []
  for (var i = 0; i < app.documents.length; i++) {
    if (app.documents[i].name.toLowerCase().indexOf('englewood') != -1) {
      arr.push({ documentNum: i, area: 'englewood' })
    }
    if (app.documents[i].name.toLowerCase().indexOf('venice') != -1) {
      arr.push({ documentNum: i, area: 'venice' })
    }
  }
  return arr.length > 0 ? arr : null
}

// Save the file
function saveDoc() {
  let saveOpts = new JPEGSaveOptions();
  let name = doc.name.split('_')[0] + data.date
  let targetFilePath = path.join(doc.path.absoluteURI, name)

  saveOpts.emdedColorProfile = true;
  saveOpts.formatOptions = FormatOptions.STANDARDBASELINE;
  saveOpts.quality = 12


  doc.saveAs(File(targetFilePath), saveOpts, true)
}

function runMain(params) {
  try {
    params.forEach(function(data) {
      var doc = app.documents[parseInt(data.documentNum)]

      app.activeDocument = doc
      var loc1Layers = doc.layers.getByName('location 1').layers
      loc1Layers.getByName('low tide copy').layers.getByName('time text').artLayers.getByName('top').textItem.contents = data.location1.hightide.top
      loc1Layers.getByName('low tide copy').layers.getByName('time text').artLayers.getByName('bot').textItem.contents = data.location1.hightide.bot
      loc1Layers.getByName('low tide').layers.getByName('time text').artLayers.getByName('top').textItem.contents = data.location1.lowtide.top
      loc1Layers.getByName('low tide').layers.getByName('time text').artLayers.getByName('bot').textItem.contents = data.location1.lowtide.bot

      var loc2Layers = doc.layers.getByName('location 2').layers
      loc2Layers.getByName('low tide copy').layers.getByName('time text').artLayers.getByName('top').textItem.contents = data.location2.hightide.top
      loc2Layers.getByName('low tide copy').layers.getByName('time text').artLayers.getByName('bot').textItem.contents = data.location2.hightide.bot
      loc2Layers.getByName('low tide').layers.getByName('time text').artLayers.getByName('top').textItem.contents = data.location2.lowtide.top
      loc2Layers.getByName('low tide').layers.getByName('time text').artLayers.getByName('bot').textItem.contents = data.location2.lowtide.bot

      saveDoc()
    })

  } catch (error) {
    alert([error.line, error])
  }
}
