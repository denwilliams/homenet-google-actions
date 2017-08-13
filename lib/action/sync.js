const { DEVICE_LIST } = require('./devices');
const UID = 'Aasfjsldnaf83';

/**
 *
 * @param data
 * {
 *   "uid": "213456",
 *   "auth": "bearer xxx",
 *   "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf"
 * }
 * @param response
 * @return {{}}
 * {
 *  "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
 *   "payload": {
 *     "devices": [{
 *         "id": "123",
 *         "type": "action.devices.types.Outlet",
 *         "traits": [
 *            "action.devices.traits.OnOff"
 *         ],
 *         "name": {
 *             "defaultNames": ["TP-Link Outlet C110"],
 *             "name": "Homer Simpson Light",
 *             "nicknames": ["wall plug"]
 *         },
 *         "willReportState: false,
 *         "attributes": {
 *         // None defined for these traits yet.
 *         },
 *         "roomHint": "living room",
 *         "config": {
 *           "manufacturer": "tplink",
 *           "model": "c110",
 *           "hwVersion": "3.2",
 *           "swVersion": "11.4"
 *         },
 *         "customData": {
 *           "fooValue": 74,
 *           "barValue": true,
 *           "bazValue": "sheepdip"
 *         }
 *       }, {
 *         "id": "456",
 *         "type": "action.devices.types.Light",
 *         "traits": [
 *           "action.devices.traits.OnOff",
 *           "action.devices.traits.Brightness",
 *           "action.devices.traits.ColorTemperature",
 *           "action.devices.traits.ColorSpectrum"
 *         ],
 *         "name": {
 *           "defaultNames": ["OSRAM bulb A19 color hyperglow"],
 *           "name": "lamp1",
 *           "nicknames": ["reading lamp"]
 *         },
 *         "willReportState: false,
 *         "attributes": {
 *           "TemperatureMinK": 2000,
 *           "TemperatureMaxK": 6500
 *         },
 *         "roomHint": "living room",
 *         "config": {
 *           "manufacturer": "osram",
 *           "model": "hg11",
 *           "hwVersion": "1.2",
 *           "swVersion": "5.4"
 *         },
 *         "customData": {
 *           "fooValue": 12,
 *           "barValue": false,
 *           "bazValue": "dancing alpaca"
 *         }
 *       }, {
 *         "id": "234"
 *         // ...
 *     }]
 *   }
 * }
 */
function sync(data) {
  console.log('query', data);

  // let devices = app.smartHomePropertiesSync(data.uid);
  // if (!devices) {
  //   response.status(500)
  //   .set({
  //     'Access-Control-Allow-Origin': '*',
  //     'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  //   })
  //   .json({error: 'failed'});
  //   return;
  // }

  // let deviceList = [];
  // Object.keys(devices).forEach(key => {
  //   if (devices.hasOwnProperty(key) && devices[key]) {
  //     let device = devices[key];
  //     device.id = key;
  //     deviceList.push(device);
  //   }
  // });

  const deviceProps = {
    requestId: data.requestId,
    payload: {
      agentUserId: UID,
      devices: DEVICE_LIST
    }
  };

  return Promise.resolve(deviceProps);
}

exports.sync = sync;
