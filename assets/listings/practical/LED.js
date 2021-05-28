const ws281x = require('rpi-ws281x-native');

const R = 333
const G = 666
const B = 999

class LED {

  constructor(ledsCount = 60) {
    this.LEDS_DRIVER = ws281x;
    this.LEDS_ARRAY = new Uint32Array(ledsCount);
    this.LEDS_DRIVER.init(ledsCount);

    this.getColor = this.optionOne;
  }

  /**
   * 
   * @param {number[]} lights 
   * @param {number} newLight 
   * @returns {number[]}
   */
  shiftLights = (lights, newLight) => {
    const centerElement = Math.floor(lights.length / 2);

    let leftLights = [];
    for (let i = 0; i < centerElement - 1; i++) {
      leftLights.push(lights[i + 1]);
    }
    leftLights.push(newLight);

    const rightLights = [];
    for (let i = lights.length - 1; i > centerElement; i--) {
      rightLights.push(lights[i - 1]);
    }
    rightLights.push(newLight);

    return [...leftLights, ...rightLights.reverse()];
  }

  /**
   * 
   * @param {1} index number of the color processing option
   */
  changeOption = (index) => {
    switch (index) {
      case 1:
        this.getColor = this.optionOne;
        break;

      default:
        this.getColor = this.optionOne;
        break;
    }
  }

  /**
   * @param {{index: number, value: number}} max 
   * @description returns color according to the audio tempo
   */
  optionOne = (max) => {
    const { index, value } = max;
    let color = 0;
    if (index > 0) {

      const _R = (Math.abs((index - R)) % value)

      const _G = (Math.abs((index - G)) % value)

      const _B = (Math.abs((index - B)) % value)

      color = (_R << 16) | (_G << 8) | _B;
    };

    return color;
  }

  stop = () => this.LEDS_DRIVER.reset();

  /**
   * 
   * @param {{index: number, value: number}} maxValue 
   */
  render = (maxValue) => {
    const color = this.getColor(maxValue)
    // console.log({ maxValue })
    this.LEDS_ARRAY = this.shiftLights(this.LEDS_ARRAY, color);
    this.LEDS_DRIVER.render(this.LEDS_ARRAY)
  }

}

module.exports = LED;