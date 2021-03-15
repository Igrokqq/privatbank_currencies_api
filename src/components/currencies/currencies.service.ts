import { Injectable } from '@nestjs/common';
import fetch, { Response } from 'node-fetch';
import { classToPlain, plainToClass } from 'class-transformer';
import CurrencyDto from './dto/currency.dto';
import currenciesConstants from './currencies.constants';
import CurrenciesRepository from './currencies.repository';
import { CurrencyApi } from './interfaces/currency-api.interface';

@Injectable()
export default class CurrenciesService {
  constructor(private readonly currenciesRepository: CurrenciesRepository) {}

  public updateHistory(currencies: CurrencyDto[]): Promise<void> {
    return this.currenciesRepository.updateMany(currencies);
  }

  public getAllHistoryForLastHour(): Promise<CurrencyDto[]> {
    return this.currenciesRepository.getAllForLastHour();
  }

  public getByIdFromHistoryForLastHour(currencyId: string): Promise<CurrencyDto | null> {
    return this.currenciesRepository.getByIdForLastHour(currencyId);
  }

  public async getAllFromApi(): Promise<CurrencyDto[]> {
    const response: Response = await fetch(currenciesConstants.endpoints.getAll);
    const currencies: CurrencyApi[] = await response.json();

    if (!currencies.length) {
      return [];
    }

    return currencies.map((currencyFromApi: CurrencyApi): CurrencyDto => {
      return classToPlain(
        plainToClass(CurrencyDto, currencyFromApi, { excludeExtraneousValues: true }),
      ) as CurrencyDto;
    });
  }
}
