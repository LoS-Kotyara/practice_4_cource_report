/*       Imports and constants      ***********************/


const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { spawn } = require('child_process');
const LED = new (require('./LED'))(60);

/**********************************************************/


/*       USB management       *****************************/

exec('pkill arecord -KILL', err => { return })

let micState = true; // false - unplugged
const micCommand = 'arecord -l'

/**
 * 
 * @param {string} command 
 * @returns boolean
 */
const execCommand = async (command) => {
  const { stderr } = await exec(command);

  return stderr === '' ? true : false;
}

const checkStates = async () => {
  try {
    micState = await execCommand(micCommand)
  } catch (error) {
    console.error(`exec error: ${error}`);
  }
}

checkStates()

/**********************************************************/


/*       Audio recording and processing       *************/

let arecordProcess = undefined,
  aplayProcess = undefined;

const signalProcessing = (data) => {
  // console.log('here')
  const signal = new Uint16Array(data);
  console.log({ signal });
  const tempMax = { index: -1, value: -1 };
  signal.forEach((el, index) => {
    if (el > tempMax.value) {
      tempMax.value = el;
      tempMax.index = index;
    }
  });

  if (tempMax.value < 130) {
    tempMax.value = 0;
    tempMax.index = -1;
  }

  if (tempMax.value > max.value) {
    max = tempMax
  }
}

const setProcesses = () => {

  if (micState && arecordProcess === undefined) {
    console.log('Launching arecord...')
    arecordProcess = spawn('arecord', ['-t', 'raw']);


    arecordProcess.stdout.on('data', (data) => {
      signalProcessing(data);/*  console.log(data) */
    }
    );

    console.log('arecord is launched!')
  }

  if (!micState && arecordProcess !== undefined) {
    arecordProcess.stdin.pause()

    arecordProcess.kill('SIGKILL');
    try {
      exec('pkill arecord -KILL', err => { return })
    }
    catch (err) {
      console.error(err)
    }

    arecordProcess = undefined;

    console.log('arecord is killed')
  }
}



setProcesses()

setInterval(async () => {
  await checkStates();
  setProcesses()
}, 100)

let max = { index: -1, value: -1 };



/**********************************************************/


/*       Temp functions      ******************************/

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
};

const getRandomColor = () => {
  const r = getRandomInt(0, 256).toString(16).padStart(2, 0);
  const g = getRandomInt(0, 256).toString(16).padStart(2, 0);
  const b = getRandomInt(0, 256).toString(16).padStart(2, 0);

  return '0x' + r + g + b;
};

/**********************************************************/


/*       Audio recording and processing       *************/

setInterval(function () {
  LED.render(max);
  max = { index: -1, value: -1 };
}, 1000 / 60);

/**********************************************************/


/*       Capture halt signal       ************************/

console.log('Press <ctrl>+C to exit.');

process.on('SIGINT', function () {
  LED.stop()
  process.nextTick(function () { process.exit(0); });
});

/**********************************************************/
