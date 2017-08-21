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
router.post('/', (req, res) => {
  console.log('post /ha', req.headers, req.body);

  const { inputs, requestId } = req.body;

  // let authToken = authProvider.getAccessToken(request);
  // let uid = datastore.Auth.tokens[authToken].uid;

  if (!inputs) {
    return missingInputs(res);
  }

  Promise.all(inputs.map(input => {
    const { intent } = input;

    if (!intent) {
      return missingInputs(res);
    }

    console.log('INTENT', intent);
    if (intents[intent]) {
      return intents[intent](input, res, requestId);
    }

    return missingInputs(res);
  }))
  .then((results) => {
    const [result] = results;
    console.log('--- RESULTS ----');
    console.log(JSON.stringify(result));
    console.log('--- ======= ----');
    res.status(200).json(result);
  })
  .catch(err => {
    console.log('ERR', err);
    res.status(400).json({ message: err.message });
  });
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
