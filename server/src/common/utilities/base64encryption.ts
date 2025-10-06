import { Buffer } from 'node:buffer';

export const base64decode = (base64: string) => {
  return Buffer.from(base64, 'base64').toString('binary');
};

export const base64encode = (string: string) => {
  return Buffer.from(string, 'binary').toString('base64');
};