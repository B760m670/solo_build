import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFlowDto, UpdateFlowDto } from './flows.dto';

@Injectable()
export class FlowsService {
  constructor(private prisma: PrismaService) {}

  listMyFlows(ownerId: string) {
    return this.prisma.flow.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      include: { steps: { orderBy: { idx: 'asc' } } },
    });
  }

  create(ownerId: string, dto: CreateFlowDto) {
    return this.prisma.flow.create({
      data: {
        ownerId,
        name: dto.name,
        status: 'DRAFT',
        triggerType: dto.triggerType,
        triggerConfig: (dto.triggerConfig as Prisma.InputJsonValue) ?? undefined,
      },
      include: { steps: { orderBy: { idx: 'asc' } } },
    });
  }

  async update(ownerId: string, flowId: string, dto: UpdateFlowDto) {
    const flow = await this.prisma.flow.findUnique({ where: { id: flowId } });
    if (!flow) throw new NotFoundException('Flow not found');
    if (flow.ownerId !== ownerId) throw new ForbiddenException('Not your flow');

    return this.prisma.flow.update({
      where: { id: flowId },
      data: {
        name: dto.name ?? undefined,
        status: dto.status ?? undefined,
      },
      include: { steps: { orderBy: { idx: 'asc' } } },
    });
  }

  async publish(ownerId: string, flowId: string) {
    const flow = await this.prisma.flow.findUnique({ where: { id: flowId } });
    if (!flow) throw new NotFoundException('Flow not found');
    if (flow.ownerId !== ownerId) throw new ForbiddenException('Not your flow');

    return this.prisma.flow.update({
      where: { id: flowId },
      data: { status: 'PUBLISHED' },
      include: { steps: { orderBy: { idx: 'asc' } } },
    });
  }

  async archive(ownerId: string, flowId: string) {
    const flow = await this.prisma.flow.findUnique({ where: { id: flowId } });
    if (!flow) throw new NotFoundException('Flow not found');
    if (flow.ownerId !== ownerId) throw new ForbiddenException('Not your flow');

    return this.prisma.flow.update({
      where: { id: flowId },
      data: { status: 'ARCHIVED' },
      include: { steps: { orderBy: { idx: 'asc' } } },
    });
  }
}
