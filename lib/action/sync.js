const got = require('got');

const config = require('../config');

// const { DEVICE_LIST } = require('./devices');

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
  // console.log('sync', data);

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

  return Promise.all([

    got(`${config.get('homenetUrl')}/api/v1/states/scene`, { json: true })
      .then(response => response.body)
      .then(sceneState => {
        return sceneState.available.map(scene => {
          return {
            id: `homenet.scene.${scene}`,
            type: 'action.devices.types.SCENE',
            traits: [
              'action.devices.traits.Scene'
            ],
            name: {
              name: `${scene} scene`,
              nicknames: [
                `${scene} mode`
              ]
            },
            attributes: {
              sceneReversible: false
            },
            willReportState: false
          };
        });
      })
    ,
    got(`${config.get('homenetUrl')}/api/v1/instances`, { json: true })
    .then(response => response.body)
    .then(instances => instances.filter(i => i.expose))
    .then(instances => {
      return instances.map(instance => {
        switch (instance.class) {
          case 'light':
            return {
              id: `homenet.instance.${instance.key}`,
              type: 'action.devices.types.LIGHT',
              traits: [
                'action.devices.traits.OnOff'
              ],
              name: {
                name: instance.name || `${instance.id} light`
              },
              roomHint: instance.zone, // TODO: fetch zones
              willReportState: false
            };
          case 'macro':
            if (instance.switchId) {
              return {
                id: `homenet.switch.${instance.switchId}`,
                type: 'action.devices.types.SWITCH',
                traits: [
                  'action.devices.traits.OnOff'
                ],
                name: {
                  name: instance.name || instance.id,
                  nicknames: [] // TODO
                },
                roomHint: instance.zone, // TODO: fetch zones
                willReportState: false
              };
            }
            return {
              id: `homenet.${instance.commandId}`,
              type: 'action.devices.types.SCENE',
              traits: [
                'action.devices.traits.Scene'
              ],
              name: {
                name: instance.name || instance.id,
                nicknames: [] // TODO
              },
              attributes: {
                sceneReversible: false
              },
              willReportState: false
            };
          default:
            console.log('UNKNOWN INSTANCE', instance);
            return null;
        }
      })
      .filter(Boolean);
    })

  ])
  .then(([scenes, instances]) => {
    return [...scenes, ...instances];
  })
  .then(devices => {
    return {
      requestId: data.requestId,
      payload: {
        agentUserId: UID,
        devices
      }
    };
  });
}

exports.sync = sync;
