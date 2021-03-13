import { Types } from 'mongoose';

export interface JwtStrategyValidate {
  readonly id: Types.ObjectId;
  readonly email: string;
}
