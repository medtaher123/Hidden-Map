import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { Public } from '../auth/decorators/public.decorator';

@Controller('locations/:locationId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  addComment(
    @Param('locationId') locationId: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() user: User,
  ) {
    return this.commentsService.create(user.id, locationId, createCommentDto.commentText);
  }

  @Public()
  @Get()
  getComments(@Param('locationId') locationId: string) {
    return this.commentsService.getCommentsByLocation(locationId);
  }

  @Delete(':id')
  deleteComment(@Param('id') id: string, @CurrentUser() user: User) {
    // TODO: Add authorization check to ensure user owns the comment
    return this.commentsService.remove(id);
  }
}

