/* eslint-disable no-restricted-syntax, no-magic-numbers */





export default class AdvMath {
  static getBiasedRandom (min = 0, max = 100, bias = 0, degree = 75) {
    const rand = Math.floor(Math.random() * (max - min + 1)) + min

    // eslint-disable-next-line no-magic-numbers
    const influence = Math.floor(Math.random() * (101))
    const mix = Number(Math.exp((-(influence - 50) * (influence - 50)) / (2 * degree * degree)))

    return rand > bias
      ? rand + Math.floor(mix * (bias - rand))
      : rand - Math.floor(mix * (rand - bias))
  }

  // implements Fisher-Yates shuffle
  static shuffleArray (array) {
    const shuffledArray = [...array]

    for (let curIndex = array.length - 1; curIndex > 0; curIndex -= 1) {
      // Get random index between 0 and currentIndex.
      const randIndex = Math.floor(Math.random() * (curIndex + 1))
      // swap the current index with random index
      ;[shuffledArray[curIndex], shuffledArray[randIndex]] = [shuffledArray[randIndex], shuffledArray[curIndex]]
      // repeat til we're at 0.
    }

    return shuffledArray
  }
}
