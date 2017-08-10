const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const actionRouter = require('./action/router');
const authRouter = require('./auth/router');

app.use('/google-assistant/actions.devives', actionRouter);
app.use('/google-assistant/auth', authRouter);

app.listen(3322);
