import { OmitType } from '@nestjs/swagger';
import { CurrenciesEntity } from '../schemas/currencies.schema';

export default OmitType(CurrenciesEntity, ['_id', 'createdAt', 'updatedAt'] as const);
