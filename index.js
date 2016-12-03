'use strict';

const FadeCandy = require('node-fadecandy');

let ws = require('nodejs-websocket');
let ndFC = new FadeCandy();
let isFadeCandyReady = false;

let debug = true;
let port = 1337;

let config = {
  stripes : 8,
  led : 30,
  max_led : 64
}



/**
 * Fill the gabs from input with 0 using the config
 */
function convertData(input, config) {
  let result = [];
  let fill = new Array((config.max_led - config.led) * 3);
  fill.fill(0);

  if (debug) {
    console.log('input: ', input.length);
  }

  let tmp;
  let start_input = 0;
  let start_output = 0;

  if (debug) {
    console.log('fill:', fill.length);
  }

  for (var i = 0; i < config.stripes; i++) {
    let end_input = ((i + 1) * config.led) * 3;

    if (debug) {
      console.log('from', start_input, 'to', end_input);
    }

    tmp = input.slice(start_input, end_input);

    result = result.concat(tmp);
    result = result.concat(fill);

    start_input = end_input;
  }

  return result;

}





/**
 * FadeCandy is ready
 */
ndFC.on(FadeCandy.events.READY, function () {

    if (debug) {
      console.log('FadeCandy.events.READY');
    }

    // create default color look up table
    ndFC.clut.create()

    // set fadecandy led to manual mode
    ndFC.config.set(ndFC.Configuration.schema.LED_MODE, 1)

    // Update the status LED
    let state = false
    setInterval(() => {
        state = !state;
        ndFC.config.set(ndFC.Configuration.schema.LED_STATUS, +state)
    }, 100);

});





/**
 * FadeCandy Color_LUT is ready
 */
ndFC.on(FadeCandy.events.COLOR_LUT_READY, function () {
    isFadeCandyReady = true;

    // Turn off every pixel
    let pixels = new Uint8Array(config.max_led * config.stripes * 3);
    pixels.fill(0);
    ndFC.send(pixels);
});





/**
 * Create a WebSocket server
 */
let server = ws.createServer(function (connection) {

    console.log('New connection');

    connection.on('text', function (data) {
        if (debug) {
          console.log('nerdV - LED:', 'Receiving data');
        }

        data = JSON.parse(data);

        let converted_data = convertData(data, config);
        let pixels = new Uint8Array(converted_data);

        // Send data when FadeCandy is ready
        if (isFadeCandyReady) {
          ndFC.send(pixels);
        }

    })



    connection.on('close', function (code, reason) {
      console.log('Connection closed');
    });



    connection.on('error', function (error) {
      if (error.code !== 'ECONNRESET') {
        // Ignore ECONNRESET and re throw anything else
        throw err;
      }
    });

}).listen(port);
