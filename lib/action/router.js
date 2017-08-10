const intents = require('./intents');

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
  console.log('post /ha', request.headers, request.body);

  const { inputs, requestId } = request.body;

  // let authToken = authProvider.getAccessToken(request);
  // let uid = datastore.Auth.tokens[authToken].uid;

  if (!inputs) {
    return missingInputs(response);
  }

  Promise.all(inputs.map(input => {
    const { intent } = input;

    if (!intent) {
      return missingInputs(response);
    }

    if (intents[intent]) {
      return intents[intent](input, response, requestId);
    }

    return missingInputs(response);
  }));
});

/**
 * Enables prelight (OPTIONS) requests made cross-domain.
 */
router.options('/', (req, res) => {
  res.status(200)
  .set(CORS_HEADERS)
  .send('null');
});

function missingInputs(res) {
  return res.status(401)
  .set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  })
  .json({error: 'missing inputs'});
}

module.exports = router;
