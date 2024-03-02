import { get } from 'axios';

var csInterface = new CSInterface();
setDatePickerDefault()

let isRunning = false
const parameters = {}
parameters.area = {
  'englewood': {
    location1: {
      name: 'Caspersen',
      station: '8725809'
    },
    location2: {
      name: 'Englewood',
      station: '8725747'
    },
  },
  'venice': {
    location1: {
      name: 'Venice',
      station: '8725889'
    },
    location2: {
      name: 'Siesta',
      station: '8726034'
    }
  }
}

document.querySelector('.runMain').addEventListener('click', () => {
  if(!isRunning) {
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

    const params = await getParams(fileInfo)
    run_main(params)
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

async function getParams(arr) {
  const date = document.querySelector('#datepicker').value
  const dataPromises = arr.map(async function(docInfo) {
    const psdFileLocations = parameters.area[docInfo.area]
    const tide1 = await fetchTideData(psdFileLocations.location1.station, date)
    const tide2 = await fetchTideData(psdFileLocations.location2.station, date)
    return {
      documentNum: docInfo.documentNum,
      date: `_${date.substring(4, 6)}_${date.substring(6, 8)}`,
      location1: tide1,
      location2: tide2
    }
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

function run_main(params) {
  var data = JSON.stringify(params)
  csInterface.evalScript(`$._MYFUNCTIONS.run(${data})`)
}
