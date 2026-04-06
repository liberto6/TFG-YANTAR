import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common'
import { Response } from 'express'
import { DomainError } from '@yantar/shared'

const CODE_TO_STATUS: Record<string, HttpStatus> = {
  USER_NOT_FOUND: HttpStatus.NOT_FOUND,
  COMPANY_NOT_FOUND: HttpStatus.NOT_FOUND,
  BRANCH_NOT_FOUND: HttpStatus.NOT_FOUND,
  DELIVERY_ZONE_NOT_FOUND: HttpStatus.NOT_FOUND,
  CATEGORY_NOT_FOUND: HttpStatus.NOT_FOUND,
  DISH_NOT_FOUND: HttpStatus.NOT_FOUND,
  ORDER_NOT_FOUND: HttpStatus.NOT_FOUND,
  AUTHORIZATION_ERROR: HttpStatus.FORBIDDEN,
  SLUG_ALREADY_TAKEN: HttpStatus.CONFLICT,
  EMAIL_ALREADY_IN_USE: HttpStatus.CONFLICT,
  EMPTY_CART: HttpStatus.BAD_REQUEST,
  INVALID_ORDER_TRANSITION: HttpStatus.UNPROCESSABLE_ENTITY,
}

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    const status =
      CODE_TO_STATUS[exception.code] ?? HttpStatus.UNPROCESSABLE_ENTITY

    response.status(status).json({
      statusCode: status,
      error: exception.code,
      message: exception.message,
    })
  }
}
