import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { normalizeEmail } from 'src/common/utils/email.util';

export class CreateUserDto {
  @Transform(({ value }) => normalizeEmail(value))
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @IsString()
  @IsOptional()
  roleName!: string;
}
