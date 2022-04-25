import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class MyJwtService {
  constructor(private readonly jwtService: JwtService) {}

  async sign(userId: string): Promise<string> {
    return await this.jwtService.signAsync(userId);
  }

  async verify(token: string) {
    return await this.jwtService.verify(token);
  }
}
