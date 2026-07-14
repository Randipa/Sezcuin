import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { normalizeEmail } from 'src/common/utils/email.util';

export class LoginDto {
  @Transform(({ value }) => normalizeEmail(value))
  @IsEmail({}, { message: 'Invalid email address' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password!: string;
}
