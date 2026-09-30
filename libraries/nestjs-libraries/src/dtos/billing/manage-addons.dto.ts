import { IsIn, IsInt, Min } from 'class-validator';
import {
  ADDONS,
  AddonType,
} from '@validpost/nestjs-libraries/database/prisma/subscriptions/pricing';

export class ManageAddonsDto {
  @IsIn(Object.keys(ADDONS))
  type!: AddonType;

  @IsInt()
  @Min(1)
  packs!: number;
}
