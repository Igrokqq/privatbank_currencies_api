import {
  HttpStatus,
  ExceptionFilter,
  Catch,
  ArgumentsHost,
} from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { ExceptionResponse } from '@interfaces/exception-response.interface';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

@Catch()
export default class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx: HttpArgumentsHost = host.switchToHttp();
    const res = ctx.getResponse<ExpressResponse>();
    const status: number = exception.getStatus ? exception.getStatus() : 500;

    const mongodbCodes = {
      bulkWriteError: 11000, // on item duplicate
    };

    if (exception.code === mongodbCodes.bulkWriteError) {
      return res.status(HttpStatus.CONFLICT).json({
        message: exception.message,
        error: exception.name,
      });
    }

    const response: ExceptionResponse = exception.getResponse ? exception.getResponse() : null;

    return res.status(status).json({
      message: response ? response.message : exception.message,
      error: response ? response.error : exception.name,
    });
  }
}
