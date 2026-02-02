import { IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddToWishlistDto {
  @ApiProperty({
    description: 'Product UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'Product ID must be a valid UUID' })
  productId: string;

  @ApiPropertyOptional({
    description: 'Product variant UUID (optional)',
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Variant ID must be a valid UUID' })
  variantId?: string | null;
}
