import { Test } from '@nestjs/testing';
import { DeepMockProxy, mockDeep, mockReset } from 'jest-mock-extended';
import { PrismaService } from '@prisma/prisma.service';
import { PrismaClient } from '@prisma/client';
import { ProductsService } from '@products/products.service';
import { mockProducts } from '@test/stubs';

describe('ProductsService unit tests', () => {
  let productsService: ProductsService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ProductsService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    prisma = moduleRef.get(PrismaService);
    productsService = moduleRef.get(ProductsService);
  });

  afterEach(() => {
    mockReset(prisma);
  });

  it('should be defined ProductsService', () => {
    expect(productsService).toBeDefined();
  });

  it('should define Prisma', () => {
    expect(prisma).toBeDefined();
  });

  describe('Create Product', () => {
    it('should return new product', async () => {
      prisma.product.create.mockResolvedValue(mockProducts.firstProduct);

      await expect(productsService.createProduct(mockProducts.firstProduct)).resolves.toEqual(
        mockProducts.firstProduct,
      );
    });
  });

  describe('Find All products', () => {
    it('should return all products', async () => {
      prisma.product.findMany.mockResolvedValue(mockProducts.allProducts);
      await expect(productsService.findAll()).resolves.toEqual(mockProducts.allProducts);
    });
  });

  describe('Find One product', () => {
    it('should found product by ID', async () => {
      prisma.product.findUnique.mockResolvedValue(mockProducts.firstProduct);

      await expect(productsService.findOne(mockProducts.firstProduct.id)).resolves.toEqual(mockProducts.firstProduct);
    });
  });

  describe('Update Product', () => {
    it('should return update product', async () => {
      prisma.product.update.mockResolvedValue(mockProducts.firstProduct);

      await expect(
        productsService.updateProduct(mockProducts.firstProduct.id, mockProducts.firstProduct),
      ).resolves.toEqual(mockProducts.firstProduct);
    });
  });

  describe('Delete product by Id', () => {
    it('should delete product', async () => {
      prisma.product.delete.mockResolvedValue(mockProducts.firstProduct);

      await expect(productsService.deleteById(mockProducts.firstProduct.id)).resolves.toEqual(
        mockProducts.firstProduct,
      );
    });
  });
});
