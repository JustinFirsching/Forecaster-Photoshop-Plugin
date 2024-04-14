import { app } from 'photoshop';

import { fetchForecast, setTodayData, setFiveDayData } from './forecast.js';
import { fetchTideData, setTideData } from './tides.js';
import { saveDoc } from './utils.js';

let isRunning = false

// Set the date picker to tomorrow's date
function setDatePickerDefault() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('datepicker').value = tomorrow.toLocaleDateString('en-US')
}

// This sets the file info so the rest of the script knows what data to fetch
function getFileInfo() {
  var arr = []
  for (var i = 0; i < app.documents.length; i++) {
    if (app.documents[i].name.toLowerCase().contains('englewood_beach_forecast')) {
      arr.push({ documentNum: i, area: 'englewood', type: "tides" })
    }
    if (app.documents[i].name.toLowerCase().contains('venice_beach_forecast')) {
      arr.push({ documentNum: i, area: 'venice', type: "tides" })
    }
    if (app.documents[i].name.contains('Glance')) {
      arr.push({ documentNum: i, type: "today" })
    }
    if (app.documents[i].name.contains('5_Day')) {
      arr.push({ documentNum: i, type: "5_day" })
    }
  }
  return arr
}

async function getWeatherData(arr) {
  const date = document.querySelector('#datepicker').value
  // Fetch the forecast once and just reuse as needed
  const zip = document.querySelector('#zipcode').value
  const forecast = await fetchForecast(zip)

  const dataPromises = arr.map(async function(docInfo) {
    let data = {}
    data.documentNum = parseInt(docInfo.documentNum)
    data.requestedDate = date

    if (docInfo.type === "tides") {
      data.tideData = await fetchTideData(docInfo.area, date)
    } else if (docInfo.type === "today")
      data.forecast = forecast
    else if (doc.type === "5_day") {
      data.forecast = forecast
    } else {
      alert(`We don't know what happend. docInfo.type: ${docInfo.type}`)
    }
    return data
  })

  const params = await Promise.all(dataPromises);
  return params;
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

async function run() {
  let fileInfo = getFileInfo()
  if (fileInfo.length == 0) {
    alert('Please open psd files with templates')
    return
  }

  const weatherData = await getWeatherData(fileInfo)
  weatherData.forEach(data => {
    var doc = app.documents[data.documentNum]

    // Set the active document in Photoshop to the document we are working with
    app.activeDocument = doc
    fillData(doc, data)

    // TODO: Fix this. This is horrendous
    let name = `${doc.name.split('.')[0]}_${data.date.substring(4, 6)}_${data.date.substring(6, 8)}`
    saveDoc(doc, name)
  })
}

setDatePickerDefault()
document.querySelector('.submit').addEventListener('click', async () => {
  if (!isRunning) {
    isRunning = true
    try {
      run()
    } finally {
      isRunning = false
    }
  }
})
