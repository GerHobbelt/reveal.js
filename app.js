
// Express
const express = require('express');
const app = express();
app.use(express.static('./'));
app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});


// Johnny-five & milkcocoa
const five = require("johnny-five");
const board = new five.Board({port:'COM8'});
const MilkCocoa = require('milkcocoa');
const milkcocoa = new MilkCocoa('oniolavi4s.mlkcca.com');
const ds = milkcocoa.dataStore('command');


board.on("ready", () => {
  const motorR_F = new five.Led(12);
  const motorR_B = new five.Led(11);
  const motorL_F = new five.Led(10);
  const motorL_B = new five.Led(9);
  const SEQ_TIME = 500;

  const stop = () => {
    console.log('stop');
    motorR_B.off();
    motorL_B.off();
    motorR_F.off();
    motorL_F.off();
  }

  ds.on('send', (data) => {
    const command = data.value['command'];
    console.log('[' + command + ']');
    if (command == 'f') {
        console.log('forward');
        motorR_B.off();
        motorL_B.off();
        motorR_F.on();
        motorL_F.on();
        board.wait(SEQ_TIME, () => stop());
    }
    else if (command == 'b') {
        console.log('back');
        motorR_F.off();
        motorL_F.off();
        motorR_B.on();
        motorL_B.on();
        board.wait(SEQ_TIME, () => stop());
    }
    else if (command == 'r') {
        console.log('right');
        motorR_B.off();
        motorL_F.off();
        motorL_B.on();
        motorR_F.on();
        board.wait(SEQ_TIME, () => stop());
    }
    else if (command == 'l') {
        console.log('left');
        motorL_B.off();
        motorR_F.off();
        motorR_B.on();
        motorL_F.on();
        board.wait(SEQ_TIME, () => stop());
    }
    else if (command == 's') {
      stop();
    }
  });
});
