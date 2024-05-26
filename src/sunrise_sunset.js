async function fetchSunriseSunset(lat, long, requestedDate) {
  let date = new Date(requestedDate)
  // Get the next day's data so we can post early
  date.setDate(date.getDate() + 1)

  let dateString = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`
  let apiUrl = `https://api.sunrisesunset.io/json?lat=${lat}&lng=${long}&date=${dateString}`
  return await fetch(apiUrl)
    .then(response => response.json())
    .then(data => data.results)
}


function setSunriseSunsetData(doc, data) {
  if (data.type != "sunrise_sunset") {
    console.log("Not the sunrise/sunset doc... skipping sunrise/sunset")
    return
  }

  if (data.sunrise == null && data.sunset == null) {
    console.error("No sunrise or sunset data... skipping sunrise/sunset")
    return
  }

  let sunrise = new Date(`${data.date} ${data.sunrise || "00:00:00 AM"}`)
  let sunset = new Date(`${data.date} ${data.sunset || "00:00:00 AM"}`)

  let todayString = sunrise.toLocaleDateString("en-US")
  // TODO: Try to figure out why this is so big
  let dateTextItem = doc.layers.getByName("upper").layers.getByName("Group 8").layers.getByName("upper").layers.getByName("Valid 1/29/2024").textItem
  dateTextItem.contents = `Valid ${todayString}`
  dateTextItem.characterStyle.size = 75

  let rootLayer = doc.layers.getByName("panels")
  let sunriseString = sunrise.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true
  })
  rootLayer.layers.getByName("up").layers.getByName("7:17 AM").textItem.contents = sunriseString

  let sunsetString = sunset.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true
  })
  rootLayer.layers.getByName("down").layers.getByName("7:12 AM").textItem.contents = sunsetString
}
