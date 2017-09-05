const { test } = require('ava');
const supertest = require('supertest');
const sinon = require('sinon');

const app = require('./app');
const config = require('./config');

test.before(() => {
  sinon.stub(config, 'get').withArgs('homenetUrl').returns('http://homenet-core:3210');
});

test.after(() => {
  config.get.restore();
});

test.beforeEach(t => {
  t.context.request = supertest(app);
});

test.skip('sync', t => {
  return t.context.request.post('/google-assistant/actions.devices')
  .send({
    requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
    inputs: [{
      intent: 'action.devices.SYNC'
    }]
  })
  .expect(200)
  .then(res => {
    console.log(res.body);
  })
  .then(() => { t.pass(); });
});

test.skip('exec scene', t => {
  return t.context.request.post('/google-assistant/actions.devices')
  .send({
    requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
    inputs: [{
      intent: 'action.devices.EXECUTE',
      payload: {
        commands: [{
          devices: [{
            id: 'homenet.scene.night'
          }],
          execution: [{
            command: 'action.devices.commands.ActivateScene',
            params: {
              deactivate: false
            }
          }]
        }]
      }
    }]
  })
  .expect(200)
  .then(res => {
    t.deepEqual(res.body, {
      requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
      payload: {
        commands: [
          {
            ids: [
              'homenet.scene.night'
            ],
            status: 'SUCCESS',
            states: {}
          }
        ]
      }
    });
    // console.log(JSON.stringify(res.body, null, '  '));
  })
  .then(() => { t.pass(); });
});

test.skip('exec macro', t => {
  return t.context.request.post('/google-assistant/actions.devices')
  .send({
    requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
    inputs: [{
      intent: 'action.devices.EXECUTE',
      payload: {
        commands: [{
          devices: [{
            id: 'homenet.macro.ac-bedroom-heat'
          }],
          execution: [{
            command: 'action.devices.commands.ActivateScene',
            params: {
              deactivate: false
            }
          }]
        }]
      }
    }]
  })
  .expect(200)
  .then(res => {
    t.deepEqual(res.body, {
      requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
      payload: {
        commands: [
          {
            ids: [
              'homenet.macro.ac-bedroom-heat'
            ],
            status: 'SUCCESS',
            states: {}
          }
        ]
      }
    });
    // console.log(JSON.stringify(res.body, null, '  '));
  })
  .then(() => { t.pass(); });
});

test.skip('exec switch', t => {
  return t.context.request.post('/google-assistant/actions.devices')
  .send({
    requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
    inputs: [{
      intent: 'action.devices.EXECUTE',
      payload: {
        commands: [{
          devices: [{
            id: 'homenet.switch.macro.tv-power'
          }],
          execution: [ { command: 'action.devices.commands.OnOff', params: { on: true } } ]
        }]
      }
    }]
  })
  .expect(200)
  .then(res => {
    t.deepEqual(res.body, {
      requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
      payload: {
        commands: [
          {
            ids: [
              'homenet.switch.macro.tv-power'
            ],
            status: 'SUCCESS',
            states: {
              on: true,
              online: true
            }
          }
        ]
      }
    });
    // console.log(JSON.stringify(res.body, null, '  '));
  })
  .then(() => { t.pass(); });
});

test.skip('exec light', t => {
  return t.context.request.post('/google-assistant/actions.devices')
  .send({
    requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
    inputs: [
      {
        intent: 'action.devices.EXECUTE',
        payload: {
          commands: [
            {
              devices: [ { id: 'homenet.instance.light.kitchen', customData: {} } ],
              execution: [ { command: 'action.devices.commands.OnOff', params: { on: true } } ]
            }
          ]
        }
      }
    ]
  })
  .expect(200)
  .then(res => {
    t.deepEqual(res.body, {
      requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
      payload: {
        commands: [
          {
            ids: [
              'homenet.instance.light.kitchen'
            ],
            status: 'SUCCESS',
            states: { online: true, on: true }
          }
        ]
      }
    });
    // console.log(JSON.stringify(res.body, null, '  '));
  })
  .then(() => { t.pass(); });
});

test('query scene', t => {
  return t.context.request.post('/google-assistant/actions.devices')
  .send({
    requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
    inputs: [{
      intent: 'action.devices.QUERY',
      payload: {
        devices: [{
          id: 'homenet.scene.night'
        }]
      }
    }]
  })
  .expect(200)
  .then(res => {
    t.deepEqual(res.body, {
      requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
      payload: {
        devices: {
          online: true
        }
      }
    });
    // console.log(JSON.stringify(res.body, null, '  '));
  })
  .then(() => { t.pass(); });
});

test('query macro', t => {
  return t.context.request.post('/google-assistant/actions.devices')
  .send({
    requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
    inputs: [{
      intent: 'action.devices.QUERY',
      payload: {
        devices: [{
          id: 'homenet.macro.ac-bedroom-heat'
        }]
      }
    }]
  })
  .expect(200)
  .then(res => {
    t.deepEqual(res.body, {
      requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
      payload: {
        devices: {
          online: true
        }
      }
    });
    // console.log(JSON.stringify(res.body, null, '  '));
  })
  .then(() => { t.pass(); });
});

test('query switch', t => {
  return t.context.request.post('/google-assistant/actions.devices')
  .send({
    requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
    inputs: [{
      intent: 'action.devices.QUERY',
      payload: {
        devices: [{
          id: 'homenet.switch.macro.tv-power'
        }]
      }
    }]
  })
  .expect(200)
  .then(res => {
    t.deepEqual(res.body, {
      requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
      payload: {
        devices: {
          online: true,
          on: true
        }
      }
    });
    // console.log(JSON.stringify(res.body, null, '  '));
  })
  .then(() => { t.pass(); });
});

test('query instance (light)', t => {
  return t.context.request.post('/google-assistant/actions.devices')
  .send({
    requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
    inputs: [{
      intent: 'action.devices.QUERY',
      payload: {
        devices: [{
          id: 'homenet.instance.light.kitchen'
        }]
      }
    }]
  })
  .expect(200)
  .then(res => {
    t.deepEqual(res.body, {
      requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
      payload: {
        devices: {
          online: true,
          on: true
        }
      }
    });
    // console.log(JSON.stringify(res.body, null, '  '));
  })
  .then(() => { t.pass(); });
});
