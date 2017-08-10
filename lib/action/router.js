const { sync } = require('./sync');
const { query } = require('./query');
const { exec } = require('./exec');

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

const router = require('express').Router();

/**
 *
 * action: {
 *   initialTrigger: {
 *     intent: [
 *       "action.devices.SYNC",
 *       "action.devices.QUERY",
 *       "action.devices.EXECUTE"
 *     ]
 *   },
 *   httpExecution: "https://example.org/device/agent",
 *   accountLinking: {
 *     authenticationUrl: "https://example.org/device/auth"
 *   }
 * }
 */
router.post('/', function (request, response) {
  console.log('post /ha', request.headers);
  let reqdata = request.body;
  console.log('post /ha', reqdata);

  // let authToken = authProvider.getAccessToken(request);
  // let uid = datastore.Auth.tokens[authToken].uid;

  if (!reqdata.inputs) {
    response.status(401)
    .set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    })
    .json({error: 'missing inputs'});
  }

  for (let i = 0; i < reqdata.inputs.length; i++) {
    let input = reqdata.inputs[i];
    let intent = input.intent;

    if (!intent) {
      response.status(401)
      .set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      })
      .json({error: 'missing inputs'});
      continue;
    }

    switch (intent) {
      case 'action.devices.SYNC':
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
          uid: uid,
          auth: authToken,
          requestId: reqdata.requestId
        }, response);
        break;

      case 'action.devices.QUERY':
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
          uid: uid,
          auth: authToken,
          requestId: reqdata.requestId,
          devices: reqdata.inputs[0].payload.devices
        }, response);

        break;

      case 'action.devices.EXECUTE':
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
          uid: uid,
          auth: authToken,
          requestId: reqdata.requestId,
          commands: reqdata.inputs[0].payload.commands
        }, response);

        break;

      default:
        response.status(401)
        .set({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        })
        .json({error: 'missing intent'});
        break;
    }
  }
});

/**
 * Enables prelight (OPTIONS) requests made cross-domain.
 */
router.options('/', (req, res) => {
  res.status(200)
  .set(CORS_HEADERS)
  .send('null');
});

module.exports = router;
