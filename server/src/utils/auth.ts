import * as jwt from "jsonwebtoken";
import { getRepository } from "typeorm";
import { User } from "../models/User.model";

export const customAuthChecker = async ({ root, args, context, info }) => {
  const userRepo = getRepository(User);
  const userJwt = context.token;
  try {
    const decoded = jwt.verify(userJwt, "MySecretKey");
    if (!decoded.sub) {
      return false;
    }

    const user = await userRepo.findOne({ where: { id: decoded.sub } });
    if (!user) {
      return false;
    }

    context.user = user;
    return true;
  } catch (err) {
    return false;
  }
};
