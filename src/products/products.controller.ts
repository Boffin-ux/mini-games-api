import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { ErrorResponse, NoContentResponse, Role } from '@common/decorators';
import { NotFoundInterceptor } from '@common/interceptors';
import { PrismaExceptionFilter } from '@common/exceptions';
import { Endpoints, ResponseMessages } from '@common/constants';
import { ValidateId } from '@common/validations';
import { Product, UserRole } from '@prisma/client';

@ApiTags('Products')
@Controller(Endpoints.PRODUCTS)
@UseInterceptors(ClassSerializerInterceptor)
@UseFilters(new PrismaExceptionFilter('Product'))
@ApiUnauthorizedResponse({ description: ResponseMessages.UNAUTHORIZED })
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Role(UserRole.Admin)
  @ApiOperation({ summary: 'Create Product' })
  @ApiCreatedResponse({ description: 'Created product' })
  @ApiConflictResponse({ description: `Product ${ResponseMessages.CONFLICT}` })
  @ApiBadRequestResponse({ description: `${ResponseMessages.BAD_REQUEST}` })
  @Post()
  async create(@Body() productDto: CreateProductDto): Promise<Product> {
    return await this.productsService.createProduct(productDto);
  }

  @UseInterceptors(new NotFoundInterceptor('Product'))
  @ApiOperation({ summary: 'Get Product By Id' })
  @ApiOkResponse({ description: 'Founded product' })
  @ErrorResponse('Products')
  @Get(':productId')
  async getProduct(@Param('productId', ValidateId) productId: string) {
    return await this.productsService.findOne(productId);
  }

  @ApiOperation({ summary: 'Get All Products' })
  @ApiOkResponse({ description: 'All products' })
  @Get()
  async getAll(): Promise<Product[]> {
    return await this.productsService.findAll();
  }

  @Role(UserRole.Admin)
  @ApiOperation({ summary: 'Update Product by ID' })
  @ApiOkResponse({ description: 'Product updated' })
  @ErrorResponse('Product')
  @Put(':productId')
  async updateProduct(
    @Param('productId', ValidateId) id: string,
    @Body() productDto: UpdateProductDto,
  ): Promise<Product> {
    return await this.productsService.updateProduct(id, productDto);
  }

  @Role(UserRole.Admin)
  @NoContentResponse('Product')
  @ErrorResponse('Product')
  @Delete(':productId')
  async delete(@Param('productId', ValidateId) id: string): Promise<Product> {
    return await this.productsService.deleteById(id);
  }
}
