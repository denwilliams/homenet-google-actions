const got = require('got');

const config = require('../config');

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
  // console.log('exec', data);
  const uid = data.uid;

  const unrolled = data.commands.reduce((commandsArr, curCommand) => {
    const { devices, execution } = curCommand;

    return commandsArr.concat(devices.reduce((devicesArr, device) => {
      return devicesArr.concat(devicesArr.concat(execution.reduce((execArr, curExec) => {
        execArr.push({ device, execution: curExec });
        return execArr;
      }, [])));
      // const deviceId = device.id;
      // const ids = deviceId.split('.');
      // const [, category] = ids.splice(0, 2);

      // return execCategory[category](deviceId, ids, command);
    }, []));
  }, []);

  return Promise.all(unrolled.map(x => execDevice(x.execution, x.device)))
  .then(results => {
    return {
      requestId: data.requestId,
      payload: {
        commands: results
      }
    };
  });

  // return Promise.all(data.commands.map(curCommand => {
  //   const { devices, execution } = curCommand;

  //   return Promise.all(execution.map(curExec => {
  //     return execDevices(data.uid, curExec, devices);
  //   }))
  //   .then(() => {
  //     return {
  //       ids: devices.map(d => d.id),
  //       status: 'SUCCESS', // OFFLINE, FAILURE
  //       states: {}
  //     };
  //   });
  // }))
  // .then(commandResults => {
  //   return {
  //     requestId: data.requestId,
  //     payload: {
  //       commands: commandResults
  //     }
  //   };
  // });
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
// function execDevices(uid, command, devices) {
//   return Promise.all(devices.map(device => {
//     return execDevice(uid, command, device);
//   }))
//   .then(() => {
//   });
// }

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
function execDevice(command, device) {
  const deviceId = device.id;
  const ids = deviceId.split('.');
  const [, category] = ids.splice(0, 2);

  return execCategory[category](deviceId, ids, command);
}

const execCategory = {
  'scene': (deviceId, ids, command) => {
    const [sceneId] = ids;

    const body = { state: sceneId };

    if (command.command !== 'action.devices.commands.ActivateScene') {
      throw new Error('Expected ActivateScene');
    }

    const url = `${config.get('homenetUrl')}/api/v1/states/scene`;

    return got.put(url, { json: true, body })
    .then(() => {
      return {
        ids: [deviceId],
        status: 'SUCCESS', // OFFLINE, FAILURE
        states: {}
      };
    });
  },
  'macro': (deviceId, ids, command) => {
    const [sceneId] = ids;

    const body = { state: sceneId };

    if (command.command !== 'action.devices.commands.ActivateScene') {
      throw new Error('Expected ActivateScene');
    }

    const url = `${config.get('homenetUrl')}/api/v1/commands/macro.${ids.join('.')}/execute`;

    return got.post(url, { json: true, body })
    .then(() => {
      return {
        ids: [deviceId],
        status: 'SUCCESS', // OFFLINE, FAILURE
        states: {}
      };
    });
  },
  'switch': (deviceId, ids, command) => {
    let states = { online: true };

    const url = `${config.get('homenetUrl')}/api/v1/switches/${ids.join('.')}`;
    const body = { value: command.params.on };
    states.on = command.params.on;

    let result = {
      ids: [deviceId],
      status: 'SUCCESS', // OFFLINE, FAILURE
      states
    };

    return got.put(url, { json: true, body })
    .then(() => result); // TODO: failure result
  },
  'instance': (deviceId, ids, command) => {
    let states = { online: true };

    // TODO: check for light

    const commandUrls = Object.keys(command.params).map(key => {
      const value = command.params[key];
      // key = "on", value = true
      // this just kind of assumes it worked
      states[key] = value;

      return `${config.get('homenetUrl')}/api/v1/commands/${ids.join('.')}/${value ? 'turnOn' : 'turnOff'}`;
    });

    let result = {
      ids: [deviceId],
      status: 'SUCCESS', // OFFLINE, FAILURE
      states
    };

    return Promise.all(commandUrls.map(url => got.post(url, { json: true })))
    .then(() => result); // TODO: failure result
  }
};

exports.exec = exec;
