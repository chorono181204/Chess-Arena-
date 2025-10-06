import uaParserJs from 'ua-parser-js';
import { randomUUID } from 'node:crypto';
import { Buffer } from 'node:buffer';

export const createDeviceId = (): string => {
  return randomUUID();
};

export const detectDevice = (useragent: string) => {
  const detect = new uaParserJs.UAParser(useragent);
  const result = detect.getResult();
  return result;
};

export const encodeDevice = (deviceId: string) => {
  return Buffer.from(deviceId, 'utf-8').toString('base64');
};

export const decodeDevice = (encryptDeviceId: string) => {
  return Buffer.from(encryptDeviceId, 'base64').toString('ascii');
};
