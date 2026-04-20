import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateFlowDto, UpdateFlowDto } from './flows.dto';
import { FlowsService } from './flows.service';

@Controller('flows')
@UseGuards(JwtAuthGuard)
export class FlowsController {
  constructor(private flows: FlowsService) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.flows.listMyFlows(user.id);
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateFlowDto) {
    return this.flows.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateFlowDto,
  ) {
    return this.flows.update(user.id, id, dto);
  }

  @Post(':id/publish')
  publish(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.flows.publish(user.id, id);
  }

  @Post(':id/archive')
  archive(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.flows.archive(user.id, id);
  }
}

