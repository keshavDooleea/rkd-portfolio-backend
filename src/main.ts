import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const port = process.env.PORT || process.env.CUSTOM_PORT;

  app.enableCors();
  await app.listen(port, () => console.log(`listening on port ${port}`));
}
bootstrap();
