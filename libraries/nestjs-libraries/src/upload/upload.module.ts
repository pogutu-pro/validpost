import { Global, Module } from '@nestjs/common';
import { CustomFileValidationPipe } from '@validpost/nestjs-libraries/upload/custom.upload.validation';
import { StorageService } from '@validpost/nestjs-libraries/database/prisma/storage/storage.service';
import { StorageRepository } from '@validpost/nestjs-libraries/database/prisma/storage/storage.repository';

@Global()
@Module({
  providers: [
    CustomFileValidationPipe,
    StorageService,
    StorageRepository,
  ],
  exports: [
    CustomFileValidationPipe,
    StorageService,
    StorageRepository,
  ],
})
export class UploadModule {}
