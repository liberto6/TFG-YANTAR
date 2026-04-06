import { Body, Controller, Get, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { Request } from 'express'
import { GetCurrentUserService } from '../../application/services/get-current-user.service'
import { RegisterUserService } from '../../application/services/register-user.service'
import { RegisterBusinessService } from '../../application/services/register-business.service'
import { UpdateProfileService } from '../../application/services/update-profile.service'
import { UserDto } from '../../application/dtos/user.dto'
import {
  RegisterUserRequest,
  RegisterUserResponse,
} from '../../application/dtos/register-user.dto'
import {
  RegisterBusinessRequest,
  RegisterBusinessResponse,
} from '../../application/dtos/register-business.dto'
import { UpdateProfileRequest } from '../../application/dtos/update-profile.dto'
import { AuthGuard } from '../../../shared/infrastructure/guards/auth.guard'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly getCurrentUser: GetCurrentUserService,
    private readonly registerUserService: RegisterUserService,
    private readonly registerBusinessService: RegisterBusinessService,
    private readonly updateProfileService: UpdateProfileService,
  ) {}

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() req: Request): Promise<UserDto> {
    const userId = (req as any).userId as string
    const user = await this.getCurrentUser.execute(userId)
    return UserDto.fromEntity(user)
  }

  @Post('register')
  async register(
    @Body() request: RegisterUserRequest,
  ): Promise<RegisterUserResponse> {
    return this.registerUserService.execute(request)
  }

  @Post('register-business')
  async registerBusiness(
    @Body() request: RegisterBusinessRequest,
  ): Promise<RegisterBusinessResponse> {
    return this.registerBusinessService.execute(request)
  }

  @Patch('profile')
  @UseGuards(AuthGuard)
  async updateProfile(
    @Req() req: Request,
    @Body() request: UpdateProfileRequest,
  ): Promise<UserDto> {
    const userId = (req as any).userId as string
    return this.updateProfileService.execute(userId, request)
  }
}
