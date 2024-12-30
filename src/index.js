let isRunning = false
let forecastTypes = ['today', '5_day', 'uv_index']

// Set the date picker to tomorrow's date
function setDatePickerDefault() {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    document.getElementById('datepicker').value =
        tomorrow.toLocaleDateString('en-US')
}

// Set the API Keys
function setApiKeyDefaults() {
    document.getElementById('tomorrowIoApiKey').value =
        DEFAULT_API_KEY_TOMORROW_IO
    document.getElementById('visualCrossingApiKey').value =
        DEFAULT_API_KEY_VISUAL_CROSSING
}

// This sets the file info so the rest of the script knows what data to fetch
function getFileInfo() {
    var arr = []
    for (var i = 0; i < app.documents.length; i++) {
        let docName = app.documents[i].name.toLowerCase()
        if (docName.includes('englewood_beach_forecast')) {
            arr.push({ documentNum: i, area: 'englewood', type: 'tides' })
        } else if (docName.includes('venice_beach_forecast')) {
            arr.push({ documentNum: i, area: 'venice', type: 'tides' })
        } else if (docName.includes('today_tonight')) {
            arr.push({ documentNum: i, type: 'today' })
        } else if (docName.includes('5_day')) {
            arr.push({ documentNum: i, type: '5_day' })
        } else if (docName.includes('uv_index')) {
            arr.push({ documentNum: i, type: 'uv_index' })
        } else if (docName.includes('sunrise_sunset')) {
            arr.push({ documentNum: i, type: 'sunrise_sunset' })
        } else {
            console.log(`Not sure what this file is: ${app.documents[i].name}`)
        }
    }
    return arr
}

async function getWeatherData(arr) {
    const date = document.querySelector('#datepicker').value
    const zip = document.querySelector('#zipcode').value
    const lat = document.querySelector('#latitude').value
    const long = document.querySelector('#longitude').value

    let api_key_tomorrow_io = document.getElementById('tomorrowIoApiKey').value
    let api_key_visual_crossing = document.getElementById(
        'visualCrossingApiKey'
    ).value

    // Fetch the forecast once and just reuse as needed
    let forecaster =
        document.getElementById('forecaster').value || 'Visual Crossing'
    console.log(`Working with forecaster ${forecaster}`)

    let forecast =
        forecaster.toLowerCase().trim() == 'tomorrowio'
            ? await fetchForecastTomorrowIO(zip, api_key_tomorrow_io)
            : await fetchForecastVisualCrossing(zip, api_key_visual_crossing)

    let dataPromises = arr.map(async function (docInfo) {
        let data = {}
        data.documentNum = parseInt(docInfo.documentNum)
        data.type = docInfo.type
        data.requestedDate = date

        if (docInfo.type === 'tides') {
            data.tideData = await fetchTideData(docInfo.area, date)
        } else if (forecastTypes.includes(docInfo.type)) {
            data.forecaster = forecaster
            data.forecast = forecast
        } else if (docInfo.type === 'sunrise_sunset') {
            data = { ...data, ...(await fetchSunriseSunset(lat, long, date)) }
        } else {
            console.error(`Unhandled doc type: ${docInfo.type}`)
        }
        return data
    })

    return await Promise.all(dataPromises)
}

// Fill the data into the PSD
function fillData(doc, data) {
    if (data == null) {
        app.showAlert('No data!')
        return
    }

    switch (data.type) {
        case 'tides':
            setTideData(doc, data)
            break
        case 'today':
            setTodayData(doc, data)
            break
        case '5_day':
            setFiveDayData(doc, data)
            break
        case 'uv_index':
            setUvIndexData(doc, data)
            break
        case 'sunrise_sunset':
            setSunriseSunsetData(doc, data)
            break
        default:
            console.error(`Unhandled data type: ${data.type}`)
    }
}

async function run() {
    let fileInfo = getFileInfo()
    if (fileInfo.length == 0) {
        app.showAlert('Please open psd files with templates')
        return
    }

    const weatherData = await getWeatherData(fileInfo)
    console.log(weatherData)

    core.executeAsModal(() => {
        weatherData.forEach((data) => {
            var doc = app.documents[data.documentNum]
            console.log(`Working on ${doc.name}`)

            // Set the active document in Photoshop to the document we are working with
            app.activeDocument = doc
            try {
                fillData(doc, data)
                // TODO: Fix this. This is horrendous
                let name = `${doc.name.split('.')[0]}_${new Date(data.requestedDate).toDateString().replace('/', '-')}`
                saveDoc(doc, name)
            } catch (e) {
                console.error(e.stack)
            }
        })
    })
}

setDatePickerDefault()
setApiKeyDefaults()
document.getElementById('submit').addEventListener('click', async () => {
    if (!isRunning) {
        isRunning = true
        try {
            await run()
        } catch (e) {
            console.log(e.stack)
            app.showAlert(e.stack)
        } finally {
            isRunning = false
        }
    }
})
