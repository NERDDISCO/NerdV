'use strict';

const FadeCandy = require('node-fadecandy');

let ws = require("nodejs-websocket");
let ndFC = new FadeCandy();
let isFadeCandyReady = false;

let port = 1337;

let config = {
  stripes : 8,
  led : 30,
  max_led : 64
}

function convertData(input, config) {
  let result = [];
  let fill = new Array((config.max_led - config.led) * 3);
  fill.fill(0);

  console.log('input: ', input.length);

  let tmp;
  let start_input = 0;
  let start_output = 0;

  console.log('fill:', fill.length);

  for (var i = 0; i < config.stripes; i++) {
    let end_input = ((i + 1) * config.led) * 3;


    console.log('from', start_input, 'to', end_input);
    tmp = input.slice(start_input, end_input);

    result = result.concat(tmp);
    result = result.concat(fill);

    start_input = end_input;
  }

  return result;

}

// let test = [];
// let pixels = 60;
//
// for (let pixel = 0; pixel < pixels; pixel++) {
//         let i = 3 * pixel
//
//         test[i] = 255;
//         test[i + 1] = 0;
//         test[i + 2] = 0;
// }

//convertData(test, config);


ndFC.on(FadeCandy.events.READY, function () {

    console.log('FadeCandy.events.READY')

    // create default color look up table
    ndFC.clut.create()

    // set fadecandy led to manual mode
    ndFC.config.set(ndFC.Configuration.schema.LED_MODE, 1)

    // blink that led
    let state = false
    setInterval(() => {
        state = !state;
        ndFC.config.set(ndFC.Configuration.schema.LED_STATUS, +state)
    }, 100)
})

ndFC.on(FadeCandy.events.COLOR_LUT_READY, function () {
    isFadeCandyReady = true;

    // Turn off every pixel
    let pixels = new Uint8Array(512 * 3);
    pixels.fill(0);
    ndFC.send(pixels);
});



var server = ws.createServer(function (conn) {

    console.log("New connection")

    conn.on("text", function (data) {
        console.log('nerdV - LED:', 'Receiving data');

        data = JSON.parse(data);

        console.log(data.length);

        let converted_data = convertData(data, config);

        console.log(converted_data.length);

        let pixels = new Uint8Array(converted_data);

        if (isFadeCandyReady) {
          ndFC.send(pixels);
        }

    })

    conn.on("close", function (code, reason) {
        console.log("Connection closed")
    })

}).listen(port);
