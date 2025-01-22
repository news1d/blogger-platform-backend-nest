import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId, Types } from 'mongoose';
import { BadRequestDomainException } from '../exceptions/domain-exceptions';

@Injectable()
export class ObjectIdValidationTransformationPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata): any {
    // Проверяем, что тип данных в декораторе — ObjectId
    if (metadata.metatype !== Types.ObjectId) {
      return value;
    }

    if (!isValidObjectId(value)) {
      throw BadRequestDomainException.create(`Invalid ObjectId: ${value}`);
    }
    return new Types.ObjectId(value); // Преобразуем строку в ObjectId
  }
}

/**
 * Not add it globally. Use only locally
 */
@Injectable()
export class ObjectIdValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    // Проверяем, что тип данных в декораторе — ObjectId
    if (!isValidObjectId(value)) {
      throw BadRequestDomainException.create(`Invalid ObjectId: ${value}`);
    }

    // Если тип не ObjectId, возвращаем значение без изменений
    return value;
  }
}
