import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { AppModule } from './app.module';
import { Role } from './roles/entities/role.entity';
import { User } from './users/entities/user.entity';
import { Password } from './users/entities/password.entity';

const ADMIN_PERMISSIONS = [
  'user:read',
  'user:create',
  'user:update',
  'user:delete',
  'role:read',
  'role:create',
  'role:update',
  'role:delete',
];

/**
 * Idempotent bootstrap script. Since user and role management endpoints are
 * ADMIN-only by design, the very first ADMIN role and account can't be
 * created through the API - it has to exist before anyone can log in.
 * Safe to run multiple times: it only creates what's missing.
 */
async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const roleRepository = app.get<Repository<Role>>(getRepositoryToken(Role));
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  const passwordRepository = app.get<Repository<Password>>(
    getRepositoryToken(Password),
  );

  let adminRole = await roleRepository.findOne({ where: { name: 'ADMIN' } });
  if (!adminRole) {
    adminRole = await roleRepository.save(
      roleRepository.create({ name: 'ADMIN', permissions: ADMIN_PERMISSIONS }),
    );
    console.log('Created ADMIN role');
  } else {
    // The ADMIN role must always carry the full permission set, even in
    // environments seeded before new guarded resources (e.g. Roles) existed.
    const missingPermissions = ADMIN_PERMISSIONS.filter(
      (permission) => !adminRole!.permissions?.includes(permission),
    );
    if (missingPermissions.length) {
      adminRole.permissions = [
        ...(adminRole.permissions ?? []),
        ...missingPermissions,
      ];
      adminRole = await roleRepository.save(adminRole);
      console.log(
        `Updated ADMIN role, added missing permissions: ${missingPermissions.join(', ')}`,
      );
    } else {
      console.log('ADMIN role already exists and is up to date, skipping');
    }
  }

  const userRole = await roleRepository.findOne({ where: { name: 'USER' } });
  if (!userRole) {
    await roleRepository.save(
      roleRepository.create({ name: 'USER', permissions: [] }),
    );
    console.log('Created USER role');
  } else {
    console.log('USER role already exists, skipping');
  }

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@sezcuin.com';
  const existingAdmin = await userRepository.findOne({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@12345';

    const admin = await userRepository.save(
      userRepository.create({
        email: adminEmail,
        firstName: process.env.SEED_ADMIN_FIRST_NAME ?? 'System',
        lastName: process.env.SEED_ADMIN_LAST_NAME ?? 'Administrator',
        role: adminRole,
      }),
    );

    const passwordHash = await bcrypt.hash(
      adminPassword,
      await bcrypt.genSalt(10),
    );
    await passwordRepository.save(
      passwordRepository.create({ passwordHash, user: admin }),
    );

    console.log(`Created ADMIN user ${adminEmail}`);
    console.log(
      `Sign in with email "${adminEmail}" and the password from SEED_ADMIN_PASSWORD (default: "${adminPassword}"). Change it after first login.`,
    );
  } else {
    console.log(`Admin user ${adminEmail} already exists, skipping`);
  }

  await app.close();
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exitCode = 1;
});
