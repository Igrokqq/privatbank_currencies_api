import { Types } from 'mongoose';

export interface ValidateUserOutput {
  readonly id: Types.ObjectId;
  readonly email: string;
}
