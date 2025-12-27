import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaFile } from './entities/file.entity';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(MediaFile)
    private readonly fileRepository: Repository<MediaFile>,
  ) {}

  async saveFile(file: Express.Multer.File): Promise<MediaFile> {
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only images allowed');
    }

    const url = `/uploads/${file.filename}`;

    const fileEntity = this.fileRepository.create({
      originalName: file.originalname,
      filename: file.filename,
      mimeType: file.mimetype,
      size: file.size,
      url,
    });

    return this.fileRepository.save(fileEntity);
  }
}
