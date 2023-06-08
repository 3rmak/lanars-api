import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import * as path from 'path';
import * as mime from 'mime';
import { readFile } from 'fs/promises';

import { AppModule } from '../../app.module';

import { UsersDbInitializer } from '../../../test/initializers/users-db.initializer';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';
import { ImageService } from './image.service';
import { PortfolioService } from '../portfolio/portfolio.service';
import { S3Service } from '../../s3/s3.service';

import { User } from '../user/user.model';

import { PortfolioCreateDto } from '../portfolio/dto/create-portfolio.dto';

describe('Image upload testing', () => {
  let imageService: ImageService;
  let portfolioService: PortfolioService;
  let s3Service: S3Service;
  let usersInitializer: UsersDbInitializer;

  let owner: User;
  let user: User;

  const imagePathForUpload = path.join(process.cwd(), 'test', 'test-upload.jpg');
  const getMulterFileByData = (data) => {
    return {
      fieldname: 'file',
      originalname: path.basename(imagePathForUpload),
      encoding: '7bit',
      mimetype: mime.lookup(imagePathForUpload),
      size: data.length,
      buffer: data,
    } as Express.Multer.File;
  };

  const portfolioDto: PortfolioCreateDto = {
    alias: 'Portfolio name',
    description: 'Portfolio description',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    imageService = module.get<ImageService>(ImageService);

    portfolioService = module.get<PortfolioService>(PortfolioService);

    const userService = module.get<UserService>(UserService);
    const authService = module.get<AuthService>(AuthService);
    usersInitializer = new UsersDbInitializer(userService, authService);
    [owner, user] = await usersInitializer.initUsers(2);

    s3Service = module.get<S3Service>(S3Service);
  });

  it('image could be created', async () => {
    jest // mock image uploading
      .spyOn(s3Service, 'uploadImage')
      .mockImplementation(() => Promise.resolve(`https://bucket-name.s3.amazonaws.com/${Date.now()}`));

    const data = await readFile(imagePathForUpload);
    const file = getMulterFileByData(data);

    const portfolio = await portfolioService.createPortfolio(owner.id, portfolioDto);
    const imageDetails = {
      portfolioId: portfolio.id,
      name: 'image',
      description: 'description',
    };

    const image = await imageService.createImage(owner.id, file, imageDetails);

    expect(image.id).toBeDefined();
    expect(image.description).toBe(imageDetails.description);
    expect(image.portfolioId).toBe(imageDetails.portfolioId);
    expect(image.name).toBe(imageDetails.name);
  });

  it('image could not be created', async () => {
    jest // mock image uploading
      .spyOn(s3Service, 'uploadImage')
      .mockImplementation(() => Promise.reject('reason'));

    const data = await readFile(imagePathForUpload);
    const file = getMulterFileByData(data);

    const portfolio = await portfolioService.createPortfolio(owner.id, portfolioDto);
    const imageDetails = {
      portfolioId: portfolio.id,
      name: 'image',
      description: 'description',
    };

    try {
      await imageService.createImage(owner.id, file, imageDetails);
    } catch (e) {
      expect(e.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(e.message).toMatch(/Image was not created. Error:/);
    }

    const response = await imageService.getImagesByPortfolioId(portfolio.id, { page: 1, limit: 5, offset: 0 });
    expect(response.data.length).toBe(0);
  });

  it('image feed could be retrieved', async () => {
    jest // mock image uploading
      .spyOn(s3Service, 'uploadImage')
      .mockImplementation(() => Promise.resolve(`https://bucket-name.s3.amazonaws.com/${Date.now()}`));

    const imageDetails = {
      name: 'image',
      description: 'description',
    };

    const imageData = await readFile(imagePathForUpload);
    const file = getMulterFileByData(imageData);
    const ownerPortfolio = await portfolioService.createPortfolio(owner.id, portfolioDto);
    const ownerImage = await imageService.createImage(owner.id, file, {
      ...imageDetails,
      portfolioId: ownerPortfolio.id,
    });
    const ownerImage2 = await imageService.createImage(owner.id, file, {
      ...imageDetails,
      portfolioId: ownerPortfolio.id,
    });

    const userPortfolio = await portfolioService.createPortfolio(user.id, portfolioDto);
    const userImage = await imageService.createImage(user.id, file, {
      ...imageDetails,
      portfolioId: userPortfolio.id,
    });

    // test functionality
    const { data } = await imageService.getImagesFeed({ page: 1, limit: 5, offset: 0 });
    expect(data.length).toBe([ownerImage, ownerImage2, userImage].length);
    expect(data[0].id).toBe(userImage.id);
    expect(data[1].id).toBe(ownerImage2.id);
    expect(data[2].id).toBe(ownerImage.id);
  });

  it('image should be deleted', async () => {
    jest // mock image uploading
      .spyOn(s3Service, 'uploadImage')
      .mockImplementation(() => Promise.resolve(`https://bucket-name.s3.amazonaws.com/${Date.now()}`));

    jest // mock image uploading
      .spyOn(s3Service, 'deleteImageByUrl')
      .mockImplementation(() => Promise.resolve());

    const data = await readFile(imagePathForUpload);
    const file = getMulterFileByData(data);

    const portfolio = await portfolioService.createPortfolio(owner.id, portfolioDto);
    const imageDetails = {
      portfolioId: portfolio.id,
      name: 'image',
      description: 'description',
    };

    const image = await imageService.createImage(owner.id, file, imageDetails);
    await imageService.deleteImageById(image.id, owner.id);

    try {
      await imageService.getImageById(image.id);
    } catch (e) {
      expect(e.status).toBe(HttpStatus.NOT_FOUND);
    }
  });

  it('image could not be deleted', async () => {
    jest // mock image uploading
      .spyOn(s3Service, 'uploadImage')
      .mockImplementation(() => Promise.resolve(`https://bucket-name.s3.amazonaws.com/${Date.now()}`));

    jest // mock image uploading
      .spyOn(s3Service, 'deleteImageByUrl')
      .mockImplementation(() => Promise.reject('reason'));

    const data = await readFile(imagePathForUpload);
    const file = getMulterFileByData(data);

    const portfolio = await portfolioService.createPortfolio(owner.id, portfolioDto);
    const imageDetails = {
      portfolioId: portfolio.id,
      name: 'image',
      description: 'description',
    };

    const image = await imageService.createImage(owner.id, file, imageDetails);

    try {
      await imageService.deleteImageById(image.id, owner.id);
    } catch (e) {
      expect(e.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(e.message).toMatch(/Image wasn't deleted. Error:/);
    }
  });
});
