export function extractNumberFromTemperature(temperatureString) {
  const temperature = temperatureString
    .split(':')[1]
    .trim()
    .split(' ')[0]
  return parseInt(temperature, 10)
}
