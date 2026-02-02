import { Controller, Get, Post, Body } from '@nestjs/common';
import { SiteSettingsService } from './site-settings.service';

@Controller('site-settings')
export class SiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Get()
  async getAllSettings() {
    // Returns all settings as key-value pairs
    // For admin UI
    return {
      freeShippingThreshold: await this.siteSettingsService.getSetting('freeShippingThreshold'),
      shippingCost: await this.siteSettingsService.getSetting('shippingCost'),
    };
  }

  @Post()
  async setSetting(@Body() body: { key: string; value: string }) {
    return this.siteSettingsService.setSetting(body.key, body.value);
  }
}
