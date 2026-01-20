import { Controller, Get } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private leaderboardService: LeaderboardService) {}

  @Public()
  @Get()
  async getLeaderboard() {
    return this.leaderboardService.getTopUsers();
  }
}
