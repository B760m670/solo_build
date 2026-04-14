import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ServicesService } from './services.service';
import { DecodeTransactionDto, InspectAddressDto } from './services.dto';

@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Post('ton/address-inspect')
  inspectAddress(@Body() dto: InspectAddressDto) {
    return this.servicesService.inspectTonAddress(dto.address);
  }

  @Post('ton/tx-decode')
  decodeTransaction(@Body() dto: DecodeTransactionDto) {
    return this.servicesService.decodeTonTransaction(dto.txRef);
  }
}
