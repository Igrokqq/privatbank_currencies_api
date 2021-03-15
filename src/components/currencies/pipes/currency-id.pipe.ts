import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import currenciesConstants from '../currencies.constants';

@Injectable()
export default class ParseCurrencyIdPipe implements PipeTransform {
  public transform(currency: string): string | never {
    const currencyInUpperCase: string = currency.toUpperCase();

    if (currenciesConstants.allowed.includes(currencyInUpperCase)) {
      return currencyInUpperCase;
    }

    throw new BadRequestException(`
      Validation failed, ${currency} is not allowed. Allowed currencies ${currenciesConstants.allowed.join()}`);
  }
}
