import { Entity, Index, PrimaryColumn } from 'typeorm';

@Entity()
export class Blacklist {
  @Index()
  @PrimaryColumn()
  token: string;

  static createInstance(token: string): Blacklist {
    const blacklistToken = new this();
    blacklistToken.token = token;

    return blacklistToken;
  }
}
