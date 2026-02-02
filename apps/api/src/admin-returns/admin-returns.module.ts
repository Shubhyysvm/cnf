import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReturnEntity } from '../entities/return.entity';
import { AdminReturnsService } from './admin-returns.service';
import { AdminReturnsController } from './admin-returns.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReturnEntity])],
  providers: [AdminReturnsService],
  controllers: [AdminReturnsController],
})
export class AdminReturnsModule {}
