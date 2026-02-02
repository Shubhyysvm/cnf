import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteSetting } from '../entities/site-setting.entity';
import { AdminSettingsService } from './admin-settings.service';
import { AdminSettingsController } from './admin-settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SiteSetting])],
  providers: [AdminSettingsService],
  controllers: [AdminSettingsController],
  exports: [AdminSettingsService],
})
export class AdminSettingsModule {}
