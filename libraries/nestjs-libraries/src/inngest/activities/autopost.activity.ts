import { Injectable } from '@nestjs/common';
import { AutopostService } from '@validpost/nestjs-libraries/database/prisma/autopost/autopost.service';

@Injectable()
export class AutopostActivity {
  constructor(private _autoPostService: AutopostService) {}

  async autoPost(id: string, organizationId: string) {
    return this._autoPostService.startAutopost(id, organizationId)
  }
}
