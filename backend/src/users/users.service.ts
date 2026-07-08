import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Password } from './entities/password.entity';
import { Role } from 'src/roles/entities/role.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Password)
    private readonly passwordRepository: Repository<Password>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<User> {
    const { email, firstName, lastName, password, roleName } = createUserDto;

    // Check if the email exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const targetRoleName = roleName ? roleName.toUpperCase() : 'USER';
    //check if the role exists
    const role = await this.roleRepository.findOne({
      where: { name: targetRoleName },
    });
    if (!role) {
      throw new NotFoundException(
        `Role with name ${targetRoleName} does not exist`,
      );
    }

    //password hashing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user
    const newUser = this.userRepository.create({
      email,
      firstName,
      lastName,
      role,
    });
    const savedUser = await this.userRepository.save(newUser);

    const userPassword = this.passwordRepository.create({
      passwordHash: hashedPassword,
      user: savedUser,
    });
    await this.passwordRepository.save(userPassword);
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

  //Update user method with role assignment
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
