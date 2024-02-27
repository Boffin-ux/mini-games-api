import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { Provider, User } from '@prisma/client';
import { PartialUser, UserProvider } from '@auth/interfaces/interfaces';
import { compare, hash } from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(userDto: PartialUser) {
    const hashedPassword = userDto.password ? await this.hashData(userDto.password) : null;

    return await this.prisma.user.upsert({
      where: { email: userDto.email, provider: { not: Provider.local } },
      update: {
        ...userDto,
        password: hashedPassword,
      },
      create: {
        ...userDto,
        password: hashedPassword,
      },
    });
  }

  async updateUser(id: string, userDto: Partial<User>) {
    const hashedPassword = userDto.password ? await this.hashData(userDto.password) : null;

    return await this.prisma.user.update({
      where: { id },
      data: { ...userDto, password: hashedPassword ?? undefined },
    });
  }

  async removeUser(id: string) {
    return await this.prisma.user.delete({ where: { id } });
  }

  async getAllUsers(): Promise<User[] | []> {
    return await this.prisma.user.findMany();
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({ where: { id } });
  }

  async validateUser(email: string, pass: string | null): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isPassMismatch = user.password && pass ? await compare(pass, user.password) : false;
    return isPassMismatch ? user : null;
  }

  async checkDataProvider({ email, name, image, provider }: UserProvider): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    const isDataMismatch = user.name === name && user.image === image && user.provider === provider;
    return isDataMismatch ? user : null;
  }

  private async hashData(data: string): Promise<string> {
    const saltRounds = 10;
    return await hash(data, saltRounds);
  }
}
