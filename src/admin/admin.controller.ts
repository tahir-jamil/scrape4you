import { Controller, Post, Body, UnauthorizedException, Get, Query, BadRequestException } from '@nestjs/common';
import { AdminService } from './admin.service';
import * as bcrypt from 'bcrypt';


@Controller('admin')
export class AdminController{
    constructor(
        private adminService: AdminService
    ) {}

    @Post('register')
    async register(@Body() body: any){
        const {email, password} = body;

        const admin = await this.adminService.registerAdmin(email, password);
        return {message: "Registration Successful", admin};
        
    }

    @Post('login')
    async login(@Body() body: any){
        const {email, password} = body;

        const admin = await this.adminService.findAdmin(email);
        if (!admin) throw new UnauthorizedException('Invalid Email or password');

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if(!isPasswordValid) throw new UnauthorizedException('Invalid Email or password');
        
        return {
            message: "Login Successful",
            admin: {email: admin.email, id: admin._id}
        }

    }

    // Get all users with pagination
    @Get('users')
    async getAllUsers(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query('search') search?: string,
    ) {
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        
        return this.adminService.getAllUsers(pageNum, limitNum, search);
    }

    // Get all cars with pagination
    @Get('cars')
    async getAllCars(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query('search') search?: string,
        @Query('tag') tag?: string, // Filter by 'scrap' or 'salvage'
    ) {
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        
        return this.adminService.getAllCars(pageNum, limitNum, search, tag);
    }

    // Combined endpoint - pass type=users or type=cars
    @Get('data')
    async getDataByType(
        @Query('type') type: 'users' | 'cars',
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query('search') search?: string,
        @Query('tag') tag?: string,
    ) {
        if (!type) {
            throw new BadRequestException('Type parameter is required. Use "users" or "cars"');
        }
        
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 10;
        
        return this.adminService.getDataByType(type, pageNum, limitNum, search, tag);
    }

    // Dashboard statistics
    @Get('stats')
    async getDashboardStats() {
        return this.adminService.getDashboardStats();
    }
}