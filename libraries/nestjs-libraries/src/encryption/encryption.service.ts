import { Injectable } from '@nestjs/common';
import { AuthService } from '@validpost/helpers/auth/auth.service';

@Injectable()
export class EncryptionService {
  encrypt(value: string): string {
    return AuthService.fixedEncryption(value);
  }

  decrypt(stored: string): string {
    return AuthService.fixedDecryption(stored);
  }
}
