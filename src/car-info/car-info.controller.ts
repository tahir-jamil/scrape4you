import { Controller, Post, Get, Body, BadRequestException, Patch, Param, HttpStatus, HttpException, Put, Delete, UseGuards, UseInterceptors, UploadedFile} from '@nestjs/common';
import { CarInfoService } from './car-info.service';
import { Twilio } from 'twilio';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express'; // Import Express types
import { S3Service } from './upload-image'; // Import the S3 service
import { CarDetailsService } from 'src/car-details.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/auth/user.decorator';

import * as admin from 'firebase-admin';

@Controller('car')
export class CarInfoController {

  private twilioClient: Twilio;
  constructor(
    private readonly carInfoService: CarInfoService,
    private readonly carDetailsService: CarDetailsService,
    private readonly s3Service: S3Service) {
    this.twilioClient = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    // Initialize Firebase 
      admin.initializeApp({
              credential: admin.credential.cert({
                projectId: 'busymors',
                clientEmail: 'firebase-adminsdk-fbsvc@busymors.iam.gserviceaccount.com',
                privateKey: process.env.FIREBASE_SECRET.replace(/\\n/g, '\n'),
            }),
        });

  }

  @Post('submit-form')
  @UseInterceptors(FileInterceptor('carPhoto'))

  async getCarDetails(
    @UploadedFile() carPhoto: Express.Multer.File,
    @Body() body: any) {

    console.log('This is formdata: ', body);
    console.log('original file is: ', carPhoto);
 
    let carImage = 'N/A'
    if(carPhoto){
        //upload the car image into s3
        carImage = await this.s3Service.uploadFile(carPhoto)
      }

    const formData = {
      ...body,
      carImage: carImage
    }

    // const nearbyAgents = await this.carDetailsService.fetchAllAgents()
    // const tokens = nearbyAgents.map((agent) => agent.fcm_token);

    // try{
    //   await admin.messaging().sendEachForMulticast({
    //         tokens,
    //         notification: {
    //           title: 'New Vehicle Near You! 🚗',
    //           body: `A new car was listed nearby.`,
    //         }
    //       });

    //     return {
    //       success: true,
    //       message: "Notification successfully sent."
    //     }
    // }
    // catch (error){
    //   throw new HttpException('Failed to send notification.', error);
    // }
    

    if (!formData.registrationNumber) {
      throw new BadRequestException('Registration number is required');
    }   

    try {

      // save form data or perform business logic
      const carDetails =  await this.carInfoService.getCarDetails(formData);

      // Send sms notification
      const baseUrl = 'https://scrape4you.onrender.com/edit-form/'
      const editLink = `${baseUrl}${carDetails.uniqueId}`
      const message = `Hello, your information has been saved successfully. Our agent will contact you soon. In order to edit or delete your posting go to ${editLink}`;
      // const smsResponse = await this.twilioClient.messages.create({
      //   to: fromData.phoneNumber,
      //   from: process.env.TWILIO_PHONE_NUMBER,
      //   body: message,
      // });

      // 1. Fetch all agents with FCM tokens
      const nearbyAgents = await this.carDetailsService.fetchAllAgents()
      const tokens = nearbyAgents.map((agent) => agent.fcm_token);

      await admin.messaging().sendEachForMulticast({
        tokens,
        notification: {
          title: 'New Vehicle Near You! 🚗',
          body: `A ${carDetails.make} ${carDetails.model} was listed nearby.`,
        },
        "android": {
        "notification": {
          "sound": "notif_sound" // No extension for Android
        }
      },
        "apns": {
        "payload": {
          "aps": {
            "sound": "notif_sound.wav" // Full name with extension for iOS
          }
        }
      }
      });

      return {
        success: true,
        message: 'Form submitted successfully and SMS sent.',
        carDetails,
        // smsResponse,
      };

    } catch (error) {
      
      console.error('Error processing form or sending SMS:', error);
      throw new HttpException('Failed to process form or send SMS.', HttpStatus.INTERNAL_SERVER_ERROR);

    }

  }

  @Patch(':id/mark-sold')
  async markCarAsSold(@Param('registration-num') id: string) {
    const updatedCar = await this.carInfoService.markAsSold(id);
    return {
      message: 'Car marked as sold successfully',
      data: updatedCar,
    };
  }

  @Get('get-all-listing')
  @UseGuards(AuthGuard('jwt'))
  async getAllListings(){
    return this.carInfoService.getAllListing()
  }

  @Get('get-single-listing/:_id')
  @UseGuards(AuthGuard('jwt'))
  async getSingleListing(@Param('_id') id: string) {
    return this.carInfoService.getSingleListing(id);
  }

  @Get('get-data/:uniqueId')
  async getForm(@Param('uniqueId') uniqueId: string) {
    return this.carInfoService.getFormByUniqueId(uniqueId);
  }

  @Put('edit-form/:uniqueId')
  async updateForm(
    @Param('uniqueId') uniqueId: string,
    @Body() updatedData: any,) {
    
      try {
        const carDetails = this.carInfoService.updateFormByUniqueId(uniqueId, updatedData);
        return{
          success: true,
          message: 'updated successfully.',
          carDetails
        }
        
      } catch (error) {  
        console.error('Error deleting the form:', error);
        throw new HttpException('Failed to delete the data.', HttpStatus.INTERNAL_SERVER_ERROR);
      
      }
    
     
  }

  @Delete('delete-data/:uniqueId')
  async deleteForm(@Param('uniqueId') uniqueId: string) {
    try {
      const details =  this.carInfoService.deleteFormByUniqueId(uniqueId);
    return{
      success: true,
      message: 'deleted successfully.',
      details
    }
      
    } catch (error) {
      console.error('Error deleting the form:', error);
      throw new HttpException('Failed to delete the data.', HttpStatus.INTERNAL_SERVER_ERROR);
      
    }
    
  }

  // update the views logic

  @Post(':_id/view')
  @UseGuards(AuthGuard('jwt'))
  async viewCar(@User() user:any, @Param('_id') carId: string) {
    const userId = user._id
    return this.carDetailsService.viewCar(userId, carId);
  }

  @Get(':_id/views')
  async getTotalViews(@Param('_id') carId: string) {
    return this.carDetailsService.getTotalViews(carId);
  }


}
