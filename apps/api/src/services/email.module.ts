import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { MasterAdminPreference } from '../entities/master-admin-preference.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MasterAdminPreference])],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
