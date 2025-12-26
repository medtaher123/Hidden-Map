import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TimestampEntity } from '../../shared/entities/timestamp.entity';
import { Photo } from './photo.entity';
import { Rating } from '../../ratings/entities/rating.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Favorite } from '../../favorites/entities/favorite.entity';

@Entity('locations')
export class Location extends TimestampEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  category: string; // Can be replaced with enum when adding filter options to the map

  @Column('decimal', { precision: 10, scale: 8 })
  latitude: number;

  @Column('decimal', { precision: 11, scale: 8 })
  longitude: number;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @OneToMany(() => Photo, (photo) => photo.location, { cascade: true })
  photos: Photo[];

  @OneToMany(() => Rating, (rating) => rating.location)
  ratings: Rating[];

  @OneToMany(() => Comment, (comment) => comment.location)
  comments: Comment[];

  @OneToMany(() => Favorite, (favorite) => favorite.location)
  favorites: Favorite[];
}
