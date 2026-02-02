import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserProfile } from '../entities/user-profile.entity';
import { UserAddress } from '../entities/user-address.entity';
import { MinioService } from '../services/minio.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @InjectRepository(UserAddress)
    private readonly addressRepository: Repository<UserAddress>,
    private readonly minioService: MinioService,
  ) {}

  async getUserProfile(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profile = await this.userProfileRepository.findOne({
      where: { userId },
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: profile?.avatarUrl,
      profile: {
        firstName: profile?.firstName,
        middleName: profile?.middleName,
        lastName: profile?.lastName,
        phone: profile?.phone,
      },
    };
  }

  async updateAvatar(userId: string, file: Express.Multer.File) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Upload to user-specific folder: users/{userId}/avatar
    const { url, fileName } = await this.minioService.uploadFile(file, 'country-natural-foods', `users/${userId}`);

    let profile = await this.userProfileRepository.findOne({ where: { userId } });
    
    // Delete old avatar if it exists
    if (profile?.avatarUrl) {
      try {
        // Extract old filename from URL
        const oldFileName = profile.avatarUrl.split('/').pop();
        if (oldFileName) {
          await this.minioService.deleteFile('country-natural-foods', `users/${userId}/${oldFileName}`);
        }
      } catch (error) {
        console.warn('[UsersService] Failed to delete old avatar:', error);
        // Continue with upload even if delete fails
      }
    }

    if (!profile) {
      profile = this.userProfileRepository.create({ userId, avatarUrl: url });
    } else {
      profile.avatarUrl = url;
    }
    await this.userProfileRepository.save(profile);

    return {
      avatarUrl: url,
      fileName,
    };
  }

  async getUserAddresses(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.addressRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async createAddress(userId: string, data: any) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Normalize legacy types and casing
    if (data.type) {
      const normalizedType = String(data.type).toLowerCase();
      if (normalizedType === 'shipping') data.type = 'home';
      else if (normalizedType === 'billing') data.type = 'work';
      else data.type = normalizedType as any;
    }

    // Check for duplicate address type
    const existingQuery: any = { userId, type: data.type };
    
    // For 'other' type, also check customLabel to prevent duplicate custom labels
    if (data.type === 'other' && data.customLabel) {
      existingQuery.customLabel = data.customLabel.trim();
    }

    const existingAddress = await this.addressRepository.findOne({
      where: existingQuery,
    });

    if (existingAddress) {
      if (data.type === 'other') {
        throw new BadRequestException(`An address with the label "${data.customLabel}" already exists`);
      } else {
        throw new BadRequestException(`A ${data.type} address already exists. Please edit the existing one or delete it first.`);
      }
    }

    // If marking as default, unset other defaults of the same type
    if (data.isDefault) {
      await this.addressRepository.update(
        { userId, type: data.type, isDefault: true },
        { isDefault: false }
      );
    }

    const address = this.addressRepository.create({
      ...data,
      userId,
    });

    return this.addressRepository.save(address);
  }

  async updateAddress(userId: string, addressId: string, data: any) {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    // Normalize legacy types and casing
    if (data.type) {
      const normalizedType = String(data.type).toLowerCase();
      if (normalizedType === 'shipping') data.type = 'home';
      else if (normalizedType === 'billing') data.type = 'work';
      else data.type = normalizedType as any;
    }

    // If changing type or customLabel, check for duplicates
    if (data.type && (data.type !== address.type || (data.type === 'other' && data.customLabel !== address.customLabel))) {
      const existingQuery: any = { userId, type: data.type };
      
      // For 'other' type, also check customLabel
      if (data.type === 'other' && data.customLabel) {
        existingQuery.customLabel = data.customLabel.trim();
      }

      const existingAddress = await this.addressRepository.findOne({
        where: existingQuery,
      });

      // Make sure we're not finding the same address we're updating
      if (existingAddress && existingAddress.id !== addressId) {
        if (data.type === 'other') {
          throw new BadRequestException(`An address with the label "${data.customLabel}" already exists`);
        } else {
          throw new BadRequestException(`A ${data.type} address already exists. Please edit the existing one or delete it first.`);
        }
      }
    }

    // If marking as default, unset other defaults of the same type
    if (data.isDefault && !address.isDefault) {
      await this.addressRepository.update(
        { userId, type: data.type, isDefault: true },
        { isDefault: false }
      );
    }

    Object.assign(address, data);
    return this.addressRepository.save(address);
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return this.addressRepository.remove(address);
  }
}
