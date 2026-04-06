import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { Request } from 'express'
import { GetCurrentUserService } from '../../application/services/get-current-user.service'
import { UserDto } from '../../application/dtos/user.dto'
import { AuthGuard } from '../../../shared/infrastructure/guards/auth.guard'

@Controller('auth')
export class AuthController {
  constructor(private readonly getCurrentUser: GetCurrentUserService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@Req() req: Request): Promise<UserDto> {
    const userId = (req as any).userId as string
    const user = await this.getCurrentUser.execute(userId)
    return UserDto.fromEntity(user)
  }
}
