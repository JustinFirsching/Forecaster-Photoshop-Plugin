const axios = require('axios');

wow()

async function wow(){
  const parameters = {}
  parameters.area = {
    'englewood' : {
      locaiton1 : {
        name : 'Caspersen',
        station: '8725809'
      },
      locaiton2 : {
        name : 'Englewood',
        station: '8725747'
      },
    },
    'venice' : {
      locaiton1 : {
        name : 'Venice',
        station: '8725889'
      },
      locaiton2 : {
        name : 'Siesta',
        station: '8726034'
      }
    }
  }
  const psdFileLocations = parameters.area['englewood'] 
  const loc1 = await fetchData(psdFileLocations.locaiton1.station, '20230823')
  const loc2 = await fetchData(psdFileLocations.locaiton2.station, '20230823')
  const a1 = processTideData(loc1.predictions)
  const a2 = processTideData(loc2.predictions)
  var a = 1
  
}

async function fetchData(station, date) {
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
    const data = response.data;
    console.log(JSON.stringify(data));
    return data
    // Process the data as needed
  } catch (error) {
    console.error('Error fetching data:', error);
  }
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
      if(lowTide_top == null) {
        lowTide_top = currentNum
        lowTide_top_time = timeString;
      } else {

        if(lowTide_top <= currentNum) {
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
      if(highTide_top == null) {
        highTide_top = currentNum
        highTide_top_time = timeString
      } else {

        if(highTide_top <= currentNum) {
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
    
    // const lowtide_bot_string = `${lowTide_bot ? lowTide_bot : '--'} ft @ ${lowTide_bot_time ? convertTo12HourFormat(lowTide_bot_time) : '--:--'}`
  }
  const lowtide_top_string = `${lowTide_top} ft @ ${convertTo12HourFormat(lowTide_top_time)}`
  const lowtide_bot_string = lowTide_bot ? `${lowTide_bot} ft @ ${convertTo12HourFormat(lowTide_bot_time)}` : ''
  const hightide_top_string = `${highTide_top} ft @ ${convertTo12HourFormat(highTide_top_time)}`
  const hightide_bot_string = highTide_bot ? `${highTide_bot} ft @ ${convertTo12HourFormat(highTide_bot_time)}` : ''

  return {lowtide: {
    top: lowtide_top_string,
    bot: lowtide_bot_string,
  }, 
  hightide: {
    top: hightide_top_string,
    bot: hightide_bot_string,
  }
  };}


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