import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as admin from 'firebase-admin';
import { Notification, NotificationDocument } from './notification.schema';

// Pagination response interface
export interface PaginatedNotifications {
  data: Notification[];
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
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
  ) {}

  // Send push notification via Firebase
  async sendNotification(token: string, title: string, body: string): Promise<string> {
    try {
      const message = {
        token,
        notification: {
          title,
          body,
        },
      };

      const response = await admin.messaging().send(message);
      return `Notification sent: ${response}`;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw new Error('Failed to send notification');
    }
  }

  // Create and store a notification in database
  async createNotification(
    userId: string,
    title: string,
    body: string,
    type: string = 'car_listing',
    data: Record<string, any> = {},
  ): Promise<Notification> {
    const notification = new this.notificationModel({
      userId: new Types.ObjectId(userId),
      title,
      body,
      type,
      data,
      isRead: false,
    });

    return notification.save();
  }

  // Create notifications for multiple users
  async createNotificationsForUsers(
    userIds: string[],
    title: string,
    body: string,
    type: string = 'car_listing',
    data: Record<string, any> = {},
  ): Promise<number> {
    const notifications = userIds.map((userId) => ({
      userId: new Types.ObjectId(userId),
      title,
      body,
      type,
      data,
      isRead: false,
      createdAt: new Date(),
    }));

    const result = await this.notificationModel.insertMany(notifications);
    return result.length;
  }

  // Get all notifications for a user (paginated)
  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<PaginatedNotifications> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.notificationModel
        .find({ userId: new Types.ObjectId(userId) })
        .sort({ createdAt: -1 }) // Latest first
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments({ userId: new Types.ObjectId(userId) }).exec(),
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

  // Get unread notification count
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
    }).exec();
  }

  // Mark a single notification as read
  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationModel.findOneAndUpdate(
      { _id: notificationId, userId: new Types.ObjectId(userId) },
      { isRead: true },
      { new: true },
    ).exec();

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    const result = await this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { isRead: true },
    ).exec();

    return { modifiedCount: result.modifiedCount };
  }

  // Delete a single notification
  async deleteNotification(notificationId: string, userId: string): Promise<{ message: string }> {
    const result = await this.notificationModel.deleteOne({
      _id: notificationId,
      userId: new Types.ObjectId(userId),
    }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('Notification not found');
    }

    return { message: 'Notification deleted successfully' };
  }

  // Delete all notifications for a user
  async deleteAllNotifications(userId: string): Promise<{ deletedCount: number }> {
    const result = await this.notificationModel.deleteMany({
      userId: new Types.ObjectId(userId),
    }).exec();

    return { deletedCount: result.deletedCount };
  }
}