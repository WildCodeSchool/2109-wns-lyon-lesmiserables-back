import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from "class-validator";

import { User } from "../models/User.model";

@ValidatorConstraint({ async: true })
export class IsUsernameAlreadyExistConstraint
  implements ValidatorConstraintInterface
{
  validate(username: string) {
    return User.findOne({ where: { username } }).then((user) => {
      if (user) return false;
      return true;
    });
  }
}

export function IsUsernameAlreadyExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsUsernameAlreadyExistConstraint,
    });
  };
}
