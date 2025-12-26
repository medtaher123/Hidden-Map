import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { TimestampEntity } from '../../shared/entities/timestamp.entity';

@Entity('users')
export class User extends TimestampEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;
}
