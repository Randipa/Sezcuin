import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const { name, permissions } = createRoleDto;

    const normalizedName = name.toUpperCase();
    const existingRole = await this.roleRepository.findOne({
      where: { name: normalizedName },
    });
    if (existingRole) {
      throw new ConflictException(
        `Role with name ${normalizedName} already exists`,
      );
    }

    const newRole = this.roleRepository.create({
      name: normalizedName,
      permissions,
    });

    return this.roleRepository.save(newRole);
  }

  async findAll() {
    return this.roleRepository.find();
  }

  async findOne(id: string) {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.findOne(id);
    const { name, permissions } = updateRoleDto;

    if (name) {
      const normalizedName = name.toUpperCase();
      if (normalizedName !== role.name) {
        const existingRole = await this.roleRepository.findOne({
          where: { name: normalizedName },
        });
        if (existingRole) {
          throw new ConflictException(
            `Role with name ${normalizedName} already exists`,
          );
        }
      }
      role.name = normalizedName;
    }

    if (permissions) {
      role.permissions = permissions;
    }

    return this.roleRepository.save(role);
  }

  async remove(id: string) {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: { users: true },
    });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    if (role.users?.length) {
      throw new ConflictException(
        'Cannot delete a role that is still assigned to one or more users',
      );
    }

    await this.roleRepository.remove(role);
    return { id };
  }
}
