/* eslint-disable no-console */
import { Logger } from '@nestjs/common';

export default class ConsoleLogger extends Logger {
  static log(message: string, context: string = '', status: boolean = true): void {
    console.log(message, context, status);
  }

  static warn(message: string, context: string = '', status: boolean = true): void {
    console.warn(message, context, status);
  }

  static error(error: any, context: string = ''): void {
    console.error(error, context);
  }

  static debug(message: string, context: string = ''): void {
    console.debug(message, context);
  }
}
