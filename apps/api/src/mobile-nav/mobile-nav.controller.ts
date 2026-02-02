import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Headers,
  UseGuards,
  BadRequestException,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { MobileNavService } from './mobile-nav.service';
import {
  MobileNavMenuDto,
  NavBadgesDto,
  QuickActionsDto,
  NavigationPreferenceDto,
  AnnouncementDto,
  NavAnalyticsDto,
} from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtGuard } from '../common/guards/optional-jwt.guard';

@ApiTags('Mobile Navigation')
@Controller('mobile/nav')
export class MobileNavController {
  constructor(private readonly mobileNavService: MobileNavService) {}

  /**
   * Get dynamic mobile navigation menu
   * Includes personalized menu items based on user authentication status
   * Returns icons, labels, notifications badges, and analytics
   */
  @Get('menu')
  @UseGuards(OptionalJwtGuard)
  @ApiOperation({
    summary: 'Get mobile navigation menu',
    description:
      'Fetches personalized menu items based on user auth status. Includes cart/order counts, notifications, and user-specific features.',
  })
  @ApiResponse({
    status: 200,
    description: 'Navigation menu with badges and personalization',
    schema: {
      example: {
        menus: [
          {
            id: 'home',
            label: 'Home',
            icon: 'home-outline',
            route: 'Home',
            badge: null,
            position: 1,
            isVisible: true,
          },
          {
            id: 'shop',
            label: 'Shop',
            icon: 'shopping-outline',
            route: 'Products',
            badge: { count: 0, type: 'info' },
            position: 2,
            isVisible: true,
          },
          {
            id: 'cart',
            label: 'Cart',
            icon: 'cart-outline',
            route: 'Cart',
            badge: { count: 3, type: 'warning', label: '3 items' },
            position: 4,
            isVisible: true,
          },
          {
            id: 'orders',
            label: 'Orders',
            icon: 'clipboard-list-outline',
            route: 'Orders',
            badge: { count: 1, type: 'success', label: 'In Transit' },
            position: 5,
            isVisible: true,
          },
          {
            id: 'profile',
            label: 'Profile',
            icon: 'account-outline',
            route: 'Profile',
            badge: null,
            position: 6,
            isVisible: true,
          },
        ],
        userPreferences: {
          menuOrder: ['home', 'shop', 'categories', 'cart', 'orders', 'wishlist', 'profile', 'about', 'contact'],
          hiddenItems: [],
          favoriteItems: ['shop', 'orders'],
        },
        metadata: {
          lastUpdated: '2026-01-15T10:30:00Z',
          timestamp: 1705318200000,
        },
      },
    },
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Optional JWT token (Bearer token)',
    required: false,
  })
  async getMenu(@Headers('authorization') authHeader?: string): Promise<MobileNavMenuDto> {
    const userId = authHeader ? authHeader.replace('Bearer ', '') : undefined;
    return this.mobileNavService.getMenuItems(userId);
  }

  /**
   * Get navigation badges (cart, orders, notifications count)
   * Real-time counters for dynamic menu badges
   */
  @Get('badges')
  @UseGuards(OptionalJwtGuard)
  @ApiOperation({
    summary: 'Get navigation badges',
    description: 'Fetches real-time badge counts for cart, orders, notifications, and wishlist items.',
  })
  @ApiResponse({
    status: 200,
    description: 'Badge counts for navigation items',
    schema: {
      example: {
        cart: { count: 3, lastUpdated: '2026-01-15T10:30:00Z' },
        orders: {
          total: 5,
          pending: 1,
          inTransit: 2,
          delivered: 2,
          lastUpdated: '2026-01-15T10:30:00Z',
        },
        wishlist: { count: 12, lastUpdated: '2026-01-15T10:30:00Z' },
        notifications: { unread: 4, lastUpdated: '2026-01-15T10:30:00Z' },
        reviews: { pending: 1, lastUpdated: '2026-01-15T10:30:00Z' },
      },
    },
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Optional JWT token (Bearer token)',
    required: false,
  })
  async getBadges(@Headers('authorization') authHeader?: string): Promise<NavBadgesDto> {
    const userId = authHeader ? authHeader.replace('Bearer ', '') : undefined;
    return this.mobileNavService.getBadges(userId);
  }

  /**
   * Get quick actions for authenticated users
   * Personalized actions based on order history, browsing, and preferences
   */
  @Get('quick-actions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get personalized quick actions',
    description:
      'Returns user-specific quick actions like "Reorder", "Continue Shopping", "View Recommendations", etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Quick action items personalized for user',
    schema: {
      example: {
        actions: [
          {
            id: 'reorder',
            label: 'Reorder',
            icon: 'repeat-outline',
            description: 'Quickly reorder your previous purchases',
            route: 'PreviousOrders',
            priority: 1,
            isAvailable: true,
            data: { orderId: 'order-123' },
          },
          {
            id: 'recommendations',
            label: 'For You',
            icon: 'heart-outline',
            description: 'Personalized product recommendations',
            route: 'Recommendations',
            priority: 2,
            isAvailable: true,
            data: { count: 24 },
          },
          {
            id: 'subscription',
            label: 'Subscribe & Save',
            icon: 'sync-outline',
            description: '15% off on recurring orders',
            route: 'Subscriptions',
            priority: 3,
            isAvailable: true,
            data: { discount: 15 },
          },
        ],
        metadata: {
          generatedAt: '2026-01-15T10:30:00Z',
          userSegment: 'frequent_buyer',
        },
      },
    },
  })
  async getQuickActions(@Headers('authorization') authHeader: string): Promise<QuickActionsDto> {
    const userId = authHeader.replace('Bearer ', '');
    return this.mobileNavService.getQuickActions(userId);
  }

  /**
   * Get user's navigation preferences
   * Includes custom menu order, hidden items, favorites
   */
  @Get('preferences/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get navigation preferences',
    description: 'Fetch user-customized navigation menu order and visibility settings.',
  })
  @ApiResponse({
    status: 200,
    description: 'User navigation preferences',
  })
  async getPreferences(@Param('userId') userId: string): Promise<NavigationPreferenceDto> {
    return this.mobileNavService.getPreferences(userId);
  }

  /**
   * Update navigation preferences
   * Allows users to customize menu order and visibility
   */
  @Put('preferences/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Update navigation preferences',
    description: 'Save user customizations: menu order, hidden items, favorites.',
  })
  @ApiResponse({
    status: 200,
    description: 'Preferences updated successfully',
  })
  async updatePreferences(
    @Param('userId') userId: string,
    @Body() dto: NavigationPreferenceDto,
  ): Promise<NavigationPreferenceDto> {
    return this.mobileNavService.updatePreferences(userId, dto);
  }

  /**
   * Get dynamic announcements for mobile nav
   * Promotional banners, flash sales, stock alerts
   */
  @Get('announcements')
  @UseGuards(OptionalJwtGuard)
  @ApiOperation({
    summary: 'Get mobile announcements',
    description: 'Fetch dynamic announcements: flash sales, new arrivals, stock alerts, promotions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Active announcements',
    schema: {
      example: {
        announcements: [
          {
            id: 'flash-sale-001',
            title: 'Midnight Sale - 40% Off!',
            description: 'Organic essentials at half price - Ends in 4 hours',
            type: 'flash_sale',
            priority: 1,
            icon: '🔥',
            backgroundColor: '#FF6B6B',
            action: { label: 'Shop Now', route: 'Products', params: { filter: 'sale' } },
            validFrom: '2026-01-15T20:00:00Z',
            validUntil: '2026-01-16T00:00:00Z',
            isActive: true,
          },
          {
            id: 'restock-001',
            title: 'Back in Stock!',
            description: 'Your favorite quinoa is available again',
            type: 'restock',
            priority: 2,
            icon: '📦',
            backgroundColor: '#4CAF50',
            action: { label: 'View', route: 'ProductDetail', params: { slug: 'organic-quinoa' } },
            validFrom: '2026-01-15T10:00:00Z',
            validUntil: '2026-01-22T10:00:00Z',
            isActive: true,
          },
        ],
        metadata: {
          count: 2,
          timestamp: 1705318200000,
        },
      },
    },
  })
  @ApiQuery({
    name: 'userId',
    description: 'Optional user ID for personalized announcements',
    required: false,
  })
  async getAnnouncements(
    @Query('userId') userId?: string,
    @Headers('authorization') authHeader?: string,
  ): Promise<{ announcements: AnnouncementDto[]; metadata: any }> {
    const resolvedUserId = userId || (authHeader ? authHeader.replace('Bearer ', '') : undefined);
    return this.mobileNavService.getAnnouncements(resolvedUserId);
  }

  /**
   * Track navigation analytics
   * Log which menu items users tap, for analytics and optimization
   */
  @Post('analytics')
  @UseGuards(OptionalJwtGuard)
  @ApiOperation({
    summary: 'Log navigation event',
    description: 'Track which menu items users interact with for analytics.',
  })
  @ApiResponse({
    status: 201,
    description: 'Analytics event recorded',
  })
  async trackNavigation(
    @Body() dto: NavAnalyticsDto,
    @Headers('authorization') authHeader?: string,
  ): Promise<{ success: boolean; message: string }> {
    const userId = authHeader ? authHeader.replace('Bearer ', '') : undefined;
    await this.mobileNavService.trackNavigation(userId, dto);
    return { success: true, message: 'Event tracked' };
  }

  /**
   * Get navigation analytics dashboard (admin only)
   * Aggregated data on menu usage patterns
   */
  @Get('analytics/dashboard')
  @ApiOperation({
    summary: 'Get navigation analytics',
    description: 'Admin endpoint - aggregated menu usage statistics.',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics dashboard data',
  })
  @ApiQuery({
    name: 'period',
    description: 'Time period (day, week, month)',
    required: false,
    example: 'week',
  })
  async getAnalyticsDashboard(@Query('period') period: string = 'week'): Promise<any> {
    return this.mobileNavService.getAnalyticsDashboard(period);
  }

  /**
   * Get sidebar configurations
   * Theme, appearance, animation settings
   */
  @Get('config')
  @ApiOperation({
    summary: 'Get sidebar configuration',
    description: 'Theme colors, animation speed, appearance settings.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sidebar configuration',
    schema: {
      example: {
        theme: {
          primaryColor: '#2E7D32',
          backgroundColor: '#FFFFFF',
          textColor: '#333333',
          accentColor: '#F49F0A',
        },
        animations: {
          enabled: true,
          speed: 'normal',
          slideDirection: 'left',
        },
        appearance: {
          showIcons: true,
          showBadges: true,
          compactMode: false,
          roundedCorners: true,
        },
        features: {
          enableReorder: true,
          enableHide: true,
          enableFavorites: true,
          enableSearch: false,
        },
      },
    },
  })
  async getConfig(): Promise<any> {
    return this.mobileNavService.getConfig();
  }
}
