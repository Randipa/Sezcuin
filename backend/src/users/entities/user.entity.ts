import { Role } from 'src/roles/entities/role.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Password } from './password.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ default: false })
  mustChangePassword!: boolean;

  @Column({ type: 'varchar', nullable: true, select: false })
  inviteTokenHash!: string | null;

  @Column({ type: 'timestamptz', nullable: true, select: false })
  inviteTokenExpiresAt!: Date | null;

  @ManyToOne(() => Role, (role) => role.users, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'role_id' })
  role!: Role;

  @OneToOne(() => Password, (password) => password.user)
  password!: Password;
}
