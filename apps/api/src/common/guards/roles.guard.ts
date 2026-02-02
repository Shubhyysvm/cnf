import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

export enum AdminRole {
  SUPERADMIN = 'superadmin',
  MANAGER = 'manager',
  MODERATOR = 'moderator',
}

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Unauthorized: No user context');
    }

    return true;
  }
}

export function RequireRole(...roles: AdminRole[]) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (req: any, ...args: any[]) {
      const userRole = req.user?.role as AdminRole;

      if (!userRole || !roles.includes(userRole)) {
        throw new ForbiddenException(
          `This action requires one of the following roles: ${roles.join(', ')}`,
        );
      }

      return originalMethod.apply(this, [req, ...args]);
    };

    return descriptor;
  };
}
