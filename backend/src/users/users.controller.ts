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
import { Permissions } from 'src/core/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/core/guards/permissions.guard';
import { ApiBearerAuth, ApiTags } from 'node_modules/@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @Permissions('user:create')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  async register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @Get()
  @Permissions('user:read')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  findAll() {
    return this.usersService.findAll();
  }
  //Get user by id with role assignment
  @Get(':id')
  @Permissions('user:read')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Permissions('user:update')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Permissions('user:delete')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
