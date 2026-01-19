import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TimestampEntity } from '../../shared/entities/timestamp.entity';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  LOCATION_APPROVED = 'location_approved',
  LOCATION_REJECTED = 'location_rejected',
  COMMENT = 'comment',
  RATING = 'rating',
  POINTS_AWARDED = 'points_awarded',
}

@Entity('notifications')
export class Notification extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column('text')
  message: string;

  @Column({ default: false })
  read: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    locationId?: string;
    locationName?: string;
    points?: number;
  };
}
