import { Test } from '@nestjs/testing';
import { ValidatePayloadExists } from '@common/validations';
import { BadRequestException } from '@nestjs/common';

describe('ValidatePayloadExists', () => {
  let validatePayloadExists: ValidatePayloadExists;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ValidatePayloadExists],
    }).compile();

    validatePayloadExists = moduleRef.get<ValidatePayloadExists>(ValidatePayloadExists);
  });

  it('should be defined', () => {
    expect(validatePayloadExists).toBeDefined();
  });

  describe('Validate Payload Exists', () => {
    it('should return payload if Payload Exists', () => {
      const dto = { level: 1, score: 120 };
      expect(validatePayloadExists.transform(dto)).toEqual(dto);
    });

    it('should return throw if Payload is not Exists', () => {
      const errorValidate = () => validatePayloadExists.transform({ level: 1 });
      expect(errorValidate).toThrow(BadRequestException);
    });

    it('should return throw if Payload empty', () => {
      const errorValidate = () => validatePayloadExists.transform({});
      expect(errorValidate).toThrow(BadRequestException);
    });
  });
});
