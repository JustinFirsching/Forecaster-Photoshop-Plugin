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

function degreesToDirection(degrees) {
  console.log(`[DEBUG] degrees: ${degrees}`)

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

// Save the file
function saveDoc(doc, basename) {
  // TODO: Maybe a file browser in the Index html to select the folder to save to?
  fs.getFileForSaving(`${basename}.jpg`)
    .then(target =>
      core.executeAsModal(() =>
        doc.saveAs.jpg(target, { quality: 12 }, true)
      )
    )
    .catch(e => console.error(e))
}

let FONT_SIZES = {
  apparent_temp: 6,
  condition: 8,
  date: 18,
  day: 24,
  high_temp: 28,
  low_temp: 20,
  precipitation: 6,
  today_precip: 10,
  today_temp: 28,
  wind_direction: 7,
  wind_speed: 10,
}

function getFontSize(doc, section) {
  return (doc.resolution / 72) * FONT_SIZES[section]
}
