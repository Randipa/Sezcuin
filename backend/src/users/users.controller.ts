import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { Roles } from 'src/core/decorators/roles.decorator';
import { Permissions } from 'src/core/decorators/permissions.decorator';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { PermissionsGuard } from 'src/core/guards/permissions.guard';
import { ApiBearerAuth, ApiTags } from 'node_modules/@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @Roles('ADMIN')
  @Permissions('user:create')
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @Get()
  @Roles('ADMIN')
  @Permissions('user:read')
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  findAll() {
    return this.usersService.findAll();
  }
  //Get user by id with role assignment
  @Get(':id')
  @Roles('ADMIN')
  @Permissions('user:read')
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @Permissions('user:update')
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @Permissions('user:delete')
  @UseGuards(JwtAuthGuard, PermissionsGuard, RolesGuard)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
