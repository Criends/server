import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './domains/user/user.module';
import { AdminModule } from './domains/admin/admin.module';
import { CompanyModule } from './domains/company/company.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './domains/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { ResumeModule } from './domains/resume/resume.module';
import { PortfolioModule } from './domains/portfolio/portfolio.module';
import { KakaoAuthModule } from './domains/kakao-auth/kakao-auth.module';
import { NaverAuthModule } from './domains/naver-auth/naver-auth.module';
import { GoogleAuthModule } from './domains/google-auth/google-auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `../.env`,
    }),
    UserModule,
    AdminModule,
    CompanyModule,
    PrismaModule,
    AuthModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        global: true,
      }),
      inject: [ConfigService],
    }),
    ResumeModule,
    PortfolioModule,
    KakaoAuthModule,
    NaverAuthModule,
    GoogleAuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
