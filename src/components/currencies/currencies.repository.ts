import moment from 'moment';
import { ClientSession, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import CurrencyDto from './dto/currency.dto';
import currenciesConstants from './currencies.constants';
import { CurrenciesEntity } from './schemas/currencies.schema';

@Injectable()
export default class CurrenciesRepository {
  constructor(
    @InjectModel(currenciesConstants.models.currencies) private currenciesModel: Model<CurrenciesEntity>,
  ) {}

  public getAllForLastHour(): Promise<CurrencyDto[]> {
    return this.currenciesModel.find({
      updatedAt: {
        $gt: moment.utc().subtract(1, 'hour').toDate(),
      },
    }, {
      ccy: 1,
      buy: 1,
      sale: 1,
      baseCcy: 1,
      _id: 0,
    })
      .lean()
      .exec();
  }

  public getByIdForLastHour(currencyId: string): Promise<CurrencyDto | null> {
    return this.currenciesModel.findOne({
      ccy: currencyId,
      updatedAt: {
        $gt: moment().utc().subtract(1, 'hour').toDate(),
      },
    }, {
      ccy: 1,
      buy: 1,
      sale: 1,
      baseCcy: 1,
      _id: 0,
    })
      .lean()
      .exec();
  }

  public async updateMany(currencies: CurrencyDto[]): Promise<void> {
    const session: ClientSession = await this.currenciesModel.db.startSession();

    await session.withTransaction(async (): Promise<void> => {
      await Promise.all(currencies.map((currency: CurrencyDto) => {
        return this.currenciesModel.updateOne(
          {
            ccy: currency.ccy,
          },
          {
            $set: currency,
          },
          {
            session,
            upsert: true,
          },
        );
      }));
    });

    session.endSession();
  }
}
