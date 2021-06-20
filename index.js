
require('dotenv').config()
const { format } = require('timeago.js')
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
const axios = require('axios');

(async () => {
  const currentTime = Math.floor(Date.now() / 1000)
  const sevenDays = 604800

  let data = null
  await axios.get(`https://history.openweathermap.org/data/2.5/history/city?lat=${process.env.LAT}&lon=${process.env.LON}&type=hour&start=${currentTime - sevenDays}&end=${currentTime}&appid=${process.env.API_KEY}`)
    .then(res => data = res.data)
    .catch(console.log)

  if (!data) return

  const rainDays = data.list.filter(day => !!day.rain)

  let totalRain = 0.0
  const extractedData = rainDays.map(day => {
    const epoch = new Date(1970, 0, 1) // epoch
    epoch.setSeconds(day.dt)
    if (day.rain['1h'] > 0) totalRain += day.rain['1h']
    return { timeAgo: format(epoch), date: epoch.toISOString(), rain: day.rain, day: epoch.getDay() }
  })

  console.log('extractedData', extractedData)

  const week = [0,1,2,3,4,5,6]
  const rainData = {
    '0': 0.0,
    '1': 0.0,
    '2': 0.0,
    '3': 0.0,
    '4': 0.0,
    '5': 0.0,
    '6': 0.0
  }


  extractedData.forEach(event => {
    for (const day in week) {
      if (week[day] === event.day) {
        rainData[week[day]] += event.rain['1h']
      }
    }
  })

  let body = 'it rained ' + String(totalRain) + ' inches this week'

  for (const key in rainData) {
    if (key === '0') body += `\nSunday it rained ${rainData[key]} inches`
    if (key === '1') body += `\nMonday it rained ${rainData[key]} inches`
    if (key === '2') body += `\nTuesday it rained ${rainData[key]} inches`
    if (key === '3') body += `\nWednesday it rained ${rainData[key]} inches`
    if (key === '4') body += `\nThursday it rained ${rainData[key]} inches`
    if (key === '5') body += `\nFriday it rained ${rainData[key]} inches`
    if (key === '6') body += `\nSaturday it rained ${rainData[key]} inches`
  }

  console.log('sending message\n' + body)

  client.messages
    .create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.MY_PHONE_NUMBER
    })
    .catch(err => console.log(err))
  
})()