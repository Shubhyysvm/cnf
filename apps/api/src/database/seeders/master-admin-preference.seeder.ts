import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MasterAdminPreference } from '../../entities/master-admin-preference.entity';

@Injectable()
export class MasterAdminPreferenceSeeder {
  constructor(
    @InjectRepository(MasterAdminPreference)
    private masterAdminPreferenceRepository: Repository<MasterAdminPreference>,
  ) {}

  async seed(): Promise<void> {
    const existingEmail = await this.masterAdminPreferenceRepository.findOne({
      where: { key: 'admin_email' },
    });

    if (!existingEmail) {
      await this.masterAdminPreferenceRepository.save({
        key: 'admin_email',
        value: 'hemanthreddy.y143@gmail.com',
        description: 'Primary admin email for order notifications',
      });
      console.log('✓ Seeded admin_email in master_admin_preferences');
    }

    // Add more preferences as needed
    const existingFromEmail = await this.masterAdminPreferenceRepository.findOne({
      where: { key: 'email_from' },
    });

    if (!existingFromEmail) {
      await this.masterAdminPreferenceRepository.save({
        key: 'email_from',
        value: 'noreply@countrynaturalfoods.com',
        description: 'From email address for sending emails',
      });
      console.log('✓ Seeded email_from in master_admin_preferences');
    }
  }
}
