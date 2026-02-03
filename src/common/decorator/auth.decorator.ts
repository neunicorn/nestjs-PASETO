/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * This decorator is for get auth data from jwt
 * @param data  email or id
 */
export const ReqUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    // If 'data' is passed (e.g., @User('id')), return only that property
    if (data) {
      return request.user[data as string];
    }

    // Otherwise, return the entire user object
    return request.user;
  },
);
