import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async createProduct(productDto: CreateProductDto) {
    return await this.prisma.product.create({ data: productDto });
  }

  async findOne(id: string) {
    return await this.prisma.product.findUnique({ where: { id } });
  }

  async findAll() {
    return await this.prisma.product.findMany();
  }

  async updateProduct(id: string, dto: UpdateProductDto) {
    return await this.prisma.product.update({
      where: { id },
      data: { ...dto },
    });
  }

  async deleteById(id: string) {
    return await this.prisma.product.delete({ where: { id } });
  }
}
