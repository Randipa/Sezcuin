import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { AuthenticatedUserPayload } from 'src/core/types/authenticated-request';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  permissions: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in configuration');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUserPayload> {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: { role: true },
      select: {
        id: true,
        email: true,
        isActive: true,
        role: { id: true, name: true, permissions: true },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException(
        'Your session has ended because your account was deactivated.',
      );
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role.name,
      permissions: user.role.permissions ?? [],
    };
  }
}
