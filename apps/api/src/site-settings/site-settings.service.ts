import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSetting } from '../entities/site-setting.entity';

@Injectable()
export class SiteSettingsService {
  constructor(
    @InjectRepository(SiteSetting)
    private readonly siteSettingRepository: Repository<SiteSetting>,
  ) {}

  async getSetting(key: string): Promise<string | null> {
    const setting = await this.siteSettingRepository.findOne({ where: { key } });
    return setting ? setting.value : null;
  }

  async setSetting(key: string, value: string): Promise<SiteSetting> {
    let setting = await this.siteSettingRepository.findOne({ where: { key } });
    if (setting) {
      setting.value = value;
      return this.siteSettingRepository.save(setting);
    } else {
      setting = this.siteSettingRepository.create({ key, value });
      return this.siteSettingRepository.save(setting);
    }
  }
}
