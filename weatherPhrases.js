import phrases from './phrases/weatherPhrases'

function randomValueFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function weatherPhrases(type) {
  return randomValueFromArray(phrases[type])
}
