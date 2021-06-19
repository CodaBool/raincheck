
require('dotenv').config()
const { format } = require('timeago.js')
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
const axios = require('axios');

(async () => {
  const currentTime = Math.floor(Date.now() / 1000)
  const sevenDays = 604800

  let data = null
  await axios.get(`https://history.openweathermap.org/data/2.5/history/city?lat=${process.env.LAT}&lon=${process.env.LON}&type=hour&start=${currentTime - sevenDays}&end=${currentTime}&appid=${process.env.key1}`)
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
  console.log('it rained', totalRain, 'inches this week')

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

  for (const key in rainData) {
    if (key === '0') console.log('Sunday it rained', rainData[key], 'inches')
    if (key === '1') console.log('Monday it rained', rainData[key], 'inches')
    if (key === '2') console.log('Tuesday it rained', rainData[key], 'inches')
    if (key === '3') console.log('Wednesday it rained', rainData[key], 'inches')
    if (key === '4') console.log('Thursday it rained', rainData[key], 'inches')
    if (key === '5') console.log('Friday it rained', rainData[key], 'inches')
    if (key === '6') console.log('Saturday it rained', rainData[key], 'inches')
  }

  const body = 'it rained ' + String(totalRain) + ' inches this week'

  client.messages
    .create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: process.env.MY_PHONE_NUMBER
    })
    .catch(err => console.log(err))
  
})()