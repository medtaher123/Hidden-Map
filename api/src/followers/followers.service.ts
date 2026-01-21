import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follower } from './entities/follower.entity';
import { CreateFollowerDto } from './dto/create-follower.dto';

@Injectable()
export class FollowersService {
  constructor(
    @InjectRepository(Follower)
    private readonly followerRepository: Repository<Follower>,
  ) {}

  async create(createFollowerDto: CreateFollowerDto): Promise<Follower> {
    const follower = this.followerRepository.create({
      user: { id: createFollowerDto.userId },
      followerUser: { id: createFollowerDto.followerUserId },
    });
    return this.followerRepository.save(follower);
  }

  async remove(userId: string, followerUserId: string): Promise<void> {
    const follower = await this.followerRepository.findOne({
      where: {
        user: { id: userId },
        followerUser: { id: followerUserId },
      },
    });
    if (follower) {
      await this.followerRepository.remove(follower);
    }
  }

  async isFollowing(userId: string, followerUserId: string): Promise<boolean> {
    const follower = await this.followerRepository.findOne({
      where: {
        user: { id: userId },
        followerUser: { id: followerUserId },
      },
    });
    return !!follower;
  }

  async getFollowers(userId: string): Promise<Follower[]> {
    return this.followerRepository.find({
      where: { user: { id: userId } },
      relations: ['followerUser'],
    });
  }

  async getFollowing(userId: string): Promise<Follower[]> {
    return this.followerRepository.find({
      where: { followerUser: { id: userId } },
      relations: ['user'],
    });
  }
}

