import { Controller, Get, Post, Put, Param, Body, Query, ValidationPipe } from '@nestjs/common';
import { AdminSettingsService, SettingDef, SettingCategory } from './admin-settings.service';

@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly adminSettingsService: AdminSettingsService) {}

  /**
   * Get all settings
   */
  @Get()
  async getAllSettings(): Promise<Record<string, any>> {
    return this.adminSettingsService.getAllSettings();
  }

  /**
   * Get settings by category
   */
  @Get('category/:category')
  async getSettingsByCategory(@Param('category') category: string): Promise<any> {
    return this.adminSettingsService.getSettingsByCategory(category);
  }

  /**
   * Get single setting
   */
  @Get(':key')
  async getSetting(@Param('key') key: string): Promise<any> {
    const value = await this.adminSettingsService.getSetting(key);
    return { key, value };
  }

  /**
   * Update single setting
   */
  @Put(':key')
  async setSetting(
    @Param('key') key: string,
    @Body() { value }: { value: any },
  ): Promise<any> {
    return this.adminSettingsService.setSetting(key, value);
  }

  /**
   * Update multiple settings
   */
  @Put()
  async updateSettings(@Body() updates: Record<string, any>): Promise<any> {
    return this.adminSettingsService.updateSettings(updates);
  }

  /**
   * Get setting definitions
   */
  @Get('meta/definitions')
  async getDefinitions(): Promise<SettingDef[]> {
    return this.adminSettingsService.getDefinitions();
  }

  /**
   * Get setting definitions by category
   */
  @Get('meta/definitions/:category')
  async getDefinitionsByCategory(@Param('category') category: string): Promise<SettingDef[]> {
    return this.adminSettingsService.getDefinitionsByCategory(category);
  }

  /**
   * Get all categories
   */
  @Get('meta/categories')
  async getCategories(): Promise<Record<string, SettingCategory>> {
    return this.adminSettingsService.getCategories();
  }
}
