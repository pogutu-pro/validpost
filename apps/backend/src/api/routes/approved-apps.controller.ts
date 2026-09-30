import { Controller, Delete, Get, Param } from '@nestjs/common';
import { GetUserFromRequest } from '@validpost/nestjs-libraries/user/user.from.request';
import { User } from '@prisma/client';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OAuthService } from '@validpost/nestjs-libraries/database/prisma/oauth/oauth.service';
import { FederationService } from '@validpost/nestjs-libraries/database/prisma/federation/federation.service';

@ApiTags('Approved Apps')
@Controller('/user/approved-apps')
export class ApprovedAppsController {
  constructor(
    private _oauthService: OAuthService,
    private _federationService: FederationService
  ) {}

  @Get('/')
  async list(@GetUserFromRequest() user: User) {
    return this._oauthService.getApprovedApps(user.id);
  }

  @Delete('/:id')
  async revoke(
    @GetUserFromRequest() user: User,
    @Param('id') id: string
  ) {
    return this._oauthService.revokeApp(user.id, id);
  }

  @Get('/federation')
  @ApiOperation({
    summary: 'List active ValidPost ID (federation) sign-in grants for the user',
  })
  async listFederation(@GetUserFromRequest() user: User) {
    return this._federationService.getGrantsForUser(user.id);
  }

  @Delete('/federation/:id')
  @ApiOperation({ summary: 'Revoke a ValidPost ID (federation) sign-in grant' })
  async revokeFederation(
    @GetUserFromRequest() user: User,
    @Param('id') id: string
  ) {
    return this._federationService.revoke(user.id, id);
  }
}
