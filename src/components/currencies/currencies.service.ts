import { Injectable } from '@nestjs/common';
import fetch, { Response } from 'node-fetch';
import { UpdateResponse } from '@interfaces/update-response.interface';
import currenciesConstants from './currencies.constants';
import CurrenciesRepository from './currencies.repository';
import { Currency } from './interfaces/currency.interface';
import { CurrencyApi } from './interfaces/currency-api.interface';

@Injectable()
export default class UsersService {
  constructor(private readonly currenciesRepository: CurrenciesRepository) {}

  public updateHistory(currencies: Currency[]): Promise<UpdateResponse[]> {
    return this.currenciesRepository.updateMany(currencies);
  }

  public getAllHistoryForLastHour(): Promise<Currency[] | []> {
    return this.currenciesRepository.getAllForLastHour();
  }

  public getByIdFromHistoryForLastHour(currencyId: string): Promise<Currency | null> {
    return this.currenciesRepository.getByIdForLastHour(currencyId);
  }

  public async getAllFromApi(): Promise<Currency[] | []> {
    const response: Response = await fetch(currenciesConstants.endpoints.getAll);
    const currencies: CurrencyApi[] | [] = await response.json();

    if (currencies.length === 0) {
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars,camelcase
    return (currencies as CurrencyApi[]).map(({ base_ccy, ...currency }: CurrencyApi): Currency => ({
      ...currency,
      buy: Number(currency.buy),
      sale: Number(currency.sale),
      baseCcy: base_ccy,
    }));
  }
}
