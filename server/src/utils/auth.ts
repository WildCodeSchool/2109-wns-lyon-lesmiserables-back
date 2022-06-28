import * as jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { User } from "../models/User.model";

export const customAuthChecker = async (
  { root, args, context, info },
  roles
) => {
  if (context.token) {
    try {
      const decoded: any = jwt.verify(context.token, process.env.JWT_SECRET);
      const userId = decoded.sub;

      if (!userId) {
        return false;
      }

      const user = await getRepository(User).findOne(userId);

      if (!user) {
        return false;
      }

      // if no roles provided, just checking the connected state
      if (!roles || roles.length === 0) {
        context.user = user;
        return true;
      } else {
        // or we should match the mandatory roles
        if (roles.includes(user.role) === false) {
          return false;
        } else {
          context.user = user;
          return true;
        }
      }
    } catch (err) {
      return false;
    }
  }

  return false;
};
