import { IsEmail, IsNotEmpty, IsString, Min, MinLength } from "class-validator";

export class CreateUserDto {

    @IsEmail({}, { message: 'Invalid email address' })
    email!: string;

    @IsString()
    @IsNotEmpty()
    firstName!: string;

    @IsString()
    @IsNotEmpty()
    lastName!: string;

    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password!: string;

    @IsString()
    @IsNotEmpty()
    roleName!: string;
}
