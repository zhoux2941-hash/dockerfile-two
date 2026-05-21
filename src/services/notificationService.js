const NotificationModel = require('../models/notificationModel');

class NotificationService {
  static async sendTaskAssignment(task) {
    if (!task.assignee_id) return;
    
    try {
      const notification = NotificationModel.create({
        user_id: task.assignee_id,
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: `You have been assigned to "${task.title}"`
      });
      
      console.log(`Notification sent to user ${task.assignee_id}: Task assignment`);
      return notification;
    } catch (error) {
      console.error('Error sending task assignment notification:', error);
    }
  }

  static async sendTaskCompletion(task) {
    if (!task.reporter_id) return;
    
    try {
      const notification = NotificationModel.create({
        user_id: task.reporter_id,
        type: 'task_completed',
        title: 'Task Completed',
        message: `Task "${task.title}" has been marked as completed`
      });
      
      console.log(`Notification sent to user ${task.reporter_id}: Task completion`);
      return notification;
    } catch (error) {
      console.error('Error sending task completion notification:', error);
    }
  }

  static async sendCommentNotification(task, comment) {
    const recipients = new Set();
    
    if (task.assignee_id) recipients.add(task.assignee_id);
    if (task.reporter_id) recipients.add(task.reporter_id);
    
    recipients.forEach(userId => {
      if (userId !== comment.user_id) {
        try {
          const notification = NotificationModel.create({
            user_id: userId,
            type: 'comment',
            title: 'New Comment',
            message: `New comment on "${task.title}": ${comment.content.substring(0, 50)}...`
          });
          
          console.log(`Notification sent to user ${userId}: New comment`);
        } catch (error) {
          console.error(`Error sending comment notification to user ${userId}:`, error);
        }
      }
    });
  }

  static async sendProjectUpdateNotification(project, message) {
    // Get all users involved in the project
    const { getDb } = require('../config/database');
    const db = getDb();
    
    const teamMembers = db.prepare(`
      SELECT DISTINCT assignee_id as user_id FROM tasks WHERE project_id = ?
      UNION
      SELECT DISTINCT reporter_id as user_id FROM tasks WHERE project_id = ?
    `).all(project.id, project.id);
    
    teamMembers.forEach(member => {
      if (member.user_id) {
        try {
          NotificationModel.create({
            user_id: member.user_id,
            type: 'project_update',
            title: 'Project Update',
            message: message
          });
          
          console.log(`Notification sent to user ${member.user_id}: Project update`);
        } catch (error) {
          console.error(`Error sending project notification to user ${member.user_id}:`, error);
        }
      }
    });
  }

  static async sendMentionNotification(mentionedUserId, mentionerName, taskTitle, context) {
    try {
      const notification = NotificationModel.create({
        user_id: mentionedUserId,
        type: 'mention',
        title: 'You were mentioned',
        message: `${mentionerName} mentioned you in "${taskTitle}": ${context}`
      });
      
      console.log(`Mention notification sent to user ${mentionedUserId}`);
      return notification;
    } catch (error) {
      console.error('Error sending mention notification:', error);
    }
  }

  static async sendDeadlineReminder(task) {
    if (!task.assignee_id) return;
    
    try {
      const notification = NotificationModel.create({
        user_id: task.assignee_id,
        type: 'deadline_reminder',
        title: 'Task Deadline Approaching',
        message: `Task "${task.title}" is due on ${task.due_date}`
      });
      
      console.log(`Deadline reminder sent to user ${task.assignee_id}`);
      return notification;
    } catch (error) {
      console.error('Error sending deadline reminder:', error);
    }
  }
}

module.exports = NotificationService;