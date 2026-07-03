import { ConflictException, Injectable } from '@nestjs/common';
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
      throw new ConflictException(`Role with name ${normalizedName} already exists`);
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

  findOne(id: string) {
    return `This action returns a #${id} role`;
  }

  update(id: string, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: string) {
    return `This action removes a #${id} role`;
  }
}
