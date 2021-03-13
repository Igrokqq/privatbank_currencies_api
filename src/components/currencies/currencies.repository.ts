import moment from 'moment';
import { ClientSession, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { UpdateResponse } from '@interfaces/update-response.interface';
import currenciesConstants from './currencies.constants';
import { CurrenciesEntity } from './schemas/currencies.schema';
import { Currency } from './interfaces/currency.interface';

@Injectable()
export default class CurrenciesRepository {
  constructor(
    @InjectModel(currenciesConstants.models.currencies) private currenciesModel: Model<CurrenciesEntity>,
  ) {}

  public getAllForLastHour(): Promise<Currency[] | []> {
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

  public getByIdForLastHour(currencyId: string): Promise<Currency | null> {
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

  public async updateMany(currencies: Currency[]): Promise<UpdateResponse[] | []> {
    const session: ClientSession = await this.currenciesModel.db.startSession();
    session.startTransaction();

    const promises = currencies.map((currency: Currency) => {
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
    });

    const updateResponses: UpdateResponse[] | [] = await Promise.all(promises);

    await session.commitTransaction();
    session.endSession();

    return updateResponses;
  }
}
