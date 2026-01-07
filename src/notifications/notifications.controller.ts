import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';
import { User } from '../auth/user.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('register-token')
  async registerToken(@Body() body: { token: string }) {
    console.log('Received device token:', body.token);
    // Optional: Store in DB for later use
    return { message: 'Token received' };
  }

  @Post('send')
  async sendNotification(
    @Body('token') token: string,
    @Body('title') title: string,
    @Body('body') body: string,
    @Body('userId') userId: string,
    @Body('type') type: string = 'system',
    @Body('data') data: Record<string, any> = {},
  ) {
    // 1. Send push notification via Firebase
    const firebaseResponse = await this.notificationsService.sendNotification(token, title, body);
    
    // 2. Store notification in database (if userId provided)
    let savedNotification = null;
    if (userId) {
      savedNotification = await this.notificationsService.createNotification(
        userId,
        title,
        body,
        type,
        data,
      );
    }

    return {
      success: true,
      message: 'Notification sent and saved',
      firebaseResponse,
      notification: savedNotification,
    };
  }

  // ========== NEW NOTIFICATION LIST ENDPOINTS ==========

  // Get all notifications for logged-in user (paginated)
  @Get('list')
  @UseGuards(AuthGuard('jwt'))
  async getNotifications(
    @User() user: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    
    return this.notificationsService.getUserNotifications(user._id, pageNum, limitNum);
  }

  // Get unread notification count
  @Get('unread-count')
  @UseGuards(AuthGuard('jwt'))
  async getUnreadCount(@User() user: any) {
    const count = await this.notificationsService.getUnreadCount(user._id);
    return { unreadCount: count };
  }

  // Mark a single notification as read
  @Patch(':id/read')
  @UseGuards(AuthGuard('jwt'))
  async markAsRead(@User() user: any, @Param('id') notificationId: string) {
    return this.notificationsService.markAsRead(notificationId, user._id);
  }

  // Mark all notifications as read
  @Patch('read-all')
  @UseGuards(AuthGuard('jwt'))
  async markAllAsRead(@User() user: any) {
    return this.notificationsService.markAllAsRead(user._id);
  }

  // Delete a single notification
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteNotification(@User() user: any, @Param('id') notificationId: string) {
    return this.notificationsService.deleteNotification(notificationId, user._id);
  }

  // Delete all notifications
  @Delete('delete-all')
  @UseGuards(AuthGuard('jwt'))
  async deleteAllNotifications(@User() user: any) {
    return this.notificationsService.deleteAllNotifications(user._id);
  }
}