import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { Injectable } from '@nestjs/common/decorators';
import { BadRequestException } from '@nestjs/common/exceptions';

import * as bcrypt from 'bcrypt';

import { PortfolioService } from '../portfolio/portfolio.service';

import { User } from './user.model';
import { AuthRegisterDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  private readonly salt: number;
  constructor(
    @InjectModel(User) private readonly userRepository: typeof User,
    private portfolioService: PortfolioService,
    private configService: ConfigService,
  ) {
    this.salt = Number(configService.get('HASH_SALT'));
  }

  public async createUser(body: AuthRegisterDto): Promise<User> {
    const userCandidate = await this.getUserByEmail(body.email);
    if (userCandidate) {
      throw new BadRequestException('User with this email already exists');
    }

    try {
      const hashPassword = await bcrypt.hash(body.password, this.salt);
      return this.userRepository.create({ ...body, password: hashPassword });
    } catch (e) {
      throw new InternalServerErrorException(`Can't create user. Error: ${e.message}`);
    }
  }

  public async getUserByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email }, include: { all: true } });
  }

  public async deleteProfile(email: string): Promise<void> {
    const user = await this.getUserByEmail(email);

    try {
      for (const portfolio of user.portfolios) {
        await this.portfolioService.deletePortfolioById(user.id, portfolio.id);
      }
      await user.destroy();
    } catch (e) {
      throw new InternalServerErrorException(`Can't delete user profile. Error:${e.message}`);
    }
  }
}
