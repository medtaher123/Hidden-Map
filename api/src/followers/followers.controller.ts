import { Controller, Post, Delete, Get, Param, Body } from '@nestjs/common';
import { FollowersService } from './followers.service';
import { CreateFollowerDto } from './dto/create-follower.dto';

@Controller('users/:userId/follow')
export class FollowersController {
  constructor(private readonly followersService: FollowersService) {}

  @Post()
  followUser(
    @Param('userId') userId: string,
    @Body() createFollowerDto: CreateFollowerDto,
  ) {
    return this.followersService.create({
      ...createFollowerDto,
    });
  }

  @Delete()
  unfollowUser(
    @Param('userId') userId: string,
    @Body() body: { followerUserId: string },
  ) {
    return this.followersService.remove(userId, body.followerUserId);
  }

  @Get('followers')
  getFollowers(@Param('userId') userId: string) {
    return this.followersService.getFollowers(userId);
  }

  @Get('following')
  getFollowing(@Param('userId') userId: string) {
    return this.followersService.getFollowing(userId);
  }

  @Get('is-following/:followerUserId')
  isFollowing(
    @Param('userId') userId: string,
    @Param('followerUserId') followerUserId: string,
  ) {
    return this.followersService.isFollowing(userId, followerUserId);
  }
}

