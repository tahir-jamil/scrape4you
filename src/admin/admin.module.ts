import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminSchema } from './admin.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { CarDetails, CarDetailsSchema } from '../car-details.schema';


@Module({
    
    imports: [
        MongooseModule.forFeature([
          { name: 'Admin', schema: AdminSchema },
          { name: User.name, schema: UserSchema },
          { name: CarDetails.name, schema: CarDetailsSchema },
        ]),
      ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {

}