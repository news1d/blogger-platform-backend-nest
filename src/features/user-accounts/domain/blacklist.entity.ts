import { Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Blacklist {
  @PrimaryColumn()
  token: string;

  static createInstance(token: string): Blacklist {
    const blacklistToken = new this();
    blacklistToken.token = token;

    return blacklistToken;
  }
}
