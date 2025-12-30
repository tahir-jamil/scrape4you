import { Injectable, UnauthorizedException, HttpException, BadRequestException  } from '@nestjs/common';
import { Admin } from './admin.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../auth/schemas/user.schema';
import { CarDetails } from '../car-details.schema';

// Pagination response interface
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

@Injectable()
export class AdminService{
    constructor(
        @InjectModel('Admin') private adminModel: Model<Admin>,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(CarDetails.name) private carModel: Model<CarDetails>,
    ){}

    async registerAdmin(email:string, password:string){
        if (!password){
            throw new UnauthorizedException('Password is required')
        }
        const existingAdmin = await this.adminModel.findOne({email}).exec();

        console.log('Existing Admin--->', existingAdmin);
        if (existingAdmin){
            throw new UnauthorizedException('Email already exists');
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new this.adminModel({email:email, password: hashedPassword})

        return user.save()
    }

    async findAdmin(email:string){
        return this.adminModel.findOne({email}).exec();
    }

    // Get all users with pagination (excludes guest users)
    async getAllUsers(page: number = 1, limit: number = 10, search?: string): Promise<PaginatedResponse<User>> {
        const skip = (page - 1) * limit;
        
        // Build query filter - exclude guest users
        let filter: any = { is_guest: { $ne: true } };
        
        if (search) {
            filter.$or = [
                { first_name: { $regex: search, $options: 'i' } },
                { last_name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
            ];
        }

        const [data, total] = await Promise.all([
            this.userModel
                .find(filter)
                .select('-password') // Exclude password from response
                .sort({ date_created: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.userModel.countDocuments(filter).exec(),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    }

    // Get all cars with pagination
    async getAllCars(page: number = 1, limit: number = 10, search?: string, tag?: string): Promise<PaginatedResponse<CarDetails>> {
        const skip = (page - 1) * limit;
        
        // Build query filter
        let filter: any = {};
        
        if (tag && (tag === 'scrap' || tag === 'salvage')) {
            filter.tag = tag;
        }

        if (search) {
            filter.$or = [
                { registrationNumber: { $regex: search, $options: 'i' } },
                { make: { $regex: search, $options: 'i' } },
                { model: { $regex: search, $options: 'i' } },
                { fullAddress: { $regex: search, $options: 'i' } },
            ];
        }

        const [data, total] = await Promise.all([
            this.carModel
                .find(filter)
                .sort({ date_added: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.carModel.countDocuments(filter).exec(),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    }

    // Combined endpoint - get data by type
    async getDataByType(
        type: 'users' | 'cars',
        page: number = 1,
        limit: number = 10,
        search?: string,
        tag?: string
    ): Promise<PaginatedResponse<User | CarDetails>> {
        if (type === 'users') {
            return this.getAllUsers(page, limit, search);
        } else if (type === 'cars') {
            return this.getAllCars(page, limit, search, tag);
        } else {
            throw new BadRequestException('Invalid type. Use "users" or "cars"');
        }
    }

    // Get dashboard stats (excludes guest users from counts)
    async getDashboardStats() {
        const [totalUsers, guestUsers, totalCars, totalScrap, totalSalvage, soldCars, blockedUsers] = await Promise.all([
            this.userModel.countDocuments({ is_guest: { $ne: true } }).exec(), // Exclude guests
            this.userModel.countDocuments({ is_guest: true }).exec(), // Count guests separately
            this.carModel.countDocuments().exec(),
            this.carModel.countDocuments({ tag: 'scrap' }).exec(),
            this.carModel.countDocuments({ tag: 'salvage' }).exec(),
            this.carModel.countDocuments({ isSold: true }).exec(),
            this.userModel.countDocuments({ is_blocked: true, is_guest: { $ne: true } }).exec(), // Exclude guests
        ]);

        return {
            totalUsers,
            guestUsers,
            totalCars,
            totalScrap,
            totalSalvage,
            soldCars,
            activeCars: totalCars - soldCars,
            blockedUsers,
        };
    }
}