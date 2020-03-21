const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const logger = require('./services/logger');

// Variable to be sent to Frontend with Database status
let databaseConnection = 'Waiting for Database response...';

router.get('/', (req, res, next) => {
    res.send(databaseConnection);
});

// Connecting to MongoDB
const mongoUri = 'mongodb://localhost:27017/what-i-learn-today';
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useCreateIndex', true);
mongoose.connect(mongoUri, () => {});

// If there is a connection error send an error message
mongoose.connection.on('error', (error) => {
    logger.error('Database connection error:', error);
    databaseConnection = 'Error connecting to Database';
});

// If connected to MongoDB send a success message
mongoose.connection.once('open', () => {
    logger.info('Connected to Database!');
    databaseConnection = 'Connected to Database';
});

module.exports = router;
