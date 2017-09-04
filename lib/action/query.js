const got = require('got');

const config = require('../config');

/**
 *
 * @param data
 * {
 *   "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
 *   "uid": "213456",
 *   "auth": "bearer xxx",
 *   "devices": [{
 *     "id": "123",
 *       "customData": {
 *         "fooValue": 12,
 *         "barValue": true,
 *         "bazValue": "alpaca sauce"
 *       }
 *   }, {
 *     "id": "234"
 *   }]
 * }
 * @param response
 * @return {{}}
 * {
 *  "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
 *   "payload": {
 *     "devices": {
 *       "123": {
 *         "on": true ,
 *         "online": true
 *       },
 *       "456": {
 *         "on": true,
 *         "online": true,
 *         "brightness": 80,
 *         "color": {
 *           "name": "cerulian",
 *           "spectrumRGB": 31655
 *         }
 *       },
 *       ...
 *     }
 *   }
 * }
 */
function query(data) {
  console.log('query', data);

  const ids = data.devices.map(d => d.id.replace('homenet.instance.', ''));

  return got(`${config.get('homenetUrl')}/api/v1/instances`, { json: true })
  .then(response => response.body)
  .then(body => body.filter(i => ids.includes(i.key)))
  .then(instances => {
    const devices = {};

    instances.forEach(instance => {
      devices[instance.id] = {
        online: true,
        on: true,
        // brightness: 65,
        // color: {
        //   name: 'lamp1',
        //   temperature: 2000,
        //   spectrumRGB: 16510692
        // }
      };
    });

    return devices;
  })
  .then(devices => {
    return {
      requestId: data.requestId,
      payload: { devices }
    };
  });

  // let deviceIds = getDeviceIds(data.devices);

  // // let devices = app.smartHomeQueryStates(data.uid, deviceIds);
  // // if (!devices) {
  // //   response.status(500).set({
  // //     'Access-Control-Allow-Origin': '*',
  // //     'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  // //   }).json({error: 'failed'});
  // //   return;
  // // }

  // let deviceStates = {
  //   requestId: data.requestId,
  //   payload: {
  //     devices: DEVICE_LIST // TODO: filter by device IDs
  //   }
  // };
  // return Promise.resolve(deviceStates);
}

/**
 *
 * @param devices
 * [{
 *   "id": "123"
 * }, {
 *   "id": "234"
 * }]
 * @return {Array} ["123", "234"]
 */
function getDeviceIds(devices) {
  return devices.map(d => d.id).filter(Boolean);
}

exports.query = query;
