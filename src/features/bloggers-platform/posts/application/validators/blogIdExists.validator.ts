import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../../../blogs/infrastructure/blogs.repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class BlogIdExistsValidator implements ValidatorConstraintInterface {
  constructor(private blogsRepository: BlogsRepository) {}

  async validate(blogId: string) {
    if (!blogId) return false;
    const blog = await this.blogsRepository.getBlogById(blogId);
    return !!blog;
  }

  defaultMessage(args: ValidationArguments) {
    return `Blog ID "${args.value}" was not found.`;
  }
}
