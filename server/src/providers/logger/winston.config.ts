import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { PapertrailTransport } from 'winston-papertrail-transport';
import * as SlackHook from 'winston-slack-webhook-transport';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

const USE_JSON_LOGGER = process.env.USE_JSON_LOGGER;
const APP_NAME = process.env.APP_NAME;
const SLACK_WEBHOOK_REPORT_URL = process.env.SLACK_WEBHOOK_REPORT_URL;
const PAPER_HOST = process.env.PAPER_HOST;
const PAPER_PORT = process.env.PAPER_PORT;
const USE_PAPERTRAIL = process.env.USE_PAPERTRAIL;

let consoleFormat;

if (USE_JSON_LOGGER === 'true') {
  consoleFormat = winston.format.combine(
    winston.format.ms(),
    winston.format.timestamp(),
    winston.format.json(),
  );
} else {
  consoleFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.ms(),
    nestWinstonModuleUtilities.format.nestLike(APP_NAME, {
      colors: true,
      prettyPrint: true,
    }),
  );
}

let transports = [
  new winston.transports.Console({
    format: consoleFormat,
  }),

  new winston.transports.DailyRotateFile({
    filename: 'logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    format: consoleFormat,
  }),

  // new SlackHook.default({
  //   webhookUrl: SLACK_WEBHOOK_REPORT_URL,
  //   channel: '#report-bugs',
  //   username: 'LoggerBot',
  //   level: 'error',

  //   format: winston.format.combine(
  //     winston.format.timestamp(), // Add a timestamp to Slack logs
  //     winston.format.printf(({ timestamp, level, message, context, trace }) => {
  //       return `${timestamp} [${context}] ${level}: ${message}${trace ? `\n${trace}` : ''}`;
  //     }),
  //   ),
  // }),
];
// if (USE_PAPERTRAIL) {
//   transports.push(
//     new PapertrailTransport({
//       host: PAPER_HOST,
//       port: Number(PAPER_PORT),
//       format: consoleFormat,
//     }),
//   );
// }

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports,
});
