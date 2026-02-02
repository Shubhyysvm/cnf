import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSetting } from '../entities/site-setting.entity';

export interface SettingCategory {
  name: string;
  description: string;
}

export interface SettingDef {
  key: string;
  label: string;
  description: string;
  type: 'text' | 'number' | 'boolean' | 'json' | 'email' | 'url' | 'select';
  defaultValue: any;
  category: string;
  options?: Array<{ label: string; value: any }>;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export const ADMIN_SETTINGS_DEFINITIONS: SettingDef[] = [
  // General Settings
  {
    key: 'site_name',
    label: 'Site Name',
    description: 'Your store name displayed across the site',
    type: 'text',
    defaultValue: 'Country Natural Foods',
    category: 'general',
    required: true,
  },
  {
    key: 'site_description',
    label: 'Site Description',
    description: 'Short description for SEO and meta tags',
    type: 'text',
    defaultValue: 'Premium organic and natural foods',
    category: 'general',
  },
  {
    key: 'admin_email',
    label: 'Admin Email',
    description: 'Email for receiving notifications',
    type: 'email',
    defaultValue: 'admin@countrynatural.com',
    category: 'general',
    required: true,
  },
  {
    key: 'support_email',
    label: 'Support Email',
    description: 'Customer support email address',
    type: 'email',
    defaultValue: 'support@countrynatural.com',
    category: 'general',
  },
  {
    key: 'site_url',
    label: 'Site URL',
    description: 'Your store website URL',
    type: 'url',
    defaultValue: 'https://countrynatural.com',
    category: 'general',
    required: true,
  },

  // Shipping Settings
  {
    key: 'free_shipping_threshold',
    label: 'Free Shipping Threshold (₹)',
    description: 'Orders above this amount get free shipping',
    type: 'number',
    defaultValue: 4000,
    category: 'shipping',
    validation: { min: 0 },
  },
  {
    key: 'standard_shipping_cost',
    label: 'Standard Shipping Cost (₹)',
    description: 'Cost for standard delivery',
    type: 'number',
    defaultValue: 500,
    category: 'shipping',
    validation: { min: 0 },
  },
  {
    key: 'express_shipping_cost',
    label: 'Express Shipping Cost (₹)',
    description: 'Cost for express delivery (2-3 days)',
    type: 'number',
    defaultValue: 150,
    category: 'shipping',
    validation: { min: 0 },
  },
  {
    key: 'standard_delivery_days',
    label: 'Standard Delivery Days',
    description: 'Number of days for standard delivery',
    type: 'number',
    defaultValue: 5,
    category: 'shipping',
    validation: { min: 1, max: 30 },
  },
  {
    key: 'express_delivery_days',
    label: 'Express Delivery Days',
    description: 'Number of days for express delivery',
    type: 'number',
    defaultValue: 2,
    category: 'shipping',
    validation: { min: 1, max: 5 },
  },

  // Payment Settings
  {
    key: 'razorpay_key_id',
    label: 'Razorpay Key ID',
    description: 'Your Razorpay API Key ID',
    type: 'text',
    defaultValue: '',
    category: 'payments',
  },
  {
    key: 'razorpay_key_secret',
    label: 'Razorpay Key Secret',
    description: 'Your Razorpay API Key Secret (kept secure)',
    type: 'text',
    defaultValue: '',
    category: 'payments',
  },
  {
    key: 'stripe_api_key',
    label: 'Stripe API Key',
    description: 'Your Stripe API Key',
    type: 'text',
    defaultValue: '',
    category: 'payments',
  },
  {
    key: 'paypal_client_id',
    label: 'PayPal Client ID',
    description: 'Your PayPal Client ID',
    type: 'text',
    defaultValue: '',
    category: 'payments',
  },
  {
    key: 'gst_rate',
    label: 'GST Rate (%)',
    description: 'Goods and Services Tax rate',
    type: 'number',
    defaultValue: 8,
    category: 'payments',
    validation: { min: 0, max: 100 },
  },

  // Order Settings
  {
    key: 'min_order_amount',
    label: 'Minimum Order Amount (₹)',
    description: 'Minimum amount required for checkout',
    type: 'number',
    defaultValue: 100,
    category: 'orders',
    validation: { min: 0 },
  },
  {
    key: 'max_order_amount',
    label: 'Maximum Order Amount (₹)',
    description: 'Maximum amount allowed per order (0 = unlimited)',
    type: 'number',
    defaultValue: 0,
    category: 'orders',
    validation: { min: 0 },
  },
  {
    key: 'order_confirmation_email_enabled',
    label: 'Send Order Confirmation Email',
    description: 'Send confirmation email to customers',
    type: 'boolean',
    defaultValue: true,
    category: 'orders',
  },
  {
    key: 'default_order_status',
    label: 'Default Order Status',
    description: 'Initial status for new orders',
    type: 'select',
    defaultValue: 'pending',
    category: 'orders',
    options: [
      { label: 'Pending', value: 'pending' },
      { label: 'Confirmed', value: 'confirmed' },
      { label: 'Processing', value: 'processing' },
    ],
  },

  // Return & Refund Settings
  {
    key: 'return_window_days',
    label: 'Return Window (Days)',
    description: 'Days allowed for returns after delivery',
    type: 'number',
    defaultValue: 15,
    category: 'returns',
    validation: { min: 1, max: 365 },
  },
  {
    key: 'refund_processing_days',
    label: 'Refund Processing (Days)',
    description: 'Days to process refunds',
    type: 'number',
    defaultValue: 7,
    category: 'returns',
    validation: { min: 1, max: 30 },
  },
  {
    key: 'auto_refund_enabled',
    label: 'Auto-Approve Refunds',
    description: 'Automatically approve refund requests',
    type: 'boolean',
    defaultValue: false,
    category: 'returns',
  },

  // Inventory Settings
  {
    key: 'low_stock_threshold',
    label: 'Low Stock Threshold',
    description: 'Alert when inventory falls below this',
    type: 'number',
    defaultValue: 10,
    category: 'inventory',
    validation: { min: 1 },
  },
  {
    key: 'auto_replenish_enabled',
    label: 'Auto-Replenish Inventory',
    description: 'Automatically create purchase orders',
    type: 'boolean',
    defaultValue: false,
    category: 'inventory',
  },

  // Email Settings
  {
    key: 'smtp_host',
    label: 'SMTP Host',
    description: 'Email server host',
    type: 'text',
    defaultValue: 'smtp.gmail.com',
    category: 'email',
  },
  {
    key: 'smtp_port',
    label: 'SMTP Port',
    description: 'Email server port',
    type: 'number',
    defaultValue: 587,
    category: 'email',
  },
  {
    key: 'smtp_username',
    label: 'SMTP Username',
    description: 'Email account username',
    type: 'email',
    defaultValue: '',
    category: 'email',
  },

  // Security Settings
  {
    key: 'max_login_attempts',
    label: 'Max Login Attempts',
    description: 'Maximum failed login attempts before lockout',
    type: 'number',
    defaultValue: 5,
    category: 'security',
    validation: { min: 1 },
  },
  {
    key: 'session_timeout_minutes',
    label: 'Session Timeout (Minutes)',
    description: 'Auto-logout after this duration',
    type: 'number',
    defaultValue: 30,
    category: 'security',
    validation: { min: 5, max: 480 },
  },
  {
    key: 'enable_two_factor_auth',
    label: 'Enable Two-Factor Auth',
    description: 'Require 2FA for admin logins',
    type: 'boolean',
    defaultValue: false,
    category: 'security',
  },

  // Advanced Settings
  {
    key: 'maintenance_mode',
    label: 'Maintenance Mode',
    description: 'Put store in maintenance mode',
    type: 'boolean',
    defaultValue: false,
    category: 'advanced',
  },
  {
    key: 'maintenance_message',
    label: 'Maintenance Message',
    description: 'Message shown during maintenance',
    type: 'text',
    defaultValue: 'We are currently under maintenance. Please check back soon!',
    category: 'advanced',
  },
  {
    key: 'cache_enabled',
    label: 'Enable Caching',
    description: 'Enable Redis caching for better performance',
    type: 'boolean',
    defaultValue: true,
    category: 'advanced',
  },
  {
    key: 'cache_ttl_hours',
    label: 'Cache TTL (Hours)',
    description: 'How long to cache data',
    type: 'number',
    defaultValue: 24,
    category: 'advanced',
    validation: { min: 1 },
  },
];

export const SETTING_CATEGORIES: Record<string, SettingCategory> = {
  general: { name: 'General', description: 'Basic site settings' },
  shipping: { name: 'Shipping', description: 'Shipping and delivery configuration' },
  payments: { name: 'Payments', description: 'Payment gateway settings' },
  orders: { name: 'Orders', description: 'Order processing settings' },
  returns: { name: 'Returns & Refunds', description: 'Return and refund policies' },
  inventory: { name: 'Inventory', description: 'Stock and inventory management' },
  email: { name: 'Email', description: 'Email notification settings' },
  security: { name: 'Security', description: 'Security and authentication settings' },
  advanced: { name: 'Advanced', description: 'Advanced configuration options' },
};

@Injectable()
export class AdminSettingsService {
  private readonly logger = new Logger(AdminSettingsService.name);

  constructor(
    @InjectRepository(SiteSetting)
    private readonly settingsRepository: Repository<SiteSetting>,
  ) {}

  /**
   * Get all settings
   */
  async getAllSettings(): Promise<Record<string, any>> {
    const settings = await this.settingsRepository.find();
    const result: Record<string, any> = {};

    settings.forEach((setting) => {
      result[setting.key] = this.parseValue(setting.value || '', 'string');
    });

    // Add defaults for missing settings
    ADMIN_SETTINGS_DEFINITIONS.forEach((def) => {
      if (!(def.key in result)) {
        result[def.key] = def.defaultValue;
      }
    });

    return result;
  }

  /**
   * Get settings by category
   */
  async getSettingsByCategory(category: string): Promise<Array<{ definition: SettingDef; value: any }>> {
    const definitions = ADMIN_SETTINGS_DEFINITIONS.filter((def) => def.category === category);
    const settings = await this.settingsRepository.find({
      where: definitions.map((def) => ({ key: def.key })),
    });

    const settingsMap = new Map(settings.map((s) => [s.key, s]));

    return definitions.map((def) => ({
      definition: def,
      value: settingsMap.has(def.key) ? this.parseValue(settingsMap.get(def.key)!.value || '', def.type) : def.defaultValue,
    }));
  }

  /**
   * Get single setting
   */
  async getSetting(key: string): Promise<any> {
    const setting = await this.settingsRepository.findOne({ where: { key } });
    const definition = ADMIN_SETTINGS_DEFINITIONS.find((def) => def.key === key);

    if (setting) {
      return this.parseValue(setting.value || '', definition?.type || 'string');
    }

    return definition?.defaultValue || null;
  }

  /**
   * Update setting
   */
  async setSetting(key: string, value: any): Promise<any> {
    const definition = ADMIN_SETTINGS_DEFINITIONS.find((def) => def.key === key);

    if (!definition) {
      throw new BadRequestException(`Unknown setting: ${key}`);
    }

    // Validate value
    this.validateValue(value, definition);

    let setting = await this.settingsRepository.findOne({ where: { key } });

    if (!setting) {
      const newSetting = new SiteSetting();
      newSetting.key = key;
      newSetting.value = this.serializeValue(value);
      setting = newSetting;
    } else {
      setting.value = this.serializeValue(value);
    }

    await this.settingsRepository.save(setting);
    this.logger.log(`Setting updated: ${key}`);

    return { key, value, message: 'Setting updated successfully' };
  }

  /**
   * Update multiple settings
   */
  async updateSettings(updates: Record<string, any>): Promise<any> {
    const results: Array<{ key: string; success: boolean; value?: any; error?: string }> = [];

    for (const [key, value] of Object.entries(updates)) {
      try {
        await this.setSetting(key, value);
        results.push({ key, success: true, value });
      } catch (error) {
        results.push({ key, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Get setting definitions
   */
  getDefinitions(): SettingDef[] {
    return ADMIN_SETTINGS_DEFINITIONS;
  }

  /**
   * Get definitions by category
   */
  getDefinitionsByCategory(category: string): SettingDef[] {
    return ADMIN_SETTINGS_DEFINITIONS.filter((def) => def.category === category);
  }

  /**
   * Get all categories
   */
  getCategories(): Record<string, SettingCategory> {
    return SETTING_CATEGORIES;
  }

  /**
   * Validate setting value
   */
  private validateValue(value: any, definition: SettingDef): void {
    if (definition.required && (value === null || value === undefined || value === '')) {
      throw new BadRequestException(`${definition.label} is required`);
    }

    const validation = definition.validation;

    if (validation) {
      if (typeof value === 'number') {
        if (validation.min !== undefined && value < validation.min) {
          throw new BadRequestException(`${definition.label} must be at least ${validation.min}`);
        }
        if (validation.max !== undefined && value > validation.max) {
          throw new BadRequestException(`${definition.label} must be at most ${validation.max}`);
        }
      }

      if (validation.pattern && typeof value === 'string') {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(value)) {
          throw new BadRequestException(`${definition.label} format is invalid`);
        }
      }
    }
  }

  /**
   * Serialize value for storage
   */
  private serializeValue(value: any): string {
    if (typeof value === 'string') {
      return value;
    }
    return JSON.stringify(value);
  }

  /**
   * Parse value from storage
   */
  private parseValue(value: string, dataType: string): any {
    try {
      switch (dataType) {
        case 'number':
          return parseFloat(value);
        case 'boolean':
          return value === 'true' || value === '1';
        case 'json':
          return JSON.parse(value);
        default:
          return value;
      }
    } catch {
      return value;
    }
  }
}
