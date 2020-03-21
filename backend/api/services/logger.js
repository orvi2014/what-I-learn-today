const winston = require('winston');

const logger = new winston.createLogger({
	levels: winston.config.npm.levels,
	defaultMeta: { service: 'user-service' },
	format: winston.format.combine(
		winston.format.errors({ stack: true }),
		winston.format.metadata(),
		winston.format.json(),
		winston.format.timestamp(),
		winston.format.prettyPrint(),
		winston.format.printf(log => {
			return `${log.level}: ${process.pid} ${log.message} ${log.timestamp} `;
		}),
	),
	transports: [
		new winston.transports.Console({ colorize: true }),
		new winston.transports.File({
			colorize: true,
			json: false,
			filename: '/log/full.log',
		}),
		new winston.transports.File({
			colorize: true,
			json: false,
			filename: '/log/error.log',
			level: 'error',
		}),
	],
});

module.exports = logger;
