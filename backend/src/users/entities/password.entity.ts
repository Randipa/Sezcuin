import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('passwords')
export class Password {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'password_hash', select: false })
  passwordHash!: string;

  @OneToOne(() => User, (user) => user.password, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
