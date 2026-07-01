import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  name!: string;

  @Column('simple-array', { nullable: true })
  permissions!: string[];
    
  @OneToMany(() => User, (user) => user.role)
  users!: User[];  
}
