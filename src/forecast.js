function getWindSpeedText(averageSpeed) {
    console.log(`[DEBUG] The average speed is ${averageSpeed}`)

    var windSpeedText = 'Unknown'
    if (averageSpeed < 5) {
        windSpeedText = 'Light'
    } else if (averageSpeed < 10) {
        windSpeedText = '5 - 10'
    } else if (averageSpeed < 15) {
        windSpeedText = '10 - 15'
    } else if (averageSpeed < 20) {
        windSpeedText = '15 - 20'
    } else if (averageSpeed < 25) {
        windSpeedText = '20 - 25'
    } else if (averageSpeed < 30) {
        windSpeedText = '25 - 30'
    } else if (averageSpeed < 35) {
        windSpeedText = '30 - 30'
    } else if (averageSpeed < 40) {
        windSpeedText = '35 - 40'
    } else if (averageSpeed < 45) {
        windSpeedText = '40 - 40'
    } else if (averageSpeed < 50) {
        windSpeedText = '45 - 50'
    } else {
        windSpeedText = 'DANGER'
    }
    return windSpeedText
}

const getPrecipitationText = (precipitation) =>
    precipitation != null
        ? precipitation >= 20
            ? `${Math.round(precipitation / 5) * 5}%`
            : '10%'
        : 'Unknown'

let visual_crossing_icon_mapping = {
    // Available Layers (from GIMP, so ignore the "#N"):
    // - Day
    //   - "Thunderstorm 2"
    //   - "Little Thunderstorm 2"
    //   - "Thunderstorm & Sun"
    //   - "Little Cloud"
    //   - "Cloud"
    //   - "Rain 2"
    //   - "Rain"
    //   - "Rain + Sun II"
    //   - "Fog"
    //   - "Sun 3"
    //   - "Rain + Sun"
    //   - "Sun & Clouds"
    //   - "Wind"
    // - Night
    //   - "Little Cloud Night"
    //   - "Cloud"
    //   - "Little Thunderstorm 2"
    //   - "Thunderstorm 2"
    //   - "Wind"
    //   - "Rain"
    //   - "Fog"
    //   - "Moon + Stars"
    //   - "Night + Stars"
    // - Five Day
    //   - "Mostly Sunny"  // This is empty...
    //   - "Little Cloud"
    //   - "Rain 2"
    //   - "Cloud"
    //   - "Thunderstorm & Sun"
    //   - "Sun & Clouds"
    //   - "Rain"
    //   - "Thunderstorm 2"
    //   - "Rain + Sun copy"
    //   - "Wind copy 2"
    //   - "Sun icon"
    snow: [], // If we somehow get a snow icon, just clear the icons
    'snow-showers-day': [], // If we somehow get a snow icon, just clear the icons
    'snow-showers-night': [], // If we somehow get a snow icon, just clear the icons
    'thunder-rain': ['Thunderstorm 2'],
    'thunder-showers-day': ['Thunderstorm 2'],
    'thunder-showers-night': ['Little Thunderstorm 2', 'Moon + Stars'],
    rain: ['Rain 2'],
    'showers-day': ['Rain + Sun', 'Moon + Stars'],
    'showers-night': ['Sun 3', 'Little Rain', 'Moon + Stars'],
    fog: ['Sun & Clouds', 'Fog'],
    wind: ['Sun & Clouds', 'Wind'],
    cloudy: ['Cloud'],
    'partly-cloudy-day': ['Sun 3', 'Moon + Stars', 'Sun icon', 'Little Cloud'],
    'partly-cloudy-night': ['Sun 3', 'Little Cloud Night', 'Moon + Stars'],
    'clear-day': ['Sun 3', 'Sun icon', 'Moon + Stars'],
    'clear-night': ['Sun 3', 'Sun icon', 'Moon + Stars'],
}

let psd_weather_icon_layer_names = [
    'Cloud',
    'Little Cloud',
    'Little Cloud Night',
    'Fog',
    'Moon + Stars',
    'Mostly Sunny', // This is empty...
    'Night + Stars',
    'Rain + Sun II',
    'Rain + Sun copy',
    'Rain + Sun',
    'Rain 2',
    'Rain',
    'Little Rain',
    'Sun & Clouds',
    'Sun 3',
    'Sun icon',
    'Thunderstorm & Sun',
    'Thunderstorm 2',
    'Little Thunderstorm 2',
    'Wind copy 2',
    'Wind',
]

let forecast_translations = {
    "Clear": "Sunny",
}

function map_conditions(condition, icon, cloudCov, precipProb) {
    fixed_conditions = null
    if(precipProb >= 20) {
        if(cloudCov >= 50) {
            fixed_conditions = "Showers & Partly Cloudy"
            fixed_icon = "showers-day"
        } else if (cloudCov >= 70) {
            fixed_conditions = "Rain Showers"
            fixed_icon = "rain"
        }
    }
    else if(condition == "Partially cloudy") {
        if (cloudCov >= 20 && cloudCov < 50) {
            fixed_conditions = "Mostly Sunny"
        } else {
            fixed_conditions = "Partly Cloudy"
        }
    }
    return {
        conditions: fixed_conditions ?? forecast_translations[condition] ?? condition,
        icon: fixed_icon ?? icon,
    }
}

function setText(textItem, text) {
    if (textItem === undefined) {
        console.error(`Text item is undefined. Unable to set text ${text}`)
        return
    }

    console.debug(`Setting ${textItem} text to ${text}`)
    textItem.contents = text
}

function setFontSize(textItem, doc, pt) {
    if (textItem === undefined) {
        console.warn(`Text item is undefined. Unable to set font size`)
        return
    }

    console.debug(`Setting ${textItem} size to ${pt}`)
    textItem.characterStyle.size = getFontSize(doc, pt)
}

function setVisibility(layer, visibility) {
    if (layer === undefined) {
        if (visibility) {
            console.warn(`Layer is undefined. Unable to set visibility.`)
        } else {
            // No-op. Setting something that doesn't exist to invisible
            console.debug(`Layer is undefined. Visibilty inherently false.`)
        }
        return
    }
    console.debug(`Setting ${layer} visibility to ${visibility}`)
    layer.visible = visibility
}

// Iterate through the elements of the `data` array
// Each element has a `time` property that is a string in the format "YYYY-MM-DDTHH:MM:SSZ"
// If the time is between 7 AM and 7 PM then save the `windGustAvg` value to f.dayGustAvg
// If the time is between 7 PM and 7 AM the day after, save `windGustAvg` value to f.nightGustAvg
// When we hit 7 AM the next day, push f to forecasts, and reset f to an empty object
// Return the forecasts array
function processForecastDataTomorrowIO(data) {
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

    data.forEach((forecast) => {
        const time = new Date(forecast.time)
        const hour = time.getHours()
        // This is ugly I know
        forecast = forecast.values

        if (hour === 7 && (dayCount > 0 || nightCount > 0)) {
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
                night: {},
            }
            dayCount = 0
            nightCount = 0
        }

        if (hour >= 7 && hour < 19) {
            dayCount++

            // Temperature
            f.day.temperatureAvg =
                (f.day.temperatureAvg || 0) + forecast.temperature
            f.day.temperatureApparentAvg =
                (f.day.temperatureApparent || 0) + forecast.temperatureApparent
            f.day.temperatureMin = Math.min(
                forecast.temperature,
                f.day.temperatureMin || 999
            )
            f.day.temperatureMax = Math.max(
                forecast.temperature,
                f.day.temperatureMax || -999
            )
            f.day.temperatureApparentMax = Math.max(
                forecast.temperatureApparent,
                f.day.temperatureApparentMax || -999
            )

            // Wind
            f.day.windSpeedAvg = (f.day.windSpeedAvg || 0) + forecast.windSpeed
            f.day.windSpeedMin = Math.min(
                forecast.windSpeed,
                f.day.windSpeedMin || 999
            )
            f.day.windSpeedMax = Math.max(
                forecast.windSpeed,
                f.day.windSpeedMax || -999
            )
            f.day.windDirectionMin = Math.min(
                forecast.windDirection,
                f.day.windDirectionMin || 999
            )
            f.day.windDirectionMax = Math.max(
                forecast.windDirection,
                f.day.windDirectionMax || -999
            )
            f.day.windDirectionAvg =
                (f.day.windDirectionAvg || 0) + forecast.windDirection

            // Precipitation
            // Averaging doesn't work well, it leads to a lot of 0% hours pulling the chance way down.
            // For example, 100% chance of rain 2-4 PM and 0% chance of rain the rest of the day would average to 16%.
            // f.day.precipitation = (f.day.precipitation || 0) + forecast.precipitationProbability
            f.day.precipitation = Math.max(
                forecast.precipitationProbability,
                f.day.precipitation || 10
            )

            // UV Index
            f.day.uvIndex = Math.max(forecast.uvIndex, f.day.uvIndex || 1)
        } else {
            nightCount++

            // Temperature
            f.night.temperatureAvg =
                (f.night.temperature || 0) + forecast.temperature
            f.night.temperatureApparentAvg =
                (f.night.temperatureApparent || 0) +
                forecast.temperatureApparent
            f.night.temperatureMin = Math.min(
                forecast.temperature,
                f.night.temperatureMin || 999
            )
            f.night.temperatureMax = Math.max(
                forecast.temperature,
                f.night.temperatureMax || -999
            )
            f.night.temperatureApparentMax = Math.max(
                forecast.temperatureApparent,
                f.night.temperatureApparentMax || -999
            )

            // Wind
            f.night.windSpeedAvg =
                (f.night.windSpeedAvg || 0) + forecast.windSpeed
            f.night.windSpeedMin = Math.min(
                forecast.windSpeed,
                f.night.windSpeedMin || 999
            )
            f.night.windSpeedMax = Math.max(
                forecast.windSpeed,
                f.night.windSpeedMax || -999
            )
            f.night.windDirectionMin = Math.min(
                forecast.windDirection,
                f.night.windDirectionMin || 999
            )
            f.night.windDirectionMax = Math.max(
                forecast.windDirection,
                f.night.windDirectionMax || -999
            )
            f.night.windDirectionAvg =
                (f.night.windDirectionAvg || 0) + forecast.windDirection

            // Precipitation
            // See above comment in day about averaging
            // f.night.precipitation = (f.night.precipitation || 0) + forecast.precipitationProbability
            f.night.precipitation = Math.max(
                forecast.precipitationProbability,
                f.night.precipitation || 10
            )

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

function processForecastDataVisualCrossing(data) {
    if (data.length == 0) {
        return []
    }

    let forecasts = []

    var dayCount = 0
    var nightCount = 0

    // Concatenate all of the hourly data points
    var found = false
    let hourlyDataPoints = data
        .flatMap((day) => day.hours)
        .filter((forecast) => {
            let thisDate = new Date(forecast.datetimeEpoch * 1000)
            if (thisDate.getHours() == 7) {
                found = true
            }
            return found
        })

    let cloudCover = data.reduce((acc, day) => {
        const dateKey = new Date(day.datetimeEpoch * 1000).getDate()
        acc[dateKey] = day.cloudcover
        return acc
    }, {})

    let precipProb = data.reduce((acc, day) => {
        const dateKey = new Date(day.datetimeEpoch * 1000).getDate()
        acc[dateKey] = day.precipitation
        return acc
    }, {})

    let conditions = data.reduce((acc, day) => {
        const dateKey = new Date(day.datetimeEpoch * 1000).getDate()
        acc[dateKey] = map_conditions(day.conditions, day.icons, cloudCover[dateKey], precipProb[dateKey])
        return acc
    }, {})
    console.log(conditions)

    let d1 = new Date(data[0].datetimeEpoch * 1000)
    let f = {
        date: d1.toLocaleDateString('en-US'),
        conditions: conditions[d1.getDate()].conditions || 'NOT FOUND',
        icon: conditions[d1.getDate()].icon,
        day: {},
        night: {},
    }

    hourlyDataPoints.forEach((forecast) => {
        const time = new Date(forecast.datetimeEpoch * 1000)
        const hour = time.getHours()

        if (hour === 7 && (dayCount > 0 || nightCount > 0)) {
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
                conditions: conditions[time.getDate()].conditions,
                icon: icons[time.getDate()].icon,
                day: {},
                night: {},
            }
            dayCount = 0
            nightCount = 0
        }

        if (hour >= 7 && hour < 19) {
            dayCount++

            // Temperature
            f.day.temperatureAvg = (f.day.temperature || 0) + forecast.temp
            f.day.temperatureApparentAvg =
                (f.day.temperatureApparent || 0) + forecast.feelslike
            f.day.temperatureMin = Math.min(
                forecast.temp,
                f.day.temperatureMin || 999
            )
            f.day.temperatureMax = Math.max(
                forecast.temp,
                f.day.temperatureMax || -999
            )
            f.day.temperatureApparentMax = Math.max(
                forecast.feelslike,
                f.day.temperatureApparentMax || -999
            )

            // Wind
            f.day.windSpeedAvg = (f.day.windSpeedAvg || 0) + forecast.windspeed
            f.day.windSpeedMin = Math.min(
                forecast.windspeed,
                f.day.windSpeedMin || 999
            )
            f.day.windSpeedMax = Math.max(
                forecast.windspeed,
                f.day.windSpeedMax || -999
            )
            f.day.windDirectionMin = Math.min(
                forecast.winddir,
                f.day.windDirectionMin || 999
            )
            f.day.windDirectionMax = Math.max(
                forecast.winddir,
                f.day.windDirectionMax || -999
            )
            f.day.windDirectionAvg =
                (f.day.windDirectionAvg || 0) + forecast.winddir

            // Precipitation
            // Averaging doesn't work well, it leads to a lot of 0% hours pulling the chance way down.
            // For example, 100% chance of rain 2-4 PM and 0% chance of rain the rest of the day would average to 16%.
            // f.day.precipitation = (f.day.precipitation || 0) + forecast.precipitationProbability
            f.day.precipitation = Math.max(
                forecast.precipprob,
                f.day.precipitation || 10
            )

            // UV Index
            f.day.uvIndex = Math.max(forecast.uvindex, f.day.uvIndex || 1)
        } else {
            nightCount++

            // Temperature
            f.night.temperatureAvg = (f.night.temperature || 0) + forecast.temp
            f.night.temperatureApparentAvg =
                (f.night.temperatureApparent || 0) + forecast.feelslike
            f.night.temperatureMin = Math.min(
                forecast.temp,
                f.night.temperatureMin || 999
            )
            f.night.temperatureMax = Math.max(
                forecast.temp,
                f.night.temperatureMax || -999
            )
            f.night.temperatureApparentMax = Math.max(
                forecast.feelslike,
                f.night.temperatureApparentMax || -999
            )

            // Wind
            f.night.windSpeedAvg =
                (f.night.windSpeedAvg || 0) + forecast.windspeed
            f.night.windSpeedMin = Math.min(
                forecast.windspeed,
                f.night.windSpeedMin || 999
            )
            f.night.windSpeedMax = Math.max(
                forecast.windspeed,
                f.night.windSpeedMax || -999
            )
            f.night.windDirectionMin = Math.min(
                forecast.winddir,
                f.night.windDirectionMin || 999
            )
            f.night.windDirectionMax = Math.max(
                forecast.winddir,
                f.night.windDirectionMax || -999
            )
            f.night.windDirectionAvg =
                (f.night.windDirectionAvg || 0) + forecast.winddir

            // Precipitation
            // See above comment in day about averaging
            // f.night.precipitation = (f.night.precipitation || 0) + forecast.precipitationProbability
            f.night.precipitation = Math.max(
                forecast.precipprob,
                f.night.precipitation || 10
            )

            // UV Index
            f.night.uvIndex = Math.max(forecast.uvindex, f.night.uvIndex || 1)
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

async function fetchForecastTomorrowIO(zipcode, apiKey) {
    let apiUrl = `https://api.tomorrow.io/v4/weather/forecast?location=${zipcode}%20US&units=imperial&timesteps=1h&apikey=${apiKey}`
    return await fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
            console.log(data)
            return processForecastDataTomorrowIO(data.timelines.hourly)
        })
}

async function fetchForecastVisualCrossing(zipcode, apiKey) {
    let apiUrl = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${zipcode}?unitGroup=us&include=days,hours&key=${apiKey}&iconSet=icons2`
    return await fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
            console.log(data)
            return processForecastDataVisualCrossing(data.days)
        })
}

function setTodayData(doc, data) {
    if (data.type != 'today') {
        console.log(
            'Not the today/tonight doc... skipping today/tonight forecast'
        )
        return
    }

    if (data.forecast == null) {
        console.error('No forecast data... skipping today/tonight forecast')
        return
    }

    // Break into today and tonight data
    // Filter the data from data.forecast to the item that has a date element with today's date
    let todayData = data.forecast.filter(function (item) {
        return (
            new Date(item.date).toDateString() ===
            new Date(data.requestedDate).toDateString()
        )
    })[0]

    if (todayData == null) {
        console.error('No today data... skipping today forecast')
        return
    }

    let todayString = new Date(todayData.date).toLocaleDateString('en-US')
    let dateTextItem = doc.layers
        .getByName('upper')
        .layers.getByName('Group 8')
        .layers.getByName('upper')
        .layers.getByName('1/28/2024').textItem
    setText(dateTextItem.contents, todayString)
    setFontSize(dateTextItem, doc, FONT_SIZES.date)

    let dayData = todayData.day
    let nightData = todayData.night

    // Root layer groups
    let tdTnLayers = doc.layers.getByName('td tn')
    let dayLayers = tdTnLayers.layers.getByName('day')
    let nightLayers = tdTnLayers.layers.getByName('night')

    // Today temp
    let tdTemps = dayLayers.layers.getByName('temps')
    // Actual
    let highTempOffset = +document.getElementById('highTempModifier').value
    let highTempTextItem = tdTemps.layers
        .getByName('temp day')
        .layers.getByName('70').textItem
    setText(highTempTextItem.contents, `${Math.round(dayData.temperatureMax) + highTempOffset}`)
    setFontSize(highTempTextItem, doc, FONT_SIZES.today_temp)

    // Feels Like
    let apparentTempOffset = +document.getElementById('apparentTempModifier')
        .value
    let feelsLikeTempTextItem = tdTemps.layers
        .getByName('feels like')
        .layers.getByName('feels like 70').textItem
    setText(feelsLikeTempTextItem.contents, `feels like ${Math.round(dayData.temperatureApparentMax) + apparentTempOffset}`)
    setFontSize(feelsLikeTempTextItem, doc, FONT_SIZES.apparent_temp)

    // Tonight temp
    let lowTempOffset = +document.getElementById('lowTempModifier').value
    let lowTempTextItem = nightLayers.layers
        .getByName('temp night')
        .layers.getByName('53').textItem
    setText(lowTempTextItem.contents, `${Math.round(nightData.temperatureMin) + lowTempOffset}`)
    setFontSize(lowTempTextItem, doc, FONT_SIZES.today_temp)

    // Today precipitation
    let dayPrecipitationTextItem = dayLayers.layers
        .getByName('% chance')
        .layers.getByName('50%').textItem
    setText(dayPrecipitationTextItem.contents, getPrecipitationText(dayData.precipitation))
    setFontSize(dayPrecipitationTextItem,  doc, FONT_SIZES.today_precip)

    // Tonight precipitation
    let nightPrecipitationTextItem = nightLayers.layers
        .getByName('% chance')
        .layers.getByName('10%').textItem
    setText(nightPrecipitationTextItem.contents, getPrecipitationText(nightData.precipitation))
    setFontSize(nightPrecipitationTextItem,  doc, FONT_SIZES.today_precip)

    // Today wind
    let dayWindLayers = dayLayers.layers.getByName('wind')

    // Today wind speed
    let windSpeedDayText = getWindSpeedText(dayData.windSpeedAvg) || 'Unknown'
    let dayWindSpeedTextItem =
        dayWindLayers.layers.getByName('15 - 25').textItem
    setText(dayWindSpeedTextItem.contents, windSpeedDayText)
    setFontSize(dayWindSpeedTextItem, doc, FONT_SIZES.wind_speed)

    // Today wind direction
    // This one is kind of tricky since 355 and 5 are only 10 degrees from each other, but not mathematically.
    // To get around this we are going to compare >45 and < 315.
    let dayWindDirectionDiff =
        dayData.windDirectionMax - dayData.windDirectionMin
    let windDirectionTextItem = dayWindLayers.layers.getByName('WNW').textItem
    let dayWindText = dayWindDirectionDiff > 45 && dayWindDirectionDiff < 315
            ? 'Variable'
            : degreesToDirection(dayData.windDirectionAvg)
    setText(windDirectionTextItem.contents, dayWindText)
    setFontSize(windDirectionTextItem, doc, FONT_SIZES.wind_direction)

    // Tonight wind
    let nightWindLayers = nightLayers.layers.getByName('wind')

    // Tonight wind speed
    let windSpeedNightText =
        getWindSpeedText(nightData.windSpeedAvg) || 'Unknown'
    let nightWindSpeedTextItem =
        nightWindLayers.layers.getByName('10 - 20').textItem
    setText(nightWindSpeedTextItem.contents, windSpeedNightText)
    setFontSize(nightWindSpeedTextItem, doc, FONT_SIZES.wind_speed)

    // Tonight wind direction
    // This one is kind of tricky since 355 and 5 are only 10 degrees from each other, but not mathematically.
    // To get around this we are going to compare >45 and < 315.
    let nightWindDirectionDiff =
        nightData.windDirectionMax - nightData.windDirectionMin
    let nightWindDirectionTextItem =
        nightWindLayers.layers.getByName('NNW').textItem
    let nightWindText = nightWindDirectionDiff > 45 && nightWindDirectionDiff < 315
            ? 'Variable'
            : degreesToDirection(nightData.windDirectionAvg)
    setText(nightWindDirectionTextItem, nightWindText)
    setFontSize(nightWindDirectionTextItem, doc, FONT_SIZES.wind_direction)

    let wanted_icons = visual_crossing_icon_mapping[todayData.icon] || []
    console.log(`Received Icon: ${todayData.icon}`)
    console.log(`Wanted Icons: ${wanted_icons}`)
    // Iterate all of the icons and set them to visible if we want them and not
    // visible if we don't want them
    for (let curr = 0; curr < psd_weather_icon_layer_names.length; curr++) {
        let icon = psd_weather_icon_layer_names[curr]

        // Day
        let layer = dayLayers.layers.getByName(icon)
        if (layer != null) {
            setVisibility(layer, wanted_icons.includes(icon))
        }

        // Night
        layer = nightLayers.layers.getByName(icon)
        if (layer != null) {
            setVisibility(layer, wanted_icons.includes(icon))
        }
    }
}

function setFiveDayData(doc, data) {
    if (data.type != '5_day') {
        console.log('Not the 5 day doc... skipping 5 day forecast')
        return
    }

    if (data.forecast == null) {
        console.error('No forecast data... skipping 5 day forecast')
        return
    }

    const layerNames = [
        // Day 1
        {
            day: 'MON',
            tempHigh: '60',
            tempLow: '48',
            conditions: 'Mostly Sunny',
            precipitation: '40%',
        },
        // Day 2
        {
            day: 'TUE',
            tempHigh: '64',
            tempLow: '52',
            conditions: 'Mostly Sunny',
            precipitation: '20%',
        },
        // Day 3
        {
            day: 'WED',
            tempHigh: '68',
            tempLow: '53',
            conditions: 'Partly Sunny',
            precipitation: '20%',
        },
        // Day 4
        {
            day: 'THU',
            tempHigh: '68',
            tempLow: '53',
            conditions: 'Partly Cloudy',
            precipitation: '20%',
        },
        // Day 5
        {
            day: 'FRI',
            tempHigh: '70',
            tempLow: '54',
            conditions: 'Partly Cloudy',
            precipitation: '20%',
        },
    ]

    // Filter the data to only forecasts with a date greater than the requested date
    data.forecast = data.forecast.filter(function (item) {
        return new Date(item.date) > new Date(data.requestedDate)
    })

    if (data.forecast == null || data.forecast.length == 0) {
        console.warn('No data to create 5 day forecast...')
        return
    }

    let validDate = new Date(data.forecast[0].date)
    validDate.setDate(validDate.getDate() - 1)

    let todayString = validDate.toLocaleDateString('en-US')
    let dateTextItem = doc.layers
        .getByName('upper')
        .layers.getByName('Group 8')
        .layers.getByName('upper')
        .layers.getByName('1/28/2024').textItem
    setText(dateTextItem, todayString)
    setFontSize(dateTextItem, doc, FONT_SIZES.date)

    if (data.forecast.length < 5) {
        console.warn(
            `Not enough data for a full 5 day forecast... Doing what we can for a ${data.forecast.length} day forecast.`
        )
    }

    let fiveDayLayers = doc.layers.getByName('5d')
    // data.forecast.length should never be more than 5 but just in case the API changes or something
    let maxDays = Math.min(5, data.forecast.length)

    for (var i = 0; i < maxDays; i++) {
        let dayLayers = fiveDayLayers.layers.getByName(`d${i + 1}`)
        let layerGroup = dayLayers.layers.getByName('Group 1')

        let forecast = data.forecast[i]
        let dayData = forecast.day
        let nightData = forecast.night

        // Set day of week
        // Day of Week as 3 letter abbreviation
        let dayAbbrev = new Date(forecast.date)
            .toDateString()
            .substring(0, 3)
            .toUpperCase()
        let dayAbbrevTextItem = layerGroup.layers.getByName(
            layerNames[i].day
        ).textItem
        setText(dayAbbrevTextItem, dayAbbrev)
        setFontSize(dayAbbrevTextItem, doc, FONT_SIZES.day)

        // Temp High
        let highTempOffset = +document.getElementById('highTempModifier').value || 0
        let highTemp = Math.ceil(dayData.temperatureMax) + highTempOffset || 'ERR'

        let highTempTextItem = layerGroup.layers.getByName(
            layerNames[i].tempHigh
        ).textItem
        setText(highTempTextItem, highTemp)
        setFontSize(highTempTextItem, doc, FONT_SIZES.high_temp)

        // Temp Low
        let lowTempOffset = +document.getElementById('lowTempModifier').value || 0
        let lowTemp = Math.floor(nightData.temperatureMin) + lowTempOffset || 'ERR'
        let lowTempTextItem = layerGroup.layers.getByName(
            layerNames[i].tempLow
        ).textItem
        setText(lowTempTextItem, lowTemp)
        setFontSize(lowTempTextItem, doc, FONT_SIZES.low_temp)

        // Precipitation
        let precipitation =
            dayData != null ? getPrecipitationText(dayData.precipitation) : ''
        if (dayData.precipitation != null && dayData.precipitation >= 20) {
            dayLayers.getByName('pop').visible = true
        }
        let precipitationTextItem = dayLayers
            .getByName('pop')
            .layers.getByName(layerNames[i].precipitation).textItem
        setText(precipitationTextItem, precipitation)
        setFontSize(precipitationTextItem, doc, FONT_SIZES.precipitation)

        // Try to set the icons
        let wanted_icons = visual_crossing_icon_mapping[forecast.icon] || []
        console.log(`Received Icon: ${forecast.icon}`)
        console.log(`Wanted Icons: ${wanted_icons}`)

        for (let curr = 0; curr < psd_weather_icon_layer_names.length; curr++) {
            let icon = psd_weather_icon_layer_names[curr]
            let layer = dayLayers.layers.getByName(icon)
            if (layer != null) {
                setVisibility(layer, wanted_icons.includes(icon))
            }
        }

        // If possible, do the weather text prediction
        // Do this after icons incase of name overlap
        let conditionLayer = dayLayers.layers.getByName(layerNames[i].conditions)
        setText(conditionLayer, forecast.conditions)
        setVisibility(conditionLayer, true)
    }
}

function setUvIndexData(doc, data) {
    if (data.type != 'uv_index') {
        console.log('Not the uv doc... skipping uv')
        return
    }

    if (data.forecast == null) {
        console.error('No forecast data... skipping uv')
        return
    }

    // Filter the data from data.forecast to the item that has a date element with today's date
    let todayData = data.forecast.filter(function (item) {
        return (
            new Date(item.date).toDateString() ===
            new Date(data.requestedDate).toDateString()
        )
    })[0]

    if (todayData == null) {
        console.error('No today data... skipping uv')
        return
    }

    let todayString = new Date(todayData.date).toLocaleDateString('en-US')
    let dateTextItem = doc.layers
        .getByName('upper')
        .layers.getByName('Group 8')
        .layers.getByName('upper')
        .layers.getByName('3/24/2024').textItem
    setText(dateTextItem, todayString)
    setFontSize(dateTextItem, doc, FONT_SIZES.date)

    let uv = Math.max(todayData.day.uvIndex || 0, todayData.night.uvIndex || 0)
    for (i = 1; i <= 10; i++) {
        let visible = i == uv
        let uviLayer = doc.layers.getByName('uvi').layers.getByName(`${i}`)
        setVisibility(uviLayer, visible)
    }
}
