import { IsString, IsOptional, IsBoolean, IsNumber, IsArray, IsEnum, IsObject } from 'class-validator';

export enum BadgeType {
  INFO = 'info',
  WARNING = 'warning',
  SUCCESS = 'success',
  DANGER = 'danger',
}

export enum AnnouncementType {
  FLASH_SALE = 'flash_sale',
  RESTOCK = 'restock',
  NEW_ARRIVAL = 'new_arrival',
  PROMOTION = 'promotion',
  NOTIFICATION = 'notification',
  REMINDER = 'reminder',
}

export class BadgeDto {
  @IsOptional()
  @IsNumber()
  count?: number;

  @IsOptional()
  @IsEnum(BadgeType)
  type?: BadgeType;

  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsString()
  color?: string;
}

export class MenuItemDto {
  @IsString()
  id: string;

  @IsString()
  label: string;

  @IsString()
  icon: string;

  @IsString()
  route: string;

  @IsOptional()
  badge?: BadgeDto;

  @IsNumber()
  position: number;

  @IsBoolean()
  isVisible: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UserPreferencesDto {
  @IsArray()
  menuOrder: string[];

  @IsArray()
  hiddenItems: string[];

  @IsArray()
  favoriteItems: string[];

  @IsOptional()
  @IsBoolean()
  compactMode?: boolean;

  @IsOptional()
  @IsString()
  theme?: 'light' | 'dark';
}

export class MobileNavMenuDto {
  menus: MenuItemDto[];
  userPreferences: UserPreferencesDto;
  metadata: {
    lastUpdated: string;
    timestamp: number;
  };
}

export class CartBadgeDto {
  @IsNumber()
  count: number;

  @IsString()
  lastUpdated: string;
}

export class OrdersBadgeDto {
  @IsNumber()
  total: number;

  @IsNumber()
  pending: number;

  @IsNumber()
  inTransit: number;

  @IsNumber()
  delivered: number;

  @IsString()
  lastUpdated: string;
}

export class NotificationsBadgeDto {
  @IsNumber()
  unread: number;

  @IsString()
  lastUpdated: string;
}

export class NavBadgesDto {
  @IsOptional()
  cart?: CartBadgeDto;

  @IsOptional()
  orders?: OrdersBadgeDto;

  @IsOptional()
  wishlist?: CartBadgeDto;

  @IsOptional()
  notifications?: NotificationsBadgeDto;

  @IsOptional()
  reviews?: CartBadgeDto;

  @IsOptional()
  messages?: CartBadgeDto;
}

export class QuickActionDto {
  @IsString()
  id: string;

  @IsString()
  label: string;

  @IsString()
  icon: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  route: string;

  @IsNumber()
  priority: number;

  @IsBoolean()
  isAvailable: boolean;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}

export class QuickActionsDto {
  @IsArray()
  actions: QuickActionDto[];

  @IsOptional()
  @IsObject()
  metadata?: {
    generatedAt?: string;
    userSegment?: string;
    [key: string]: any;
  };
}

export class NavigationPreferenceDto {
  @IsOptional()
  @IsArray()
  menuOrder?: string[];

  @IsOptional()
  @IsArray()
  hiddenItems?: string[];

  @IsOptional()
  @IsArray()
  favoriteItems?: string[];

  @IsOptional()
  @IsBoolean()
  compactMode?: boolean;

  @IsOptional()
  @IsString()
  theme?: 'light' | 'dark';

  @IsOptional()
  @IsBoolean()
  enableAnimations?: boolean;

  @IsOptional()
  @IsBoolean()
  enableBadges?: boolean;

  @IsOptional()
  @IsBoolean()
  enableNotifications?: boolean;
}

export class AnnouncementActionDto {
  @IsString()
  label: string;

  @IsString()
  route: string;

  @IsOptional()
  @IsObject()
  params?: Record<string, any>;
}

export class AnnouncementDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(AnnouncementType)
  type: AnnouncementType;

  @IsNumber()
  priority: number;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @IsOptional()
  @IsString()
  textColor?: string;

  @IsOptional()
  action?: AnnouncementActionDto;

  @IsString()
  validFrom: string;

  @IsString()
  validUntil: string;

  @IsBoolean()
  isActive: boolean;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class NavAnalyticsDto {
  @IsString()
  menuItemId: string;

  @IsString()
  action: 'tap' | 'view' | 'hold' | 'swipe';

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsString()
  sourceScreen?: string;

  @IsOptional()
  @IsString()
  targetRoute?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class SidebarConfigDto {
  @IsOptional()
  @IsObject()
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    accentColor?: string;
  };

  @IsOptional()
  @IsObject()
  animations?: {
    enabled?: boolean;
    speed?: 'slow' | 'normal' | 'fast';
    slideDirection?: 'left' | 'right';
  };

  @IsOptional()
  @IsObject()
  appearance?: {
    showIcons?: boolean;
    showBadges?: boolean;
    compactMode?: boolean;
    roundedCorners?: boolean;
  };

  @IsOptional()
  @IsObject()
  features?: {
    enableReorder?: boolean;
    enableHide?: boolean;
    enableFavorites?: boolean;
    enableSearch?: boolean;
  };
}
