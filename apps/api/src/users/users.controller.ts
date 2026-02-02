import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  BadRequestException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async getProfile(@Param('id') userId: string) {
    return this.usersService.getUserProfile(userId);
  }

  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@Param('id') userId: string, @UploadedFile() file: Express.Multer.File) {
    return this.usersService.updateAvatar(userId, file);
  }

  @Get(':id/addresses')
  async getUserAddresses(@Param('id') userId: string) {
    return this.usersService.getUserAddresses(userId);
  }

  @Post(':id/addresses')
  async createAddress(@Param('id') userId: string, @Body() data: any) {
    if (!data.line1 || !data.city || !data.state || !data.zip) {
      throw new BadRequestException('Missing required address fields');
    }
    return this.usersService.createAddress(userId, data);
  }

  @Put(':id/addresses/:addressId')
  async updateAddress(
    @Param('id') userId: string,
    @Param('addressId') addressId: string,
    @Body() data: any,
  ) {
    return this.usersService.updateAddress(userId, addressId, data);
  }

  @Delete(':id/addresses/:addressId')
  async deleteAddress(
    @Param('id') userId: string,
    @Param('addressId') addressId: string,
  ) {
    return this.usersService.deleteAddress(userId, addressId);
  }
}
