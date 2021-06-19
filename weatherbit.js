require('dotenv').config()
const { format } = require('timeago.js')
const moment = require('moment')
const axios = require('axios');

// start_date = YYYY-MM-DD
// end_date = YYYY-MM-DD
// units=I // imperial

// temp = average temperature
// max_temp = max temperature
// max_temp_ts = Time of daily maximum temperature UTC (Unix Timestamp)
// min_temp = min temperature
// precip =  Accumulated precipitation
// precip_gpm = Accumulated precipitation [satellite/radar estimated]

(async () => {
  const units = 'I' // defaults to M, for metric

  const end = moment().format().split('T')[0]
  const start = moment().subtract(7, 'days').format().split('T')[0]
  
  console.log('start', start)
  console.log('end', end)

  let data = null
  await axios.get(`https://api.weatherbit.io/v2.0/history/daily?lat=${process.env.LAT}&lon=${process.env.LON}&start_date=${start}&units=${units}&end_date=${end}&key=${process.env.KEY}`)
    .then(res => data = res.data)
    .catch(err => console.log(err))

  if (!data) return

  data.data[0]
  console.log('average temperature', data.data[0].temp, 'degrees Fahrenheit')
  console.log('max temperature', data.data[0].max_temp)
  console.log('max temperature time', new Date(data.data[0].max_temp_ts).toLocaleTimeString('en-US'))
  console.log('min temperature', data.data[0].min_temp)
  console.log('Accumulated precipitation', data.data[0].precip, 'in')
  console.log('Accumulated precipitation [satellite/radar estimated]', data.data[0].precip_gpm, 'in')
  
})()