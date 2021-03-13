import {
  PipeTransform,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import currenciesConstants from '../currencies.constants';

@Injectable()
export default class ParseCurrencyIdPipe implements PipeTransform {
  public transform(currency: string): string {
    if (currenciesConstants.allowed.includes(currency)) {
      return currency.toUpperCase();
    }

    throw new BadRequestException(`
      Validation failed, ${currency} is not allowed. Allowed currencies ${currenciesConstants.allowed.join()}`);
  }
}
