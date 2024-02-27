import { mockProducts } from '@test/stubs';

export const productsService = {
  createProduct: jest.fn().mockResolvedValue(mockProducts.firstProduct),
  findOne: jest.fn().mockResolvedValue(mockProducts.firstProduct),
  findAll: jest.fn().mockResolvedValue(mockProducts.allProducts),
  updateProduct: jest.fn().mockResolvedValue(mockProducts.firstProduct),
  deleteById: jest.fn().mockResolvedValue(mockProducts.firstProduct),
};
