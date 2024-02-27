import { Test } from '@nestjs/testing';
import { ProductsController } from '@products/products.controller';
import { ProductsService } from '@products/products.service';
import { productsService } from '@test/__mocks__/products.service';
import { mockProducts } from '@test/stubs';

describe('ProductsController unit tests', () => {
  let productsController: ProductsController;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ProductsController],
    })
      .useMocker((token) => {
        if (token === ProductsService) {
          return productsService;
        }
      })
      .compile();

    productsController = moduleRef.get<ProductsController>(ProductsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined ProductsController', () => {
    expect(productsController).toBeDefined();
  });

  describe('Create Product', () => {
    it('should return new product', async () => {
      await expect(productsController.create(mockProducts.firstProduct)).resolves.toEqual(mockProducts.firstProduct);
    });
  });

  describe('Get All products', () => {
    it('should return all products', async () => {
      await expect(productsController.getAll()).resolves.toEqual(mockProducts.allProducts);
    });
  });

  describe('Get One product', () => {
    it('should found product by ID', async () => {
      await expect(productsController.getProduct(mockProducts.firstProduct.id)).resolves.toEqual(
        mockProducts.firstProduct,
      );
    });
  });

  describe('Update Product', () => {
    it('should return update product', async () => {
      await expect(
        productsController.updateProduct(mockProducts.firstProduct.id, mockProducts.firstProduct),
      ).resolves.toEqual(mockProducts.firstProduct);
    });
  });

  describe('Delete product by Id', () => {
    it('should delete product', async () => {
      await expect(productsController.delete(mockProducts.firstProduct.id)).resolves.toEqual(mockProducts.firstProduct);
    });
  });
});
