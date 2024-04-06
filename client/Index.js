import { get } from 'axios';

import { API_KEY_TOMORROW_IO } from "./const.js"
import { CSInterface } from "./libs/CSInterface.js"

var csInterface = new CSInterface();
setDatePickerDefault()

let isRunning = false
const parameters = {}
parameters.tideStations = {
  'englewood': {
    // Caspersen
    location1: '8725809',
    // Englewood
    location2: '8725747'
  },
  'venice': {
    // Venice
    location1: '8725889',
    // Siesta
    location2: '8726034'
  }
}

document.querySelector('.runMain').addEventListener('click', () => {
  if (!isRunning) {
    isRunning = true
    getInfoAndRun()
    // Reset this at the end?
    isRunning = false
  }
})

function getInfoAndRun() {
  csInterface.evalScript(`$._MYFUNCTIONS.getFilesInfo()`, async function(fileInfo) {
    fileInfo = JSON.parse(fileInfo)
    if (!fileInfo) {
      isRunning = false
      alert('Please open psd files with templates')
      return
    }

    const data = await getWeatherData(fileInfo)
    run_main(data)
    isRunning = false
  })
}

function processTideData(data) {
  let lowTide = { top: null, bot: null, top_time: null, bot_time: null };
  let highTide = { top: null, bot: null, top_time: null, bot_time: null };

  for (const entry of data) {
    const currentNum = parseFloat(entry.v).toFixed(1)
    const timeString = entry.t.split(' ')[1]
    //low tide
    if (entry.type === 'L') {
      if (lowTide.top == null) {
        lowTide.top = currentNum
        lowTide.top_time = timeString;
      } else {
        if (lowTide.top <= currentNum) {
          lowTide.bot = currentNum
          lowTide.bot_time = timeString
        } else {
          lowTide.bot = lowTide.top
          lowTide.top = currentNum
          lowTide.bot_time = lowTide.top_time
          lowTide.top_time = timeString
        }
      }
    }

    //high tide
    if (entry.type === 'H') {
      if (highTide.top == null) {
        highTide.top = currentNum
        highTide.top_time = timeString
      } else {
        if (highTide.top <= currentNum) {
          highTide.bot = currentNum
          highTide.bot_time = timeString
        } else {
          highTide.bot = highTide.top
          highTide.top = currentNum
          highTide.bot_time = highTide.top_time
          highTide.top_time = timeString
        }
      }
    }
  }

  let formatTideString = (height, time) => height ? `${height} ft @ ${convertTo12HourFormat(time)}` : ''

  return {
    lowtide: {
      top: formatTideString(lowTide.top, lowTide.top_time),
      bot: formatTideString(lowTide.bot, lowTide.bot_time),
    },
    hightide: {
      top: formatTideString(highTide.top, highTide.top_time),
      bot: formatTideString(highTide.bot, highTide.bot_time),
    }
  };
}

async function getWeatherData(arr) {
  const date = document.querySelector('#datepicker').value
  // Fetch the forecast once and just reuse as needed
  const zip = document.querySelector('#zipcode').value
  const forecast = await fetchForecast(zip)

  const dataPromises = arr.map(async function(docInfo) {
    let data = {}
    data.documentNum = docInfo.documentNum
    data.requestedDate = date

    if (docInfo.type === "tides") {
      let psdFileLocations = parameters.tideStations[docInfo.area]
      data.tideData.location1 = await fetchTideData(psdFileLocations.location1, date)
      data.tideData.location2 = await fetchTideData(psdFileLocations.location2, date)
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

async function fetchTideData(station, date) {
  // Adjust date format for API
  data = date.replaceAll('-', '')

  const apiUrl = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter';
  const params = {
    product: 'predictions',
    application: 'NOS.COOPS.TAC.WL',
    begin_date: date,
    end_date: date,
    datum: 'MLLW',
    station: station,
    time_zone: 'lst_ldt',
    units: 'english',
    interval: 'hilo',
    format: 'json',
  };

  try {
    const response = await get(apiUrl, { params });
    const predictions = response.data.predictions;
    return processTideData(predictions)
    // Process the data as needed
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Iterate through the elements of the `data` array
// Each element has a `time` property that is a string in the format "YYYY-MM-DDTHH:MM:SSZ"
// If the time is between 8 AM and 8 PM then save the `windGustAvg` value to f.dayGustAvg
// If the time is between 8 PM and 8 AM the day after, save `windGustAvg` value to f.nightGustAvg
// When we hit 8 AM the next day, push f to forecasts, and reset f to an empty object
// Return the forecasts array
function processForecastData(data) {
  if (data.length == 0) {
    return []
  }

  let forecasts = []
  let d1 = new Date(data[0].time)
  var f = {
    date: d1.toLocaleDateString('en-US'),
    day: {},
    night: {},
  }

  var dayCount = 0
  var nightCount = 0

  data.forEach(forecast => {
    const time = new Date(forecast.time)
    const hour = time.getHours()
    // This is ugly I know
    forecast = forecast.values

    if (hour === 8 && (dayCount > 0 || nightCount > 0)) {
      // Post process forecast data
      // Day
      if (dayCount > 0) {
        f.day.temperatureAvg /= dayCount
        f.day.temperatureApparentAvg /= dayCount
        f.day.windDirection /= dayCount
        // f.day.precipitation /= dayCount
      }
      // Night
      if (nightCount > 0) {
        f.night.temperatureAvg /= nightCount
        f.night.temperatureApparentAvg /= nightCount
        f.night.windDirection /= nightCount
        // f.night.precipitation /= dayCount
      }

      forecasts.push(f)

      // Reset
      f = {
        date: time.toLocaleDateString('en-US'),
        day: {},
        night: {}
      }
      dayCount = 0
      nightCount = 0
    }

    if (hour >= 8 && hour < 20) {
      dayCount++

      // Temperature
      f.day.temperatureAvg = (f.day.temperatureAvg || 0) + forecast.temperature
      f.day.temperatureApparentAvg = (f.day.temperatureApparent || 0) + forecast.temperatureApparent
      f.day.temperatureMin = Math.min(forecast.temperature, f.day.temperatureMin || 999)
      f.day.temperatureMax = Math.max(forecast.temperature, f.day.temperatureMax || -999)

      // Wind
      // TODO: If wind speed is less than 5, "light"
      f.day.windSpeedMin = Math.min(forecast.windSpeed, f.day.windSpeedMin || 999)
      f.day.windSpeedMax = Math.max(forecast.windSpeed, f.day.windSpeedMax || -999)
      // TODO: If max - min > 45degrees => "variable" instead of average
      f.day.windDirection = (f.day.windDirection || 0) + forecast.windDirection

      // Precipitation
      // Averaging doesn't work well, it leads to a lot of 0% hours pulling the chance way down.
      // For example, 100% chance of rain 2-4 PM and 0% chance of rain the rest of the day would average to 16%.
      // f.day.precipitation = (f.day.precipitation || 0) + forecast.precipitationProbability
      f.day.precipitation = Math.max(forecast.precipitationProbability, f.day.precipitation || 10)
    } else {
      nightCount++

      // Temperature
      f.night.temperatureAvg = (f.night.temperature || 0) + forecast.temperature
      f.night.temperatureApparentAvg = (f.night.temperatureApparent || 0) + forecast.temperatureApparent
      f.night.temperatureMin = Math.min(forecast.temperature, f.night.temperatureMin || 999)
      f.night.temperatureMax = Math.max(forecast.temperature, f.night.temperatureMax || -999)

      // Wind
      // TODO: If wind speed is less than 5, "light"
      f.night.windSpeedMin = Math.min(forecast.windSpeed, f.night.windSpeedMin || 999)
      f.night.windSpeedMax = Math.max(forecast.windSpeed, f.night.windSpeedMax || -999)
      // TODO: If max - min > 45degrees => "variable" instead of average
      f.night.windDirection = (f.night.windDirection || 0) + forecast.windDirection

      // Precipitation
      // See above comment in day about averaging
      // f.night.precipitation = (f.night.precipitation || 0) + forecast.precipitationProbability
      f.night.precipitation = Math.max(forecast.precipitationProbability, f.night.precipitation || 10)
    }
  })

  // Don't forget about the one we didn't complete
  if (dayCount > 0 || nightCount > 0) {
    // Post process forecast data
    // Day
    if (dayCount > 0) {
      f.day.temperatureAvg /= dayCount
      f.day.temperatureApparentAvg /= dayCount
      f.day.windDirection /= dayCount
      // f.day.precipitation /= dayCount
    }
    // Night
    if (nightCount > 0) {
      f.night.temperatureAvg /= nightCount
      f.night.temperatureApparentAvg /= nightCount
      f.night.windDirection /= nightCount
      // f.night.precipitation /= dayCount
    }

    forecasts.push(f)
  }

  return forecasts
}

async function fetchForecast(zipcode) {
  let apiUrl = `https://api.tomorrow.io/v4/weather/forecast?location=${zipcode}%20US&units=imperial&timesteps=1h&apikey=${API_KEY_TOMORROW_IO}`
  let response = await get(apiUrl)
  return processForecastData(response.data.timelines.hourly)
}

// Set the date picker to tomorrow's date
function setDatePickerDefault() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  document.getElementById('datepicker').value = tomorrow.toLocaleDateString('en-US')
}

// Use Date to convert 24 hour time to 12 hour time
function convertTo12HourFormat(time24) {
  const [hours, minutes] = time24.split(':');
  let date = new Date(null, null, null, hours, minutes)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  })
}

function run_main(weatherData) {
  var data = JSON.stringify(weatherData)
  csInterface.evalScript(`$._MYFUNCTIONS.run(${data})`)
}
