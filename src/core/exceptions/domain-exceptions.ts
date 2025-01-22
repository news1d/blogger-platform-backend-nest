import { DomainExceptionCode } from './domain-exception-codes';

export class ErrorExtension {
  constructor(
    public message: string,
    public field: string | null = null,
  ) {}
}

export class DomainException extends Error {
  constructor(
    public message: string,
    public code: DomainExceptionCode,
    public extensions?: ErrorExtension[],
  ) {
    super(message);
  }
}

export class BadRequestDomainException extends DomainException {
  constructor(extensions: ErrorExtension[]) {
    super('Bad Request', DomainExceptionCode.BadRequest, extensions);
  }

  static create(message: string, key?: string) {
    return new this(message ? [new ErrorExtension(message, key)] : []);
  }
}

export class ForbiddenDomainException extends DomainException {
  constructor(extensions: ErrorExtension[]) {
    super('Forbidden', DomainExceptionCode.Forbidden, extensions);
  }

  static create(message?: string, key?: string) {
    return new this(message ? [new ErrorExtension(message, key)] : []);
  }
}

export class UnauthorizedDomainException extends DomainException {
  constructor() {
    super('Unauthorized', DomainExceptionCode.Unauthorized);
  }

  static create() {
    return new this();
  }
}
