var csInterface = new CSInterface();
// var csInterface = null
const axios = require('axios')
setTomorrow()


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
    isRunning = true;
    getInfoAndRun()
  }
})



function getInfoAndRun() {
  let arr
  csInterface.evalScript(`$._MYFUNCTIONS.getFilesInfo()`, async function(cb) {
    arr = JSON.parse(cb)
    if (!arr) {
      isRunning = false
      alert('Please open psd files with templates')
      return
    }

    const params = await getParams(arr)
    // alert(JSON.stringify(params))
    run_main(params)
    isRunning = false
  })
}

function processTideData(data) {
  let lowTide_top = null
  let lowTide_bot = null
  let lowTide_top_time = null
  let lowTide_bot_time = null

  let highTide_top = null
  let highTide_bot = null
  let highTide_top_time = null
  let highTide_bot_time = null

  for (const entry of data) {
    const currentNum = parseFloat(entry.v).toFixed(1)
    const timeString = entry.t.split(' ')[1]
    //low tide
    if (entry.type === 'L') {
      if (lowTide_top == null) {
        lowTide_top = currentNum
        lowTide_top_time = timeString;
      } else {

        if (lowTide_top <= currentNum) {
          lowTide_bot = currentNum
          lowTide_bot_time = timeString
        } else {
          lowTide_bot = lowTide_top
          lowTide_top = currentNum
          lowTide_bot_time = lowTide_top_time
          lowTide_top_time = timeString
        }

      }
    }

    //high tide
    if (entry.type === 'H') {
      if (highTide_top == null) {
        highTide_top = currentNum
        highTide_top_time = timeString
      } else {

        if (highTide_top <= currentNum) {
          highTide_bot = currentNum
          highTide_bot_time = timeString
        } else {
          highTide_bot = highTide_top
          highTide_top = currentNum
          highTide_bot_time = highTide_top_time
          highTide_top_time = timeString
        }

      }
    }
  }
  const lowtide_top_string = `${lowTide_top} ft @ ${convertTo12HourFormat(lowTide_top_time)}`
  const lowtide_bot_string = lowTide_bot ? `${lowTide_bot} ft @ ${convertTo12HourFormat(lowTide_bot_time)}` : ''
  const hightide_top_string = `${highTide_top} ft @ ${convertTo12HourFormat(highTide_top_time)}`
  const hightide_bot_string = highTide_bot ? `${highTide_bot} ft @ ${convertTo12HourFormat(highTide_bot_time)}` : ''

  return {
    lowtide: {
      top: lowtide_top_string,
      bot: lowtide_bot_string,
    },
    hightide: {
      top: hightide_top_string,
      bot: hightide_bot_string,
    }
  };
}

async function getParams(arr) {
  const date = document.querySelector('#datepicker').value.replaceAll('-', '')
  const dataPromises = arr.map(async function(docInfo) {
    const psdFileLocations = parameters.area[docInfo.fileName]
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
    const response = await axios.get(apiUrl, { params });
    const predictions = response.data.predictions;
    return processTideData(predictions)
    // Process the data as needed
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

function setTomorrow() {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const year = tomorrow.getFullYear();
  const month = (tomorrow.getMonth() + 1).toString().padStart(2, '0');
  const day = tomorrow.getDate().toString().padStart(2, '0');

  const tomorrowFormatted = `${year}-${month}-${day}`;
  document.getElementById('datepicker').value = tomorrowFormatted;

}

function convertTo12HourFormat(time24) {
  const [hours, minutes] = time24.split(':');
  let period = 'AM';

  let hours12 = parseInt(hours, 10);
  if (hours12 >= 12) {
    period = 'PM';
    if (hours12 > 12) {
      hours12 -= 12;
    }
  }

  if (hours12 === 0) {
    hours12 = 12;
  }

  return `${hours12}:${minutes} ${period}`;
}

function run_main(params) {
  var data = JSON.stringify(params)
  csInterface.evalScript(`$._MYFUNCTIONS.run(${data})`, function(cb) {
  })
}

// const parameters = {}
// parameters.station = {
//   'Caspersen' : '8725809',
//   'Englewood' : '8725747',
//   'Siesta' : '8726034',
//   'Venice' : '8725889',
// }
