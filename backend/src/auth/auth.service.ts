import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Password } from 'src/users/entities/password.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Password)
    private readonly passwordRepository: Repository<Password>,

    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    //user are allready exist
    const user = await this.userRepository.findOne({
      where: { email },
      relations: { role: true },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    //find user hash password
    const userPassword = await this.passwordRepository.findOne({
      where: { user: { id: user.id } },
      select: { id: true, passwordHash: true },
    });

    if (!userPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    //compare password using by bcrypt
    const isPasswordMatch = await bcrypt.compare(
      password,
      userPassword.passwordHash,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
      permissions: user.role.permissions,
    };

    //Return the token and user information
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
      },
    };
  }
}
