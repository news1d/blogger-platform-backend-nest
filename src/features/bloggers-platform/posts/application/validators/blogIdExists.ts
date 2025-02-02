import { registerDecorator, ValidationOptions } from 'class-validator';
import { BlogIdExistsValidator } from './blogIdExists.validator';

export function BlogIdExists(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: BlogIdExistsValidator,
    });
  };
}
