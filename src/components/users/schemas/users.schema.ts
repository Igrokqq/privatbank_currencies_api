import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
import { Schema, Document, Types } from 'mongoose';
import usersConstants from '../users.constants';

export class UserEntity extends Document {
  @ApiProperty({ type: String })
  readonly _id: Types.ObjectId = new ObjectId();

  @ApiProperty({ type: String })
  readonly email: string = '';

  @ApiProperty({ type: String })
  readonly password: string = '';

  @ApiProperty({ type: Date })
  readonly createdAt: Date = new Date();

  @ApiProperty({ type: Date })
  readonly updatedAt: Date = new Date();
}

export const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
}, {
  versionKey: false,
  timestamps: true,
  collection: usersConstants.models.users,
});
