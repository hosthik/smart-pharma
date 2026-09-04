import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";

@Injectable()
export class AdminGuard
  implements CanActivate
{
  canActivate(
    context: ExecutionContext,
  ): boolean {
    const request =
      context
        .switchToHttp()
        .getRequest();

    const user =
      request.user;

    if (!user) {
      throw new ForbiddenException(
        "Authentication is required.",
      );
    }

    if (
      user.role !== "ADMIN"
    ) {
      throw new ForbiddenException(
        "Administrator access is required.",
      );
    }

    return true;
  }
}