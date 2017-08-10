/**
 * @param data:
 * {
 *   "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
 *   "uid": "213456",
 *   "auth": "bearer xxx",
 *   "commands": [{
 *     "devices": [{
 *       "id": "123",
 *       "customData": {
 *          "fooValue": 74,
 *          "barValue": false
 *       }
 *     }, {
 *       "id": "456",
 *       "customData": {
 *          "fooValue": 12,
 *          "barValue": true
 *       }
 *     }, {
 *       "id": "987",
 *       "customData": {
 *          "fooValue": 35,
 *          "barValue": false,
 *          "bazValue": "sheep dip"
 *       }
 *     }],
 *     "execution": [{
 *       "command": "action.devices.commands.OnOff",
 *       "params": {
 *           "on": true
 *       }
 *     }]
 *  }
 *
 * @param response
 * @return {{}}
 * {
 *   "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
 *   "payload": {
 *     "commands": [{
 *       "ids": ["123"],
 *       "status": "SUCCESS"
 *       "states": {
 *         "on": true,
 *         "online": true
 *       }
 *     }, {
 *       "ids": ["456"],
 *       "status": "SUCCESS"
 *       "states": {
 *         "on": true,
 *         "online": true
 *       }
 *     }, {
 *       "ids": ["987"],
 *       "status": "OFFLINE",
 *       "states": {
 *         "online": false
 *       }
 *     }]
 *   }
 * }
 */
function exec(data) {
  console.log('exec', data);
  let respCommands = [];
  for (let i = 0; i < data.commands.length; i++) {
    let curCommand = data.commands[i];
    for (let j = 0; j < curCommand.execution.length; j++) {
      let curExec = curCommand.execution[j];
      respCommands.push(execDevices(data.uid, curExec, curCommand.devices));
    }
  }
  let resBody = {
    requestId: data.requestId,
    payload: {
      commands: respCommands
    }
  };

  return Promise.resolve(resBody);
}

/**
 *
 * @param uid
 * @param command
 * {
 *   "command": "action.devices.commands.OnOff",
 *   "params": {
 *       "on": true
 *   }
 * }
 * @param devices
 * [{
 *   "id": "123",
 *   "customData": {
 *      "fooValue": 74,
 *      "barValue": false
 *   }
 * }, {
 *   "id": "456",
 *   "customData": {
 *      "fooValue": 12,
 *      "barValue": true
 *   }
 * }, {
 *   "id": "987",
 *   "customData": {
 *      "fooValue": 35,
 *      "barValue": false,
 *      "bazValue": "sheep dip"
 *   }
 * }]
 * @return {Array}
 * [{
 *   "ids": ["123"],
 *   "status": "SUCCESS"
 *   "states": {
 *     "on": true,
 *     "online": true
 *   }
 * }, {
 *   "ids": ["456"],
 *   "status": "SUCCESS"
 *   "states": {
 *     "on": true,
 *     "online": true
 *   }
 * }, {
 *   "ids": ["987"],
 *   "status": "OFFLINE",
 *   "states": {
 *     "online": false
 *   }
 * }]
 */
function execDevices(uid, command, devices) {
  let payload = [];
  for (let i = 0; i < devices.length; i++) {
    payload.push(execDevice(uid, command, devices[i]));
  }
  return payload;
}

/**
 *
 * @param uid
 * @param command
 * {
 *   "command": "action.devices.commands.OnOff",
 *   "params": {
 *       "on": true
 *   }
 * }
 * @param device
 * {
 *   "id": "123",
 *   "customData": {
 *      "fooValue": 74,
 *      "barValue": false
 *   }
 * }
 * @return {{}}
 * {
 *   "ids": ["123"],
 *   "status": "SUCCESS"
 *   "states": {
 *     "on": true,
 *     "online": true
 *   }
 * }
 */
function execDevice(uid, command, device) {
  let curDevice = {
    id: device.id,
    states: {}
  };
  Object.keys(command.params).forEach(function (key) {
    if (command.params.hasOwnProperty(key)) {
      curDevice.states[key] = command.params[key];
    }
  });
  let payLoadDevice = {
    ids: [curDevice.id],
    status: 'SUCCESS',
    states: {}
  };
  let execDevice = app.smartHomeExec(uid, curDevice);
  if (!execDevice) {
    payLoadDevice.status = 'OFFLINE';
    return execDevice;
  }
  let deviceCommand = {
    type: 'change',
    state: {}
  };
  // TODO - add error and debug to response

  deviceCommand.state[curDevice.id] = execDevice[curDevice.id].states;
  app.changeState(deviceCommand);

  execDevice = execDevice[curDevice.id];

  payLoadDevice.states = execDevice.states;

  Object.keys(command.params).forEach(function (key) {
    if (command.params.hasOwnProperty(key)) {
      if (payLoadDevice.states[key] != command.params[key]) {
        payLoadDevice.status = 'FAILURE';
      }
    }
  });
  return payLoadDevice;
}

exports.exec = exec;
