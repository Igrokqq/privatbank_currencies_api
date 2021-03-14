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
import CurrenciesService from './currencies.service';
import { Currency } from './interfaces/currency.interface';
import OutputCurrency from './types/output-currency.type';

@ApiTags('Currencies')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAccessGuard)
export default class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @ApiOkResponse({
    type: [OutputCurrency],
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
  public async getAll(): Promise<Currency[] | []> {
    const currenciesFromHistory: Currency[] | [] = await this.currenciesService.getAllHistoryForLastHour();

    if (currenciesFromHistory.length > 0) {
      return currenciesFromHistory;
    }

    const currenciesFromApi: Currency[] | [] = await this.currenciesService.getAllFromApi();

    if (currenciesFromApi.length > 0) {
      await this.currenciesService.updateHistory(currenciesFromApi);

      return currenciesFromApi;
    }

    return [];
  }

  @ApiOkResponse({
    type: OutputCurrency,
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
  public async getById(@Param('id', ParseCurrencyIdPipe) currencyId: string): Promise<Currency | never> {
    const currencyFromHistory: Currency | null = await this.currenciesService.getByIdFromHistoryForLastHour(currencyId);

    if (currencyFromHistory) {
      return currencyFromHistory;
    }

    const currenciesFromApi: Currency[] | [] = await this.currenciesService.getAllFromApi();

    if (currenciesFromApi.length > 0) {
      const currency: Currency | undefined = currenciesFromApi.find((currencyFromApi: Currency) => currencyFromApi.ccy === currencyId);

      await this.currenciesService.updateHistory(currenciesFromApi);

      if (currency) {
        return currency;
      }
    }

    throw new NotFoundException('The currency was not found');
  }
}
