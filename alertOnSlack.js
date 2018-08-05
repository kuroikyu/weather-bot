import log from 'fancy-log'
import request from 'request'
import { SLACK_WEBHOOK } from './settings.json'

export function alertOnSlack(messageBody) {
  const options = {
    uri: SLACK_WEBHOOK,
    method: 'POST',
    json: messageBody,
  }
  request(options, (error, response) => {
    if (!error && response.statusCode === 200) {
      log(`Message delivered to ${messageBody.channel} on Slack`)
    } else if (response.statusCode === 400) {
      log.error('400. Bad request.')
    } else {
      log.warn('HTTP Status', response.statusCode)
    }
  })
}
