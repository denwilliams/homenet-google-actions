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

test('sync', t => {
  return t.context.request.post('/google-assistant/actions.devices')
  .send({
    requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
    inputs: [{
      intent: 'action.devices.SYNC'
    }]
  })
  .expect(200)
  // .then(res => {
  //   console.log(res.body);
  // })
  .then(() => { t.pass(); });
});

test.skip('query scene', t => {
  return t.context.request.post('/google-assistant/actions.devices')
  .send({
    requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
    inputs: [{
      intent: 'action.devices.QUERY',
      payload: {
        devices: [{
          id: 'homenet.scene.day'
        }]
      }
    }]
  })
  .expect(200)
  // .then(res => {
  //   console.log(res.body);
  // })
  .then(() => { t.pass(); });
});

test('query light', t => {
  return t.context.request.post('/google-assistant/actions.devices')
  .send({
    requestId: 'ff36a3cc-ec34-11e6-b1a0-64510650abcf',
    inputs: [{
      intent: 'action.devices.QUERY',
      payload: {
        devices: [{
          id: 'homenet.instance.light.frontdoor'
        }]
      }
    }]
  })
  .expect(200)
  .then(res => {
    console.log('TEST \n\n\n\n\n\n', res.body);
  })
  .then(() => { t.pass(); });
});
