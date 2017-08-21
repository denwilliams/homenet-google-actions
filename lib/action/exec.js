const got = require('got');

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

  return Promise.all(data.commands.map(curCommand => {
    const { devices, execution } = curCommand;

    return Promise.all(execution.map(curExec => {
      return execDevices(data.uid, curExec, devices);
    }));
  }))
  .then(commandResults => {
    return {
      requestId: data.requestId,
      payload: {
        commands: commandResults
      }
    };
  });
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
  return Promise.all(devices.map(device => {
    return execDevice(uid, command, device);
  }));
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
  const deviceId = device.id;
  const cmdId = deviceId.replace('homenet.', '');
  let states = { online: true };

  const commandUrls = Object.keys(command.params).forEach(key => {
    const value = command.params[key];
    // key = "on", value = true
    states[key] = value;

    return `http://localhost:3210/api/v1/commands/${cmdId}/${value ? 'turnOn' : 'turnOff'}`;
  });

  let result = {
    ids: [deviceId],
    status: 'SUCCESS', // OFFLINE, FAILURE
    states
  };

  return Promise.all(commandUrls.map(url => got.post(url, { json: true })))
  .then(() => result);
}

exports.exec = exec;
