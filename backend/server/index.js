/**
 * Module dependencies.
 */
const cluster = require('cluster');
const os = require('os');
const debug = require("debug")("api:server");
const http = require("http");

const config = require('./config');
const app = require('../api/app');
const logger = require ('../api/services/logger');

const loggerDispatcher = 'Index';
/**
 * Normalize a port into a number, string, or false.
 */

const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
      // named pipe
      return val;
  }

  if (port >= 0) {
      // port number
      return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

const onError = (error) => {
  if (error.syscall !== "listen") {
      throw error;
  }

  let bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
      case "EACCES":
          logger.error(bind + " requires elevated privileges");
          process.exit(1);
      case "EADDRINUSE":
          logger.error(bind + " is already in use");
          process.exit(1);
      default:
          throw error;
  }
};

/**
 * Event listener for HTTP server "listening" event.
 */

const onListening = () => {
  let addr = server.address();
  let bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
};

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || "9000");
app.set("port", port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

server.on("error", onError);
server.on("listening", onListening);

process.on('unhandledRejection', async (err, promise) => {
  logger.error(err, {
    dispatcher: loggerDispatcher,
    from: 'unhandledRejection event',
    promise,
  });
});

process.on('uncaughtException', err => {
  logger.error(
    err,
    { dispatcher: loggerDispatcher, from: 'uncaughtException event' },
    () => {
      process.exit(1);
    },
  );
});
process.on('exit', async code => {
  mongoose.connection.close();
  logger.info(`About to exit with code: ${code}`);
});
process.on('SIGINT', function() {
  logger.info('Caught interrupt signal');
  process.exit();
});

const startServer = () => {
  /**
 * Listen on provided port, on all network interfaces.
 */

  app.listen(port, config.http.host, () => {
    logger.info(`Server started at [ http://${config.http.host}:${config.http.port} ]`)
    logger.info(`Environment ${process.pid}: ${config.env}`)
  })
}

const startClusterServer = () => {
  if (!cluster.isMaster) {
    return startServer()
  }

  logger.info(`Master ${process.pid} is running`)
  const numCPUs = os.cpus().length

  logger.info(`Forking ${numCPUs} clusters`)

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker) => {
    logger.info(`worker ${worker.process.pid} died`)
  })
}
console.log(config.nodeClusterEnabled);
if (config.nodeClusterEnabled) {
  startClusterServer()
} else {
  startServer()
}