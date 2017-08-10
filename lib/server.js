const express = require('express');
const app = express();

const actionRouter = require('./action/router');
const authRouter = require('./auth/router');

app.use('/actions.devives', actionRouter);
app.use('/auth', authRouter);

app.listen(3322);
