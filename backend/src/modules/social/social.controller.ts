import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SocialService } from './social.service';
import {
  BoostPostDto,
  CreateCommentDto,
  CreatePostDto,
} from './social.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('social')
@UseGuards(JwtAuthGuard)
export class SocialController {
  constructor(private social: SocialService) {}

  @Get('feed')
  feed(
    @CurrentUser() user: { id: string },
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.social.feed(
      user.id,
      limit ? parseInt(limit, 10) : 30,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Get('users/:id/posts')
  userPosts(
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.social.byUser(
      id,
      limit ? parseInt(limit, 10) : 30,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Post('posts')
  create(@CurrentUser() user: { id: string }, @Body() dto: CreatePostDto) {
    return this.social.createPost(user.id, dto.body, dto.imageUrl);
  }

  @Delete('posts/:id')
  remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.social.deletePost(user.id, id);
  }

  @Post('posts/:id/like')
  toggleLike(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.social.toggleLike(user.id, id);
  }

  @Get('posts/:id/comments')
  comments(
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.social.comments(
      id,
      limit ? parseInt(limit, 10) : 50,
      offset ? parseInt(offset, 10) : 0,
    );
  }

  @Post('posts/:id/comments')
  comment(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.social.addComment(user.id, id, dto.body);
  }

  @Post('posts/:id/boost')
  boost(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: BoostPostDto,
  ) {
    return this.social.boost(user.id, id, dto.hours);
  }
}
