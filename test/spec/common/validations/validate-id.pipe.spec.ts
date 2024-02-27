import { Test } from '@nestjs/testing';
import { ValidateId } from '@common/validations';
import { BadRequestException } from '@nestjs/common';
import { mockUsers } from '@test/stubs';

describe('ValidateId', () => {
  let validateId: ValidateId;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [ValidateId],
    }).compile();

    validateId = moduleRef.get<ValidateId>(ValidateId);
  });

  it('should be defined', () => {
    expect(validateId).toBeDefined();
  });

  describe('Validate mongo Id', () => {
    it('should return valid Id', () => {
      expect(validateId.transform(mockUsers.localUser.id)).toEqual(mockUsers.localUser.id);
    });

    it('should return throw if id is not valid', () => {
      const errorValidate = () => validateId.transform('test');
      expect(errorValidate).toThrow(BadRequestException);
    });
  });
});
