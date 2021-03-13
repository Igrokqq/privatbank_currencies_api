import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import currenciesConstants from './currencies.constants';
import CurrenciesController from './currencies.controller';
import { CurrenciesSchema } from './schemas/currencies.schema';
import CurrenciesRepository from './currencies.repository';
import CurrenciesService from './currencies.service';

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: currenciesConstants.models.currencies,
      schema: CurrenciesSchema,
    }]),
  ],
  controllers: [CurrenciesController],
  providers: [CurrenciesService, CurrenciesRepository],
  exports: [],
})
export default class CurrenciesModule {}
