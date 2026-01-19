import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getTopUsers(limit: number = 50) {
    return this.userRepository.find({
      select: ['id', 'name', 'email', 'avatarUrl', 'points'],
      where: { isActive: true },
      order: { points: 'DESC' },
      take: limit,
    });
  }

  async addPoints(userId: string, points: number) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (user) {
      user.points += points;
      return this.userRepository.save(user);
    }
  }
}
