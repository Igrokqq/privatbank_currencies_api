import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import {
  Schema,
  Document,
  Types,
} from 'mongoose';
import currenciesConstants from '../currencies.constants';

export class CurrenciesEntity extends Document {
  @ApiProperty({ type: String })
  readonly _id: Types.ObjectId = new ObjectId();

  @ApiProperty({ type: String })
  readonly ccy: string = '';

  @ApiProperty({ type: String })
  readonly baseCcy: string = '';

  @ApiProperty({ type: Number })
  readonly buy: number = 0;

  @ApiProperty({ type: Number })
  readonly sale: number = 0;

  @ApiProperty({ type: Date })
  readonly createdAt: Date = new Date();

  @ApiProperty({ type: Date })
  readonly updatedAt: Date = new Date();
}

export const CurrenciesSchema = new Schema({
  ccy: {
    type: String,
    required: true,
  },
  baseCcy: {
    type: String,
    required: true,
  },
  buy: {
    type: Number,
    required: true,
  },
  sale: {
    type: Number,
    required: true,
  },
}, {
  versionKey: false,
  timestamps: true,
  collection: currenciesConstants.models.currencies,
});
