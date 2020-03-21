const express = require('express');
const app = express();
const i = require('os');
const usersRouter = require('./users/users');

app.use('/', (req, res, next) => {
    return res.send(`API health is okay`);
});
app.use('/users', usersRouter);
console.log();
module.exports = app;
// asdakjsdjk
