import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesModule } from 'src/roles/roles.module';
import { Password } from './entities/password.entity';
import { AuthModule } from 'src/auth/auth.module';
import { RolesGuard } from 'src/core/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from 'src/core/guards/permissions.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Password]),
    RolesModule,
    AuthModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, RolesGuard, Reflector, PermissionsGuard],
  exports: [TypeOrmModule],
})
export class UsersModule {}
