import AppService from '@components/app/app.service';
import { ApiOkResponse } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';

@Controller()
export default class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOkResponse({ description: 'Ping route' })
  @Get('ping')
  public ping(): string {
    return this.appService.getPingMessage();
  }
}
