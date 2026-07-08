import { IsBoolean, IsOptional } from 'class-validator';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email', 'password']),
) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
