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

// create a function that converts a number from 0 to 360 into a cardinal or ordinal direction
function degreesToDirection(degrees) {
  if (degrees < 0 || degrees > 360) {
    throw new Error('Invalid degrees')
  }
  if (degrees < 11.25) {
    return 'N'
  } else if (degrees < 33.75) {
    return 'NNE'
  } else if (degrees < 56.25) {
    return 'NE'
  } else if (degrees < 78.75) {
    return 'ENE'
  } else if (degrees < 101.25) {
    return 'E'
  } else if (degrees < 123.75) {
    return 'ESE'
  } else if (degrees < 146.25) {
    return 'SE'
  } else if (degrees < 168.75) {
    return 'SSE'
  } else if (degrees < 191.25) {
    return 'S'
  } else if (degrees < 213.75) {
    return 'SSW'
  } else if (degrees < 236.25) {
    return 'SW'
  } else if (degrees < 258.75) {
    return 'WSW'
  } else if (degrees < 281.25) {
    return 'W'
  } else if (degrees < 303.75) {
    return 'WNW'
  } else if (degrees < 326.25) {
    return 'NW'
  } else if (degrees < 348.75) {
    return 'NNW'
  } else {
    return 'N'
  }
}

$._MYFUNCTIONS = {
  run: function(docData, forecastData) {
    // alert(data)
    runMain(docData, forecastData)
    return true
  },
  getFilesInfo: function() {
    return JSON.stringify(getFilesInformation())
  },

}

// This sets the file info so the rest of the script knows what data to fetch
function getFilesInformation() {
  var arr = []
  for (var i = 0; i < app.documents.length; i++) {
    // TODO: Get the doc name for tides so it is more specific
    if (app.documents[i].name.toLowerCase().contains('englewood')) {
      arr.push({ documentNum: i, area: 'englewood', type: "tides" })
    }
    if (app.documents[i].name.toLowerCase().contains('venice')) {
      arr.push({ documentNum: i, area: 'venice', type: "tides" })
    }
    if (app.documents[i].name.contains('Glance')) {
      arr.push({ documentNum: i, type: "today" })
    }
    if (app.documents[i].name.contains('5_Day')) {
      arr.push({ documentNum: i, type: "5_day" })
    }
  }
  return arr.length > 0 ? arr : null
}

// Save the file
function saveDoc(doc, name) {
  // TODO: Maybe a file browser in the Index html to select the folder to save to?

  // TODO: Save as PSD and PNG
  doc.saveAs(File(targetFilePath))

  let saveOpts = new JPEGSaveOptions();
  let targetFilePath = path.join(doc.path.absoluteURI, name)

  saveOpts.emdedColorProfile = true;
  saveOpts.formatOptions = FormatOptions.STANDARDBASELINE;
  saveOpts.quality = 12


  doc.saveAs(File(targetFilePath), saveOpts, true)
}

function setTideData(data) {
  // If this isn't the tide psd, skip
  if (data.type !== "tides") {
    console.log('Not the tide doc... skipping tides')
  }
  // If we don't have tide data, skip
  if (data.tideData == null) {
    console.warn('No tide data... skipping tides')
    return
  }

  // If we have a first location layer and tide data
  if (doc.layers.getByName('location 1') != null && data.tideData.location1 != null) {
    let loc1Layers = doc.layers.getByName('location 1').layers
    loc1Layers.getByName('low tide copy').layers.getByName('time text').artLayers.getByName('top').textItem.contents = data.tideData.location1.hightide.top
    loc1Layers.getByName('low tide copy').layers.getByName('time text').artLayers.getByName('bot').textItem.contents = data.tideData.location1.hightide.bot
    loc1Layers.getByName('low tide').layers.getByName('time text').artLayers.getByName('top').textItem.contents = data.tideData.location1.lowtide.top
    loc1Layers.getByName('low tide').layers.getByName('time text').artLayers.getByName('bot').textItem.contents = data.tideData.location1.lowtide.bot
  }

  // If we have a second location layer and tide data
  if (doc.layers.getByName('location 2') != null && data.tideData.location2 != null) {
    var loc2Layers = doc.layers.getByName('location 2').layers
    loc2Layers.getByName('low tide copy').layers.getByName('time text').artLayers.getByName('top').textItem.contents = data.tideData.location2.hightide.top
    loc2Layers.getByName('low tide copy').layers.getByName('time text').artLayers.getByName('bot').textItem.contents = data.tideData.location2.hightide.bot
    loc2Layers.getByName('low tide').layers.getByName('time text').artLayers.getByName('top').textItem.contents = data.tideData.location2.lowtide.top
    loc2Layers.getByName('low tide').layers.getByName('time text').artLayers.getByName('bot').textItem.contents = data.tideData.location2.lowtide.bot
  }
}

function setTodayData(doc, data) {
  if (data.type != "today") {
    console.log("Not the today/tonight doc... skipping today/tonight forecast")
    return
  }

  if (data.forecast == null) {
    console.error("No forecast data... skipping today/tonight forecast")
    return
  }

  // Break into today and tonight data
  // Filter the data from data.forecast to the item that has a date element with today's date
  let todayData = data.forecast.filter(function(item) {
    return new Date(item.date).getDate() === new Date(data.requestedDate).getDate()
  })[0]

  if (todayData == null) {
    console.error("No today data... skipping today forecast")
    return
  }

  // TODO: Insert the correct date in %m/%d/%Y format

  let [dayData, nightData] = (todayData.day, todayData.night)

  // Root layer groups
  let tdTnLayers = doc.layers.getByName('td tn')
  let dayLayers = tdTnLayers.layers.getByName('day')
  let nightLayers = tdTnLayers.layers.getByName('night')

  // Today temp
  let tdTemps = dayLayers.layers.getByName('temps')
  // Actual
  tdTemps.layers.getByName('temp day').artLayers.getByName('77').textItem.contents = dayData.temperatureMax
  // Feels Like
  tdTemps.layers.getByName('feels like').artLayers.getByName('feels like 77').textItem.contents = `feels like ${dayData.temperatureApparentMax}`

  // Tonight temp
  nightLayers.layers.getByName('temp night').artLayers.getByName(/* TODO */).textItem.contents = nightData.temperatureMin

  // Today precipitation
  dayLayers.layers.getByName('% chance').artLayers.getByName(/* TODO */).textItem.contents = dayData.precipitationProbability * 100.0

  // Tonight precipitation
  nightLayers.layers.getByName('% chance').artLayers.getByName(/* TODO */).textItem.contents = nightData.precipitationProbability * 100.0

  // Today wind
  let dayWindLayers = dayLayers.layers.getByName('wind')
  dayWindLayers.artLayers.getByName(/* TODO */).textItem.contents = `${dayData.windSpeedMin} - ${dayData.windSpeedMax}`
  dayWindLayers.artLayers.getByName(/* TODO */).textItem.contents = degreesToDirection(dayData.windDirectionAvg)

  // Tonight wind
  let nightWindLayers = nightLayers.layers.getByName('wind')
  nightWindLayers.artLayers.getByName(/* TODO */).textItem.contents = `${nightData.windSpeedMin} - ${nightData.windSpeedMax}`
  nightWindLayers.artLayers.getByName(/* TODO */).textItem.contents = degreesToDirection(nightData.windDirectionAvg)
}

function setFiveDayData(doc, data) {
  // TODO: This
  if (data.type != "5_day") {
    console.log("Not the 5 day doc... skipping 5 day forecast")
    return
  }

  if (data.forecast == null) {
    console.error("No forecast data... skipping 5 day forecast")
    return
  }

  const layerNames = [
    // Day 1
    {
      "day": "MON",
      "tempHigh": "60",
      "tempLow": "48",
      "conditions": "Mostly Sunny",
      "precipitation": "40%",
    },
    // Day 2
    {
      "day": "TUE",
      "tempHigh": "64",
      "tempLow": "52",
      "conditions": "Mostly Sunny",
      "precipitation": "20%",
    },
    // Day 3
    {
      "day": "WED",
      "tempHigh": "68",
      "tempLow": "53",
      "conditions": "Partly Sunny",
      "precipitation": "20%",
    },
    // Day 4
    {
      "day": "THU",
      "tempHigh": "60",
      "tempLow": "53",
      "conditions": "Partly Sunny",
      "precipitation": "20%",
    },
    // Day 5
    {
      "day": "FRI",
      "tempHigh": "70",
      "tempLow": "54",
      "conditions": "Partly Sunny",
      "precipitation": "20%",
    },
  ]

  // Filter the data to only forecasts with a date greater than the requested date
  data.forecast = data.forecast.filter(function(item) {
    return new Date(item.date) > new Date(data.requestedDate)
  })

  if (data.forecast == null) {
    console.error("No data to create 5 day forecast...")
    return
  }

  if (data.forecast.length < 5) {
    console.warn("Not enough data for a full 5 day forecast... Doing what we can...")
  }

  let fiveDayLayers = doc.layers.getByName('5d')
  // data.forecast.length should never be more than 5 but just in case the API changes or something
  let maxDays = Math.min(5, data.forecast.length)

  for (var i = 0; i < maxDays; i++) {
    let dayLayers = fiveDayLayers.layers.getByName(`d${i + 1}`)
    let layerGroup = dayLayers.layers.getByName("Group 1")

    let forecast = data.forecast[i]
    let [dayData, nightData] = (forecat.day, forecast.night)

    // Set day of week
    // Day of Week as 3 letter abbreviation
    let dayAbbrev = new Date(forecast.date).toDateString().substring(0, 3)
    layerGroup.artLayers.getByName(layerNames[i].day).textItem.contents = dayAbbrev


    // These are weird, but they get us the data we want, unless only the other is available
    // if neither are available, just use `{}` so we don't `null` error
    let dayOrNight = (dayData != null ? dayData : nightData) || {}
    let nightOrDay = (nightData != null ? nightData : dayData) || {}

    // Temp High
    let highTemp = dayOrNight.temperatureMax || "ERR"
    layerGroup.artLayers.getByName(layerNames[i].tempHigh).textItem.contents = highTemp

    // Temp Low
    let lowTemp = nightOrDay.temperatureMin || "ERR"
    layerGroup.artLayers.getByName(layerNames[i].tempLow).textItem.contents = lowTemp

    // Precipitation
    // TODO: When preicipitation is <= 20%, just hide visibility on the layer
    let precipitation = dayData != null && dayData.precipitationProbability > 20 ? `${dayData.precipitationProbability} %` : ""
    dayLayers.layers.getByName("pop").artLayers.getByName(layerNames[i].precipitation) = precipitation

    // If possible, do the weather text prediction
    let conditions = "Raining Iguanas"
    dayLayers.layers.getByName(layerNames[i].conditions) = conditions
  }
}

// Fill the data into the PSD
function fillData(doc, data) {
  if (data == null) {
    alert('No data!')
    return
  }

  switch (data.type) {
    case "tide": setTideData(doc, data); break;
    case "today": setTodayData(doc, data); break;
    case "5_day": setFiveDayData(doc, data); break;
    case "sunrise_sunset": setSunriseSunset(doc, data); break;
  }
}

function runMain(weatherData) {
  // Params is a list of the return of getParams in client/Index.js
  try {
    weatherData.forEach(function(data) {
      var doc = app.documents[parseInt(data.documentNum)]

      // Set the active document in Photoshop to the document we are working with
      app.activeDocument = doc
      fillData(doc, data)

      // TODO: Fix this. This is horrendous
      let name = `${doc.name.split('.')[0]}_${data.date.substring(4, 6)}_${data.date.substring(6, 8)}`
      saveDoc(doc, name)
    })

  } catch (error) {
    alert([error.line, error])
  }
}
