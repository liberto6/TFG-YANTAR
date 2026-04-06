import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'
import { DomainExceptionFilter } from './shared/infrastructure/filters/domain-exception.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.enableCors({
    origin: true,
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  app.useGlobalFilters(new DomainExceptionFilter())

  const port = process.env.PORT ?? 3001
  await app.listen(port)
  console.log(`Backend running on http://localhost:${port}`)
}

bootstrap()
