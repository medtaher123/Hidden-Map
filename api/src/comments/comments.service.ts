import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async create(userId: string, locationId: string, commentText: string): Promise<Comment> {
    const comment = this.commentRepository.create({
      commentText,
      user: { id: userId },
      location: { id: locationId },
    });
    return this.commentRepository.save(comment);
  }

  async getCommentsByLocation(locationId: string): Promise<Comment[]> {
    return this.commentRepository.find({
      where: { location: { id: locationId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string): Promise<void> {
    await this.commentRepository.softDelete(id);
  }
}

