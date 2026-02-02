import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../entities/cart.entity';
import { Order } from '../entities/order.entity';
import { User } from '../entities/user.entity';
import { Wishlist } from '../entities/wishlist.entity';
import { NavPreference } from '../entities/nav-preference.entity';
import {
  MobileNavMenuDto,
  NavBadgesDto,
  QuickActionsDto,
  QuickActionDto,
  NavigationPreferenceDto,
  AnnouncementDto,
  AnnouncementType,
  MenuItemDto,
  BadgeDto,
  BadgeType,
  NavAnalyticsDto,
  UserPreferencesDto,
} from './dto';

@Injectable()
export class MobileNavService {
  private readonly logger = new Logger(MobileNavService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(NavPreference)
    private readonly navPrefRepository: Repository<NavPreference>,
  ) {}

  /**
   * Get dynamic menu items based on user authentication and preferences
   */
  async getMenuItems(userId?: string): Promise<MobileNavMenuDto> {
    const defaultMenuOrder = [
      'home',
      'shop',
      'categories',
      'cart',
      'orders',
      'wishlist',
      'profile',
      'about',
      'contact',
    ];

    // Fetch user preferences if authenticated
    let userPreferences: UserPreferencesDto = {
      menuOrder: defaultMenuOrder,
      hiddenItems: [],
      favoriteItems: [],
    };

    if (userId) {
      const savedPref = await this.navPrefRepository.findOne({ where: { userId } });
      if (savedPref) {
        userPreferences = {
          menuOrder: savedPref.menuOrder || defaultMenuOrder,
          hiddenItems: savedPref.hiddenItems || [],
          favoriteItems: savedPref.favoriteItems || [],
        };
      }
    }

    // Fetch badges for all items
    const badges = await this.getBadges(userId);

    // Build menu items in user's preferred order
    const allMenuItems = this.buildMenuItems(userId, badges, userPreferences);

    // Filter out hidden items
    const visibleItems = allMenuItems.filter((item) => !userPreferences.hiddenItems.includes(item.id));

    // Sort by user's preferred order
    visibleItems.sort((a, b) => {
      const posA = userPreferences.menuOrder.indexOf(a.id);
      const posB = userPreferences.menuOrder.indexOf(b.id);
      return (posA === -1 ? 999 : posA) - (posB === -1 ? 999 : posB);
    });

    return {
      menus: visibleItems,
      userPreferences,
      metadata: {
        lastUpdated: new Date().toISOString(),
        timestamp: Date.now(),
      },
    };
  }

  /**
   * Build all available menu items with badges
   */
  private buildMenuItems(userId: string | undefined, badges: NavBadgesDto, prefs: UserPreferencesDto): MenuItemDto[] {
    const isFavorite = (id: string) => prefs.favoriteItems.includes(id);

    return [
      {
        id: 'home',
        label: 'Home',
        icon: 'home-outline',
        route: 'Home',
        badge: undefined,
        position: 1,
        isVisible: true,
        description: 'Back to home screen',
      },
      {
        id: 'shop',
        label: 'Shop',
        icon: 'shopping-outline',
        route: 'Products',
        badge: undefined,
        position: 2,
        isVisible: true,
        description: 'Browse all products',
      },
      {
        id: 'categories',
        label: 'Categories',
        icon: 'format-list-bulleted',
        route: 'Categories',
        badge: undefined,
        position: 3,
        isVisible: true,
        description: 'Shop by category',
      },
      {
        id: 'cart',
        label: 'Cart',
        icon: 'cart-outline',
        route: 'Cart',
        badge: badges.cart
          ? { count: badges.cart.count, type: BadgeType.WARNING, label: `${badges.cart.count} items` }
          : undefined,
        position: 4,
        isVisible: true,
        description: 'View your shopping cart',
      },
      {
        id: 'wishlist',
        label: 'Wishlist',
        icon: 'heart-outline',
        route: 'Wishlist',
        badge: badges.wishlist
          ? { count: badges.wishlist.count, type: BadgeType.INFO, label: `${badges.wishlist.count} saved` }
          : undefined,
        position: 5,
        isVisible: userId ? true : false, // Show only if logged in
        description: 'Your saved favorites',
      },
      {
        id: 'orders',
        label: 'Orders',
        icon: 'clipboard-list-outline',
        route: 'Orders',
        badge: badges.orders
          ? badges.orders.inTransit > 0
            ? { count: badges.orders.inTransit, type: BadgeType.SUCCESS, label: 'In Transit' }
            : undefined
          : undefined,
        position: 6,
        isVisible: userId ? true : false, // Show only if logged in
        description: 'Track your orders',
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: 'account-outline',
        route: 'Profile',
        badge: undefined,
        position: 7,
        isVisible: userId ? true : false, // Show only if logged in
        description: 'Your account settings',
      },
      {
        id: 'about',
        label: 'About Us',
        icon: 'information-outline',
        route: 'About',
        badge: undefined,
        position: 8,
        isVisible: true,
        description: 'Learn about Country Natural',
      },
      {
        id: 'contact',
        label: 'Contact',
        icon: 'email-outline',
        route: 'Contact',
        badge: undefined,
        position: 9,
        isVisible: true,
        description: 'Get in touch with us',
      },
    ];
  }

  /**
   * Get real-time badge counts for menu items
   */
  async getBadges(userId?: string): Promise<NavBadgesDto> {
    const badges: NavBadgesDto = {};

    // Cart badge (guest or user)
    if (userId) {
      const cart = await this.cartRepository.findOne({
        where: { userId },
        relations: ['items'],
      });
      badges.cart = {
        count: cart?.items?.length || 0,
        lastUpdated: new Date().toISOString(),
      };
    } else {
      // For guest, return 0
      badges.cart = { count: 0, lastUpdated: new Date().toISOString() };
    }

    // Orders badge (user only)
    if (userId) {
      const orders = await this.orderRepository.find({ where: { userId } });
      const pending = orders.filter((o) => o.status === 'pending').length;
      const inTransit = orders.filter((o) => ['processing', 'shipped', 'out_for_delivery'].includes(o.status)).length;
      const delivered = orders.filter((o) => o.status === 'delivered').length;

      badges.orders = {
        total: orders.length,
        pending,
        inTransit,
        delivered,
        lastUpdated: new Date().toISOString(),
      };
    }

    // Wishlist badge (guest or user)
    if (userId) {
      const wishlist = await this.wishlistRepository.findOne({
        where: { userId },
        relations: ['items'],
      });
      badges.wishlist = {
        count: 0,
        lastUpdated: new Date().toISOString(),
      };
    } else {
      badges.wishlist = { count: 0, lastUpdated: new Date().toISOString() };
    }

    // Notifications badge (placeholder for future)
    badges.notifications = { unread: 0, lastUpdated: new Date().toISOString() };

    // Reviews badge (user only - pending reviews)
    if (userId) {
      badges.reviews = { count: 0, lastUpdated: new Date().toISOString() };
    }

    return badges;
  }

  /**
   * Get personalized quick actions for authenticated users
   */
  async getQuickActions(userId: string): Promise<QuickActionsDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const actions: QuickActionDto[] = [];

    // Get user's order history
    const orders = await this.orderRepository.find({ where: { userId }, order: { createdAt: 'DESC' }, take: 1 });

    // 1. Reorder action (if user has previous orders)
    if (orders.length > 0) {
      actions.push({
        id: 'reorder',
        label: 'Reorder',
        icon: 'repeat-outline',
        description: 'Quickly reorder your previous purchases',
        route: 'PreviousOrders',
        priority: 1,
        isAvailable: true,
        data: { orderId: orders[0].id },
      });
    }

    // 2. Recommendations action
    actions.push({
      id: 'recommendations',
      label: 'For You',
      icon: 'heart-outline',
      description: 'Personalized product recommendations',
      route: 'Recommendations',
      priority: 2,
      isAvailable: true,
      data: { count: 24 },
    });

    // 3. Subscribe & Save action
    actions.push({
      id: 'subscription',
      label: 'Subscribe & Save',
      icon: 'sync-outline',
      description: '15% off on recurring orders',
      route: 'Subscriptions',
      priority: 3,
      isAvailable: true,
      data: { discount: 15 },
    });

    // 4. Addresses action
    actions.push({
      id: 'addresses',
      label: 'Saved Addresses',
      icon: 'map-marker-outline',
      description: 'Manage delivery addresses',
      route: 'Addresses',
      priority: 4,
      isAvailable: true,
      data: { count: 0 },
    });

    // 5. Help & Support action
    actions.push({
      id: 'support',
      label: 'Help & Support',
      icon: 'help-circle-outline',
      description: 'Contact our customer support',
      route: 'Support',
      priority: 5,
      isAvailable: true,
      data: { responseTime: '< 2 hours' },
    });

    return {
      actions: actions.sort((a, b) => a.priority - b.priority),
      metadata: {
        generatedAt: new Date().toISOString(),
        userSegment: this.getUserSegment(user, orders.length),
      },
    };
  }

  /**
   * Determine user segment for personalization
   */
  private getUserSegment(user: User, orderCount: number): string {
    if (orderCount === 0) return 'new_user';
    if (orderCount === 1) return 'first_time_buyer';
    if (orderCount < 5) return 'occasional_buyer';
    if (orderCount >= 5) return 'frequent_buyer';
    return 'unknown';
  }

  /**
   * Get user's navigation preferences
   */
  async getPreferences(userId: string): Promise<NavigationPreferenceDto> {
    const prefs = await this.navPrefRepository.findOne({ where: { userId } });

    if (!prefs) {
      return {
        menuOrder: ['home', 'shop', 'categories', 'cart', 'orders', 'wishlist', 'profile', 'about', 'contact'],
        hiddenItems: [],
        favoriteItems: [],
        compactMode: false,
        theme: 'light',
        enableAnimations: true,
        enableBadges: true,
        enableNotifications: true,
      };
    }

    return {
      menuOrder: prefs.menuOrder,
      hiddenItems: prefs.hiddenItems,
      favoriteItems: prefs.favoriteItems,
      compactMode: prefs.compactMode,
      theme: prefs.theme,
      enableAnimations: prefs.enableAnimations,
      enableBadges: prefs.enableBadges,
      enableNotifications: prefs.enableNotifications,
    };
  }

  /**
   * Update user's navigation preferences
   */
  async updatePreferences(userId: string, dto: NavigationPreferenceDto): Promise<NavigationPreferenceDto> {
    let prefs = await this.navPrefRepository.findOne({ where: { userId } });

    if (!prefs) {
      prefs = this.navPrefRepository.create({
        userId,
        ...dto,
      });
    } else {
      Object.assign(prefs, dto);
    }

    await this.navPrefRepository.save(prefs);
    return this.getPreferences(userId);
  }

  /**
   * Get dynamic announcements for mobile nav
   */
  async getAnnouncements(userId?: string): Promise<{ announcements: AnnouncementDto[]; metadata: any }> {
    const announcements: AnnouncementDto[] = [];

    // Flash sale announcement
    announcements.push({
      id: 'flash-sale-001',
      title: 'Midnight Sale - 40% Off!',
      description: 'Organic essentials at half price - Ends in 4 hours',
      type: AnnouncementType.FLASH_SALE,
      priority: 1,
      icon: '🔥',
      backgroundColor: '#FF6B6B',
      textColor: '#FFFFFF',
      action: { label: 'Shop Now', route: 'Products', params: { filter: 'sale' } },
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      isActive: true,
    });

    // New arrival announcement
    announcements.push({
      id: 'new-arrival-001',
      title: 'New Arrivals This Week',
      description: 'Fresh organic products just added to our catalog',
      type: AnnouncementType.NEW_ARRIVAL,
      priority: 2,
      icon: '✨',
      backgroundColor: '#4CAF50',
      textColor: '#FFFFFF',
      action: { label: 'Explore', route: 'Products', params: { filter: 'new' } },
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
    });

    // Restock announcement (personalized)
    if (userId) {
      announcements.push({
        id: 'restock-001',
        title: 'Back in Stock!',
        description: 'Your favorite quinoa is available again',
        type: AnnouncementType.RESTOCK,
        priority: 2,
        icon: '📦',
        backgroundColor: '#2196F3',
        textColor: '#FFFFFF',
        action: { label: 'View', route: 'ProductDetail', params: { slug: 'organic-quinoa' } },
        validFrom: new Date().toISOString(),
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
      });
    }

    // Promotional announcement
    announcements.push({
      id: 'promo-001',
      title: 'Subscribe & Save 15%',
      description: 'Get 15% off on recurring orders. Cancel anytime.',
      type: AnnouncementType.PROMOTION,
      priority: 3,
      icon: '💳',
      backgroundColor: '#FF9800',
      textColor: '#FFFFFF',
      action: { label: 'Learn More', route: 'Subscriptions' },
      validFrom: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
    });

    return {
      announcements: announcements.filter((a) => a.isActive),
      metadata: {
        count: announcements.length,
        timestamp: Date.now(),
      },
    };
  }

  /**
   * Track navigation analytics
   */
  async trackNavigation(userId: string | undefined, dto: NavAnalyticsDto): Promise<void> {
    this.logger.log(
      `Navigation event: ${dto.menuItemId} [${dto.action}] by ${userId || 'guest'} from ${dto.sourceScreen}`,
    );

    // TODO: Store in analytics database table for dashboard reporting
    // This data can be used to optimize menu structure and UX
  }

  /**
   * Get navigation analytics dashboard
   */
  async getAnalyticsDashboard(period: string): Promise<any> {
    // TODO: Implement aggregated analytics query
    return {
      period,
      topMenuItems: [
        { id: 'shop', taps: 2540, percentage: 28 },
        { id: 'cart', taps: 2100, percentage: 23 },
        { id: 'home', taps: 1900, percentage: 21 },
        { id: 'orders', taps: 1200, percentage: 13 },
        { id: 'categories', taps: 1100, percentage: 12 },
        { id: 'profile', taps: 500, percentage: 6 },
        { id: 'wishlist', taps: 400, percentage: 4 },
      ],
      averageMenuDepth: 2.4,
      userRetention: 0.72,
      timestamp: Date.now(),
    };
  }

  /**
   * Get sidebar configuration
   */
  async getConfig(): Promise<any> {
    return {
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
    };
  }
}
