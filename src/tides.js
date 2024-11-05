const parameters = {
  tideStations: {
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
}

function processTideData(data) {
  let lowTide = { top: null, bot: null, top_time: null, bot_time: null };
  let highTide = { top: null, bot: null, top_time: null, bot_time: null };

  if(data != undefined) {
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

async function fetchTideFromStation(station, date) {
  // Adjust date format for API
  date = date.replaceAll('-', '')

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

  return await fetch(`${apiUrl}?${new URLSearchParams(params)}`)
    .then(response => response.json())
    .then(data => processTideData(data.predictions))
}

async function fetchTideData(area, date) {
  let dateObj = new Date(date)
  let year = dateObj.getFullYear()

  // Thanks JavaScript...
  var month = dateObj.getMonth()
  month += 1
  if (month < 10) {
    month = `0${month}`
  }

  var day = dateObj.getDate()
  if (day < 10) {
    day = `0${day}`
  }

  let dateString = `${year}${month}${day}`
  let stations = parameters.tideStations[area]
  return {
    location1: await fetchTideFromStation(stations.location1, dateString),
    location2: await fetchTideFromStation(stations.location2, dateString),
  }
}

function setTideData(doc, data) {
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
    // Top data will always exist
    loc1Layers.getByName('low tide copy').layers.getByName('time text').layers.getByName('top').textItem.contents = data.tideData.location1.hightide.top
    loc1Layers.getByName('low tide').layers.getByName('time text').layers.getByName('top').textItem.contents = data.tideData.location1.lowtide.top

    // Bottom may not
    if (data.tideData.location1.hightide.bot) {
      loc1Layers.getByName('low tide copy').layers.getByName('time text').layers.getByName('bot').textItem.contents = data.tideData.location1.hightide.bot
    } else {
      loc1Layers.getByName('low tide copy').layers.getByName('time text').layers.getByName('bot').visible = false
    }

    if (data.tideData.location1.hightide.bot) {
      loc1Layers.getByName('low tide').layers.getByName('time text').layers.getByName('bot').textItem.contents = data.tideData.location1.lowtide.bot
    } else {
      loc1Layers.getByName('low tide').layers.getByName('time text').layers.getByName('bot').visible = false
    }
  }

  // If we have a second location layer and tide data
  if (doc.layers.getByName('location 2') != null && data.tideData.location2 != null) {
    var loc2Layers = doc.layers.getByName('location 2').layers
    // Top data will always exist
    loc2Layers.getByName('low tide copy').layers.getByName('time text').layers.getByName('top').textItem.contents = data.tideData.location2.hightide.top
    loc2Layers.getByName('low tide').layers.getByName('time text').layers.getByName('top').textItem.contents = data.tideData.location2.lowtide.top


    // Bottom may not
    if (data.tideData.location2.hightide.bot) {
      loc2Layers.getByName('low tide copy').layers.getByName('time text').layers.getByName('bot').textItem.contents = data.tideData.location2.hightide.bot
    } else {
      loc2Layers.getByName('low tide copy').layers.getByName('time text').layers.getByName('bot').visible = false
    }

    if (data.tideData.location2.lowtide.bot) {
      loc2Layers.getByName('low tide').layers.getByName('time text').layers.getByName('bot').textItem.contents = data.tideData.location2.lowtide.bot
    } else {
      loc2Layers.getByName('low tide').layers.getByName('time text').layers.getByName('bot').visible = false
    }
  }
}

