function getWindSpeedText(averageSpeed) {
  console.log(`[DEBUG] The average speed is ${averageSpeed}`)

  var windSpeedText = "Unknown"
  if (averageSpeed < 5) {
    windSpeedText = "Light"
  } else if (averageSpeed < 10) {
    windSpeedText = "5 - 10"
  } else if (averageSpeed < 15) {
    windSpeedText = "10 - 15"
  } else if (averageSpeed < 20) {
    windSpeedText = "15 - 20"
  } else if (averageSpeed < 25) {
    windSpeedText = "20 - 25"
  } else if (averageSpeed < 30) {
    windSpeedText = "25 - 30"
  } else if (averageSpeed < 35) {
    windSpeedText = "30 - 30"
  } else if (averageSpeed < 40) {
    windSpeedText = "35 - 40"
  } else if (averageSpeed < 45) {
    windSpeedText = "40 - 40"
  } else if (averageSpeed < 50) {
    windSpeedText = "45 - 50"
  } else {
    windSpeedText = "DANGER"
  }
  return windSpeedText
}

const getPrecipitationText = (precipitation) =>
  precipitation != null ?
    precipitation > 20 ? `${Math.round(precipitation / 5) * 5}%` : ""
    : "Unknown"

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
        f.day.windSpeedAvg /= dayCount
        f.day.windDirectionAvg /= dayCount
      }
      // Night
      if (nightCount > 0) {
        f.night.temperatureAvg /= nightCount
        f.night.temperatureApparentAvg /= nightCount
        f.night.windSpeedAvg /= nightCount
        f.night.windDirectionAvg /= nightCount
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
      f.day.temperatureApparentMax = Math.max(forecast.temperatureApparent, f.day.temperatureApparentMax || -999)

      // Wind
      f.day.windSpeedAvg = (f.day.windSpeedAvg || 0) + forecast.windSpeed
      f.day.windSpeedMin = Math.min(forecast.windSpeed, f.day.windSpeedMin || 999)
      f.day.windSpeedMax = Math.max(forecast.windSpeed, f.day.windSpeedMax || -999)
      f.day.windDirectionMin = Math.min(forecast.windDirection, (f.day.windDirectionMin || 999))
      f.day.windDirectionMax = Math.max(forecast.windDirection, (f.day.windDirectionMax || -999))
      f.day.windDirectionAvg = (f.day.windDirection || 0) + forecast.windDirection

      // Precipitation
      // Averaging doesn't work well, it leads to a lot of 0% hours pulling the chance way down.
      // For example, 100% chance of rain 2-4 PM and 0% chance of rain the rest of the day would average to 16%.
      // f.day.precipitation = (f.day.precipitation || 0) + forecast.precipitationProbability
      f.day.precipitation = Math.max(forecast.precipitationProbability, f.day.precipitation || 10)

      // UV Index
      f.day.uvIndex = Math.max(forecast.uvIndex, f.day.uvIndex || 1)
    } else {
      nightCount++

      // Temperature
      f.night.temperatureAvg = (f.night.temperature || 0) + forecast.temperature
      f.night.temperatureApparentAvg = (f.night.temperatureApparent || 0) + forecast.temperatureApparent
      f.night.temperatureMin = Math.min(forecast.temperature, f.night.temperatureMin || 999)
      f.night.temperatureMax = Math.max(forecast.temperature, f.night.temperatureMax || -999)
      f.night.temperatureApparentMax = Math.max(forecast.temperatureApparent, f.night.temperatureApparentMax || -999)

      // Wind
      f.night.windSpeedAvg = (f.night.windSpeedAvg || 0) + forecast.windSpeed
      f.night.windSpeedMin = Math.min(forecast.windSpeed, f.night.windSpeedMin || 999)
      f.night.windSpeedMax = Math.max(forecast.windSpeed, f.night.windSpeedMax || -999)
      f.night.windDirectionMin = Math.min(forecast.windDirection, (f.night.windDirectionMin || 999))
      f.night.windDirectionMax = Math.max(forecast.windDirection, (f.night.windDirectionMax || -999))
      f.night.windDirectionAvg = (f.night.windDirection || 0) + forecast.windDirection

      // Precipitation
      // See above comment in day about averaging
      // f.night.precipitation = (f.night.precipitation || 0) + forecast.precipitationProbability
      f.night.precipitation = Math.max(forecast.precipitationProbability, f.night.precipitation || 10)

      // UV Index
      f.night.uvIndex = Math.max(forecast.uvIndex, f.night.uvIndex || 1)
    }
  })

  // Don't forget about the one we didn't complete
  if (dayCount > 0 || nightCount > 0) {
    // Post process forecast data
    // Day
    if (dayCount > 0) {
      f.day.temperatureAvg /= dayCount
      f.day.temperatureApparentAvg /= dayCount
      f.day.windSpeedAvg /= dayCount
      f.day.windDirectionAvg /= dayCount
    }
    // Night
    if (nightCount > 0) {
      f.night.temperatureAvg /= nightCount
      f.night.temperatureApparentAvg /= nightCount
      f.night.windSpeedAvg /= nightCount
      f.night.windDirectionAvg /= nightCount
    }

    forecasts.push(f)
  }

  return forecasts
}

async function fetchForecast(zipcode) {
  let apiUrl = `https://api.tomorrow.io/v4/weather/forecast?location=${zipcode}%20US&units=imperial&timesteps=1h&apikey=${API_KEY_TOMORROW_IO}`
  return await fetch(apiUrl)
    .then(response => response.json())
    .then(data => processForecastData(data.timelines.hourly))
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
    return new Date(item.date).toDateString() === new Date(data.requestedDate).toDateString()
  })[0]

  if (todayData == null) {
    console.error("No today data... skipping today forecast")
    return
  }

  let todayString = new Date(todayData.date).toLocaleDateString("en-US")
  doc.layers.getByName("upper").layers.getByName("Group 8").layers.getByName("upper").layers.getByName("1/28/2024").textItem.contents = todayString

  let dayData = todayData.day
  let nightData = todayData.night

  // Root layer groups
  let tdTnLayers = doc.layers.getByName('td tn')
  let dayLayers = tdTnLayers.layers.getByName('day')
  let nightLayers = tdTnLayers.layers.getByName('night')

  // Today temp
  let tdTemps = dayLayers.layers.getByName('temps')
  // Actual
  tdTemps.layers.getByName('temp day').layers.getByName('70').textItem.contents = `${Math.round(dayData.temperatureMax)}`
  // Feels Like
  tdTemps.layers.getByName('feels like').layers.getByName('feels like 70').textItem.contents = `feels like ${Math.round(dayData.temperatureApparentMax)}`

  // Tonight temp
  nightLayers.layers.getByName('temp night').layers.getByName('53').textItem.contents = `${Math.round(nightData.temperatureMin)}`

  // Today precipitation
  dayLayers.layers.getByName('% chance').layers.getByName('50%').textItem.contents = getPrecipitationText(dayData.precipitation)

  // Tonight precipitation
  nightLayers.layers.getByName('% chance').layers.getByName('10%').textItem.contents = getPrecipitationText(nightData.precipitation)

  // Today wind
  let dayWindLayers = dayLayers.layers.getByName('wind')
  // Today wind speed
  let windSpeedDayText = getWindSpeedText(dayData.windSpeedAvg) || "Unknown"
  dayWindLayers.layers.getByName('15 - 25').textItem.contents = windSpeedDayText
  // Today wind direction
  // This one is kind of tricky since 355 and 5 are only 10 degrees from each other, but not mathematically.
  // To get around this we are going to compare >45 and < 315.
  let dayWindDirectionDiff = dayData.windDirectionMax - dayData.windDirectionMin
  let dayWindDirection = dayWindDirectionDiff > 45 && dayWindDirectionDiff < 315 ? "Variable" : degreesToDirection(dayData.windDirectionAvg)
  dayWindLayers.layers.getByName('WNW').textItem.contents = degreesToDirection(dayWindDirection)

  // Tonight wind
  let nightWindLayers = nightLayers.layers.getByName('wind')
  // Tonight wind speed
  let windSpeedNightText = getWindSpeedText(nightData.windSpeedAvg) || "Unknown"
  nightWindLayers.layers.getByName('10 - 20').textItem.contents = windSpeedNightText
  // Tonight wind direction
  // This one is kind of tricky since 355 and 5 are only 10 degrees from each other, but not mathematically.
  // To get around this we are going to compare >45 and < 315.
  let nightWindDirectionDiff = nightData.windDirectionMax - nightData.windDirectionMin
  let nightWindDirection = nightWindDirectionDiff > 45 && nightWindDirectionDiff < 315 ? "Variable" : degreesToDirection(nightData.windDirectionAvg)
  nightWindLayers.layers.getByName('NNW').textItem.contents = degreesToDirection(nightWindDirection)
}

function setFiveDayData(doc, data) {
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
      "tempHigh": "68",
      "tempLow": "53",
      "conditions": "Partly Cloudy",
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

  if (data.forecast == null || data.forecast.length == 0) {
    console.warn("No data to create 5 day forecast...")
    return
  }

  let validDate = new Date(data.forecast[0].date)
  validDate.setDate(validDate.getDate() - 1)

  let todayString = validDate.toLocaleDateString("en-US")
  doc.layers.getByName("upper").layers.getByName("Group 8").layers.getByName("upper").layers.getByName("1/28/2024").textItem.contents = todayString

  if (data.forecast.length < 5) {
    console.warn(`Not enough data for a full 5 day forecast... Doing what we can for a ${data.forecast.length} day forecast.`)
  }

  let fiveDayLayers = doc.layers.getByName('5d')
  // data.forecast.length should never be more than 5 but just in case the API changes or something
  let maxDays = Math.min(5, data.forecast.length)

  for (var i = 0; i < maxDays; i++) {
    let dayLayers = fiveDayLayers.layers.getByName(`d${i + 1}`)
    let layerGroup = dayLayers.layers.getByName("Group 1")

    let forecast = data.forecast[i]
    let dayData = forecast.day
    let nightData = forecast.night

    // Set day of week
    // Day of Week as 3 letter abbreviation
    let dayAbbrev = new Date(forecast.date).toDateString().substring(0, 3).toUpperCase()
    layerGroup.layers.getByName(layerNames[i].day).textItem.contents = dayAbbrev

    // Temp High
    let highTemp = Math.ceil(dayData.temperatureMax) || "ERR"
    layerGroup.layers.getByName(layerNames[i].tempHigh).textItem.contents = highTemp

    // Temp Low
    let lowTemp = Math.floor(nightData.temperatureMin) || "ERR"
    layerGroup.layers.getByName(layerNames[i].tempLow).textItem.contents = lowTemp

    // Precipitation
    let precipitation = dayData != null ? getPrecipitationText(dayData.precipitation) : ""
    dayLayers.layers.getByName("pop").layers.getByName(layerNames[i].precipitation).textItem.contents = precipitation

    // TODO: If possible, do the weather text prediction
    // let conditions = "Raining Iguanas"
    // dayLayers.layers.getByName(layerNames[i].conditions).textItem.contents = conditions
  }
}

function setUvIndexData(doc, data) {
  if (data.type != "uv_index") {
    console.log("Not the uv doc... skipping uv")
    return
  }

  if (data.forecast == null) {
    console.error("No forecast data... skipping uv")
    return
  }

  // Filter the data from data.forecast to the item that has a date element with today's date
  let todayData = data.forecast.filter(function(item) {
    return new Date(item.date).toDateString() === new Date(data.requestedDate).toDateString()
  })[0]

  if (todayData == null) {
    console.error("No today data... skipping uv")
    return
  }

  let todayString = new Date(todayData.date).toLocaleDateString("en-US")
  doc.layers.getByName("upper").layers.getByName("Group 8").layers.getByName("upper").layers.getByName("3/24/2024").textItem.contents = todayString

  let uv = Math.max(todayData.day.uvIndex || 0, todayData.night.uvIndex || 0)
  for (i = 1; i <= 10; i++) {
    let visible = i == uv
    doc.layers.getByName("uvi").layers.getByName(`${i}`).visible = visible
  }
}
