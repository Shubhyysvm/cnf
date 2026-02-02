import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

/**
 * Optional JWT Guard - allows both authenticated and unauthenticated requests
 * Useful for endpoints that serve both guest and logged-in users differently
 */
@Injectable()
export class OptionalJwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Allow both authenticated and unauthenticated requests
    // The controller can check the authorization header to determine if authenticated
    return true;
  }
}
