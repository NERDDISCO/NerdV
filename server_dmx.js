'use strict';

var DMX = require('DMX');


// @TODO: Create an abstraction
let devices = {
  'stairville-led-par-1' : {
		channels: ['Dimmer', 'Strobe', 'R', 'G', 'B', 'W', 'Color Macro', 'Sound']
	}
}

let ndDMX = new DMX();

// Define universes
let universes = {
  'talk': {

    'output': {
      'driver': 'enttec-usb-dmx-pro',
      'device': '/dev/cu.usbserial-EN193448'
    },

    // @TODO: Load the devices abstraction and use the channels as names
    slaves : {
      light1 : {
        type : 'stairville-led-par-1',
        // The first device gets address 0, the device has 8 channels, so the next device has address 7
        address : 0
      }
    }

  }
};

// Add universes
for (var universe in universes) {
  ndDMX.addUniverse(
    universe,
    universes[universe].output.driver,
    universes[universe].output.device
  )
}

ndDMX.update('talk', { 0 : 255 });


var ws = require("nodejs-websocket");
var server = ws.createServer(function (conn) {

    console.log("New connection")

    conn.on("text", function (data) {
        console.log(data)

        data = JSON.parse(data);

        ndDMX.update('talk', { 2 : data[0] });
        ndDMX.update('talk', { 3 : data[1] });
        ndDMX.update('talk', { 4 : data[2] });

    })

    conn.on("close", function (code, reason) {
        console.log("Connection closed")
    })

}).listen(1337);
