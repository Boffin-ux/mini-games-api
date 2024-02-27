import { Product } from '@prisma/client';
import { CreateProductDto, UpdateProductDto } from '@products/dto';

const productStub = (): Product[] => {
  return [
    {
      id: '654a2be80a7f3f8c5b7e26ae',
      name: 'Test-01',
      description: 'Test Product 01',
    },
    {
      id: '654b7a5015b7436221f37cb7',
      name: 'Test-02',
      description: 'Test Product 02',
    },
  ];
};

const mockProducts = {
  allProducts: <Product[]>productStub(),
  firstProduct: <Product>productStub()[0],
  secondProduct: <Product>productStub()[1],
} as const;

const productDto = {
  create: <CreateProductDto>{
    name: mockProducts.firstProduct.name,
    description: mockProducts.firstProduct.description,
  },
  update: <UpdateProductDto>{
    name: 'Test-001',
    description: 'Test Product 001',
  },
} as const;

export { mockProducts, productDto };
