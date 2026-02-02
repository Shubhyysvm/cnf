import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { UserProfile } from '../entities/user-profile.entity';
import { UserAddress } from '../entities/user-address.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MinioService } from '../services/minio.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserProfile, UserAddress])],
  providers: [UsersService, MinioService],
  controllers: [UsersController],
})
export class UsersModule {}
