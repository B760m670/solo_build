import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AiService } from './ai.service';
import { SendMessageDto } from './ai.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private ai: AiService) {}

  @Get('usage')
  usage(@CurrentUser() user: { id: string }) {
    return this.ai.getUsage(user.id);
  }

  @Get('chats')
  chats(@CurrentUser() user: { id: string }) {
    return this.ai.listChats(user.id);
  }

  @Get('chats/:id')
  chat(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.ai.getChat(user.id, id);
  }

  @Delete('chats/:id')
  deleteChat(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.ai.deleteChat(user.id, id);
  }

  @Post('send')
  send(@CurrentUser() user: { id: string }, @Body() dto: SendMessageDto) {
    return this.ai.sendMessage(user.id, dto.message, dto.chatId);
  }
}
