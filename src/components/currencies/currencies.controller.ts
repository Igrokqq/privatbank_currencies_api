import {
  Controller,
  Get,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiParam,
} from '@nestjs/swagger';
import JwtAccessGuard from '@guards/jwt-access.guard';
import ParseCurrencyIdPipe from '@components/currencies/pipes/currency-id.pipe';
import CurrencyDto from '@components/currencies/dto/currency.dto';
import CurrenciesService from './currencies.service';

@ApiTags('Currencies')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAccessGuard)
export default class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @ApiOkResponse({
    type: [CurrencyDto],
    description: '200. Success. Returns an array of currencies or empty',
  })
  @ApiUnauthorizedResponse({
    schema: {
      type: 'object',
      example: {
        message: 'string',
      },
    },
    description: '401. UnauthorizedException.',
  })
  @Get('currencies')
  public async getAll(): Promise<CurrencyDto[]> {
    const currenciesFromHistory: CurrencyDto[] = await this.currenciesService.getAllHistoryForLastHour();

    if (currenciesFromHistory.length) {
      return currenciesFromHistory;
    }

    const currenciesFromApi: CurrencyDto[] = await this.currenciesService.getAllFromApi();

    if (currenciesFromApi.length) {
      await this.currenciesService.updateHistory(currenciesFromApi);

      return currenciesFromApi;
    }

    return [];
  }

  @ApiOkResponse({
    type: CurrencyDto,
    description: '200. Success. Returns a Currency',
  })
  @ApiNotFoundResponse({
    description: '404. NotFoundException. Currency was not found',
  })
  @ApiUnauthorizedResponse({
    schema: {
      type: 'object',
      example: {
        message: 'string',
      },
    },
    description: '401. UnauthorizedException.',
  })
  @ApiParam({ name: 'id', type: String })
  @Get('currency/:id')
  public async getById(@Param('id', ParseCurrencyIdPipe) currencyId: string): Promise<CurrencyDto | never> {
    const currencyFromHistory: CurrencyDto | null = await this.currenciesService.getByIdFromHistoryForLastHour(currencyId);

    if (currencyFromHistory) {
      return currencyFromHistory;
    }

    const currenciesFromApi: CurrencyDto[] = await this.currenciesService.getAllFromApi();

    if (currenciesFromApi.length) {
      await this.currenciesService.updateHistory(currenciesFromApi);
    }

    const currency: CurrencyDto | undefined = currenciesFromApi.find((currencyFromApi: CurrencyDto) => currencyFromApi.ccy === currencyId);

    if (currency) {
      return currency;
    }

    throw new NotFoundException('The currency was not found');
  }
}
