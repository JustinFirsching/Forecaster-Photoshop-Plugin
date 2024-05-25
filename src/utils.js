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
  let dirname = File(doc.path.absoluteURI).parent.fsName

  let jpegSaveOptions = {
    emdedColorProfile: true,
    quality: 12
  }

  let psdSaveOptions = {
    alphaChannels: true,
    annotations: true,
    embedColorProfile: true,
    layers: true,
    spotColors: true
  }

    // Save all the file formats
    (
      ("jpg", jpegSaveOptions),
      ("png", {}),
      ("psd", psdSaveOptions)
    ).forEach((ext, saveOptions) => {
      let targetFile = File(path.join(dirname, `${basename}.${ext}`))
      doc.saveAs(targetFile, saveOptions, true)
    })
}

function warn(...msg) {
  console.warn(msg)
  alert(msg)
}

function error(...msg) {
  console.error(msg)
  alert(msg)
}
