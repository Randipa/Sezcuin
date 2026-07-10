import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Password } from 'src/users/entities/password.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { hashInviteToken } from 'src/common/utils/invite-token.util';

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

    const user = await this.userRepository.findOne({
      where: { email },
      relations: { role: true },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const userPassword = await this.passwordRepository.findOne({
      where: { user: { id: user.id } },
      select: { id: true, passwordHash: true },
    });

    if (!userPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordMatch = await bcrypt.compare(
      password,
      userPassword.passwordHash,
    );
    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new ForbiddenException(
        'Your account has been deactivated. Please contact an administrator.',
      );
    }

    return this.buildAuthResponse(user);
  }

  async acceptInvite(token: string) {
    const inviteTokenHash = hashInviteToken(token);

    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.inviteTokenHash')
      .addSelect('user.inviteTokenExpiresAt')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.inviteTokenHash = :inviteTokenHash', { inviteTokenHash })
      .getOne();

    if (!user?.inviteTokenExpiresAt || user.inviteTokenExpiresAt < new Date()) {
      throw new BadRequestException('This invitation link is invalid or has expired.');
    }

    if (!user.isActive) {
      throw new ForbiddenException(
        'Your account has been deactivated. Please contact an administrator.',
      );
    }

    user.inviteTokenHash = null;
    user.inviteTokenExpiresAt = null;
    user.mustChangePassword = true;
    await this.userRepository.save(user);

    return this.buildAuthResponse(user);
  }

  async changePassword(userId: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const userPassword = await this.passwordRepository.findOne({
      where: { user: { id: userId } },
      select: { id: true, passwordHash: true },
    });

    if (!userPassword) {
      throw new UnauthorizedException('User not found');
    }

    userPassword.passwordHash = await bcrypt.hash(
      newPassword,
      await bcrypt.genSalt(10),
    );
    await this.passwordRepository.save(userPassword);

    user.mustChangePassword = false;
    await this.userRepository.save(user);

    return { message: 'Password updated successfully' };
  }

  private async buildAuthResponse(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role.name,
      permissions: user.role.permissions,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      mustChangePassword: user.mustChangePassword,
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
