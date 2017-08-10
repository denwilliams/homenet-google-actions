const { sync } = require('./sync');
const { query } = require('./query');
const { exec } = require('./exec');

exports['action.devices.SYNC'] = (input, response, requestId) => {
  console.log('post /ha SYNC');
  /**
   * request:
   * {
   *  "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
   *  "inputs": [{
   *      "intent": "action.devices.SYNC",
   *  }]
   * }
   */
  sync({
    // uid: uid,
    // auth: authToken,
    requestId: requestId
  }, response);
};

exports['action.devices.QUERY'] = (input, response, requestId) => {
  console.log('post /ha QUERY');
  /**
   * request:
   * {
   *   "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
   *   "inputs": [{
   *       "intent": "action.devices.QUERY",
   *       "payload": {
   *          "devices": [{
   *            "id": "123",
   *            "customData": {
   *              "fooValue": 12,
   *              "barValue": true,
   *              "bazValue": "alpaca sauce"
   *            }
   *          }, {
   *            "id": "234",
   *            "customData": {
   *              "fooValue": 74,
   *              "barValue": false,
   *              "bazValue": "sheep dip"
   *            }
   *          }]
   *       }
   *   }]
   * }
   */
  query({
    // uid: uid,
    // auth: authToken,
    requestId,
    devices: input.payload.devices
  }, response);
};

exports['action.devices.EXECUTE'] = (input, response, requestId) => {
  console.log('post /ha EXECUTE');
  /**
   * request:
   * {
   *   "requestId": "ff36a3cc-ec34-11e6-b1a0-64510650abcf",
   *   "inputs": [{
   *     "intent": "action.devices.EXECUTE",
   *     "payload": {
   *       "commands": [{
   *         "devices": [{
   *           "id": "123",
   *           "customData": {
   *             "fooValue": 12,
   *             "barValue": true,
   *             "bazValue": "alpaca sauce"
   *           }
   *         }, {
   *           "id": "234",
   *           "customData": {
   *              "fooValue": 74,
   *              "barValue": false,
   *              "bazValue": "sheep dip"
   *           }
   *         }],
   *         "execution": [{
   *           "command": "action.devices.commands.OnOff",
   *           "params": {
   *             "on": true
   *           }
   *         }]
   *       }]
   *     }
   *   }]
   * }
   */
  exec({
    // uid: uid,
    // auth: authToken,
    requestId,
    commands: input.payload.commands
  }, response);
};
