import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';
import { Types } from 'mongoose';
import { BlogsSqlRepository } from '../../../blogs/infrastructure/blogs.sql.repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class BlogIdExistsValidator implements ValidatorConstraintInterface {
  constructor(private blogsRepository: BlogsSqlRepository) {}

  async validate(blogId: string): Promise<boolean> {
    const blog = await this.blogsRepository.getBlogById(blogId);
    return !!blog;
  }

  defaultMessage(): string {
    return 'BlogId was not found';
  }
}

export function BlogIdExists(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: BlogIdExistsValidator,
    });
  };
}
