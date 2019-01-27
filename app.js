import Feed from 'rss-to-json'
import { alertOnSlack } from './alertOnSlack'
import { extractNumberFromTemperature } from './extractNumberFromTemperature'
import { WEATHER_API, CHANNEL } from './settings.json'

Feed.load(WEATHER_API, (err, rss) => {
  if (err) {
    console.log(err)
    return 0
  }

  // Get values for tomorrow's forecast
  const { title, link, description, created } = rss.items[1]

  // Prepare value for the Slack message: Forecast, Min Temp & Max Temp
  const [maxTemp, minTemp, ...rest] = description.split(',').map(el => el.trim())

  const forecast = title
    .split(',')[0]
    .split(':')[1]
    .trim()

  const weatherValues = [`Forecast: ${forecast}`, minTemp, maxTemp]

  // Get max and min temperatures
  const maxTempNumber = extractNumberFromTemperature(maxTemp)
  const minTempNumber = extractNumberFromTemperature(minTemp)

  // Create tomorrow's date and give it some format
  const forecastDate = new Date()
  forecastDate.setDate(forecastDate.getDate() + 1)
  const forecastDateString = forecastDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    month: 'long',
    year: 'numeric',
    day: 'numeric',
  })

  // Set default values
  let icon = ':partly_sunny:'
  let botName = 'Weather Bot'
  let message = `:calendar: ${forecastDateString}`
  let sideLine = ''

  // Ice warning condition: minTemp <= 0 C
  if (minTempNumber <= 0) {
    icon = ':snowflake:'
    botName = `${botName}: Ice Age`
    message = `${message}\n${icon} *Be careful, there could be ice on the road!* ${icon}`
    sideLine = '#1e90ff'
  }

  // Dress-down condition: maxTemp >= 25 C
  if (maxTempNumber >= 25) {
    icon = ':fire:'
    botName = `${botName}: 2 Hot 2 Furious`
    message = `${message}\n${icon} *It's dress-down tomorrow!* ${icon}`
    sideLine = '#ff4500'
  }

  // Build Slack message
  const messageBody = {
    // as_user: false,
    channel: CHANNEL,
    icon_emoji: icon,
    username: botName,
    text: message,
    attachments: [
      {
        fallback: description,
        color: sideLine,
        title: rss.title,
        title_link: link,
        // Attach Forecast, Maximum Temperature & Minimum Temperature
        fields: weatherValues.map((val, index) => {
          const [title, ...value] = val.split(':')
          return {
            title,
            value: value.join(':'),
            short: index !== 0,
          }
        }),
        footer: 'BBC Weather',
        footer_icon:
          'https://m.files.bbci.co.uk/modules/bbc-morph-wr-page-metadata/1.1.4/apple-touch-icon.png',
        ts: Math.round(created / 1000),
      },
    ],
  }

  // Send message to Slack
  alertOnSlack(messageBody)
})
