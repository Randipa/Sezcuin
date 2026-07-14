import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Password } from './entities/password.entity';
import { Role } from 'src/roles/entities/role.entity';
import * as bcrypt from 'bcryptjs';
import { MailService } from 'src/mail/mail.service';
import {
  generateInviteToken,
  getInviteExpiryDate,
  hashInviteToken,
} from 'src/common/utils/invite-token.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Password)
    private readonly passwordRepository: Repository<Password>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    @Inject(MailService) private readonly mailService: MailService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<User> {
    const { email, firstName, lastName, roleName } = createUserDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const targetRoleName = roleName ? roleName.toUpperCase() : 'USER';
    const role = await this.roleRepository.findOne({
      where: { name: targetRoleName },
    });
    if (!role) {
      throw new NotFoundException(
        `Role with name ${targetRoleName} does not exist`,
      );
    }

    const inviteToken = generateInviteToken();
    const inviteTokenHash = hashInviteToken(inviteToken);

    const placeholderPassword = await bcrypt.hash(
      generateInviteToken(),
      await bcrypt.genSalt(10),
    );

    const newUser = this.userRepository.create({
      email,
      firstName,
      lastName,
      role,
      mustChangePassword: true,
      inviteTokenHash,
      inviteTokenExpiresAt: getInviteExpiryDate(),
    });
    const savedUser = await this.userRepository.save(newUser);

    const userPassword = this.passwordRepository.create({
      passwordHash: placeholderPassword,
      user: savedUser,
    });
    await this.passwordRepository.save(userPassword);

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3002';
    const inviteUrl = `${frontendUrl}/invite?token=${inviteToken}`;

    try {
      await this.mailService.sendInviteEmail({
        to: email,
        firstName,
        inviteUrl,
      });
    } catch (error) {
      await this.passwordRepository.delete({ user: { id: savedUser.id } });
      await this.userRepository.remove(savedUser);
      throw error;
    }

    return savedUser;
  }

  async findAll() {
    return this.userRepository.find({
      relations: { role: true },
    });
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { role: true },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { roleName, ...userData } = updateUserDto;

    const user = await this.userRepository.findOne({
      where: { id },
      relations: { role: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    Object.assign(user, userData);

    if (roleName) {
      const role = await this.roleRepository.findOne({
        where: { name: roleName },
      });
      if (!role) {
        throw new NotFoundException(
          `Role with name ${roleName} does not exist`,
        );
      }
      user.role = role;
    }

    return await this.userRepository.save(user);
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.remove(user);
    return { id };
  }
}
