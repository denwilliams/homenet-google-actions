const express = require('express');
const app = express();

const actionRouter = require('./action/router');
const authRouter = require('./auth/router');

app.use('/google-assistant/actions.devives', actionRouter);
app.use('/google-assistant/auth', authRouter);

app.listen(3322);
