import {
  Exclude,
  Expose,
  Transform,
  Type,
} from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export default class CurrencyDto {
  @ApiProperty({ type: String })
  @Expose()
  readonly ccy: string = '';

  @ApiProperty({ type: String })
  @Expose({ name: 'base_ccy' })
  readonly baseCcy: string = '';

  @ApiProperty({ type: Number })
  @Expose()
  @Type(() => Number)
  @Transform((value: string) => Number(value))
  readonly buy: string = '';

  @ApiProperty({ type: Number })
  @Expose()
  @Type(() => Number)
  @Transform((value: string) => Number(value))
  readonly sale: string = '';
}
