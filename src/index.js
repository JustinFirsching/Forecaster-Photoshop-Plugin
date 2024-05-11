const app = require('photoshop').app
const core = require('photoshop').core

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
    let docName = app.documents[i].name.toLowerCase()
    if (docName.includes('englewood_beach_forecast')) {
      arr.push({ documentNum: i, area: 'englewood', type: "tides" })
    } else if (docName.includes('venice_beach_forecast')) {
      arr.push({ documentNum: i, area: 'venice', type: "tides" })
    } else if (docName.includes('today_tonight')) {
      arr.push({ documentNum: i, type: "today" })
    } else if (docName.includes('5_day')) {
      arr.push({ documentNum: i, type: "5_day" })
    } else {
      console.log(`Not sure what this file is: ${app.documents[i].name}`)
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
    data.type = docInfo.type
    data.requestedDate = date

    if (docInfo.type === "tides") {
      data.tideData = await fetchTideData(docInfo.area, date)
    } else if (docInfo.type === "today")
      data.forecast = forecast
    else if (docInfo.type === "5_day") {
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

  core.executeAsModal(() => {
    weatherData.forEach(data => {
      var doc = app.documents[data.documentNum]

      // Set the active document in Photoshop to the document we are working with
      app.activeDocument = doc
      try {
        fillData(doc, data)
      } catch (e) {
        console.log(`The error is\n${e.stack}`)
      }

      // TODO: Fix this. This is horrendous
      let name = `${doc.name.split('.')[0]}_${data.date.substring(4, 6)}_${data.date.substring(6, 8)}`
      saveDoc(doc, name)
    })
  })
}

setDatePickerDefault()
document.getElementById('submit').addEventListener('click', async () => {
  if (!isRunning) {
    isRunning = true
    try {
      await run()
    } catch (e) {
      console.log(e)
      alert(e)
    } finally {
      isRunning = false
    }
  }
})
