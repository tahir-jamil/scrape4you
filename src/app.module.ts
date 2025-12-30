import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CarInfoService } from './car-info/car-info.service';
import { CarInfoController } from './car-info/car-info.controller';

import { ConfigModule } from '@nestjs/config';

import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { MongooseModule } from '@nestjs/mongoose';

import { CarDetails, CarDetailsSchema } from './car-details.schema'; // Import the schema
import { CarDetailsService } from './car-details.service';

import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';  // Import AuthController
import { User, UserSchema } from './auth/schemas/user.schema';  // Import User schema
import { AuthService } from './auth/auth.service';
import { UserService } from './auth/user.service';
import { JwtModule } from '@nestjs/jwt';  // Import JwtModule (if using in AppModule)
import { S3Service } from './car-info/upload-image';
import { StripeModule } from './stripe/stripe.module';
import { AdminModule } from './admin/admin.module';
import { Otp, OtpSchema } from './auth/schemas/otp.schema';
import { QuotesModule } from './quote/quote.module';
import { NotificationsModule } from './notifications/notifications.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'scrape_frontend', 'build'), // Path to React build folder
    }),
    MongooseModule.forRoot(process.env.MONGODB_URL, { dbName: 'Busymotors' }),
    MongooseModule.forFeature([
      { name: CarDetails.name, schema: CarDetailsSchema },  // Car schema
      { name: User.name, schema: UserSchema },
      {name: Otp.name, schema: OtpSchema}               // User schema
    ]),
    
    JwtModule.register({
      secret: process.env.JWT_SECRET, // Make sure this is correct
      signOptions: { expiresIn: '90d' }, // You can adjust the expiration time
    }),

    AuthModule, // Auth module handles registration and login
    StripeModule,
    AdminModule,
    QuotesModule,
    NotificationsModule,
  ],
  controllers: [AppController, CarInfoController, AuthController],
  providers: [AppService, CarInfoService, CarDetailsService, AuthService, UserService, S3Service],
})
export class AppModule {}
