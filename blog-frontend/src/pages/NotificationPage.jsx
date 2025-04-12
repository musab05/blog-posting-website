import { useState, useEffect } from 'react';
import { useAuth } from '../AuthProvider';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import {
  Trash2Icon,
  CheckCircleIcon,
  HeartIcon,
  MessageCircleIcon,
  UserPlusIcon,
  AtSignIcon,
  UserCheckIcon,
  UserXIcon,
  BellIcon,
  BookOpenIcon,
} from 'lucide-react';
import { useNotification } from '../NotificationProvider';

const NotificationPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchUserNotifications, setHasNotification } = useNotification();
  console.log(user)

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_DOMAIN}/notifications`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        console.log('Notifications:', response.data);
        setNotifications(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load notifications');
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const markAsRead = async notificationId => {
    try {
      await axios.patch(
        `${
          import.meta.env.VITE_SERVER_DOMAIN
        }/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      fetchUserNotifications();
      setHasNotification(notifications.some(n => !n.isRead));
    } catch (err) {
      toast.error('Failed to mark notification as read');
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/notifications/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      fetchUserNotifications();
      setHasNotification(false);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark all as read');
      console.error('Error marking all notifications as read:', err);
    }
  };

  const deleteNotification = async notificationId => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_SERVER_DOMAIN}/notifications/${notificationId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setHasNotification(notifications.some(n => !n.isRead));
      toast.success('Notification deleted');
    } catch (err) {
      toast.error('Failed to delete notification');
      console.error('Error deleting notification:', err);
    }
  };

  const handleFollowRequest = async (notificationId, action) => {
    try {
      const endpoint = action === 'accept' ? 'accept-follow' : 'reject-follow';
      await axios.post(
        `${
          import.meta.env.VITE_SERVER_DOMAIN
        }/notifications/${notificationId}/${endpoint}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      // Option 1: Optimistic update
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true, status: action } : n
        )
      );

      // Option 2: Refetch notifications to ensure consistency
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_DOMAIN}/notifications`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setNotifications(response.data);

      fetchUserNotifications();
      setHasNotification(notifications.some(n => !n.isRead));

      toast.success(`Follow request ${action}ed`);
    } catch (err) {
      toast.error(
        `Failed to ${action} follow request: ${
          err.response?.data?.message || 'Please try again'
        }`
      );
      console.error(`Error ${action}ing follow request:`, err);
    }
  };

  const getNotificationIcon = type => {
    switch (type) {
      case 'like':
        return <HeartIcon className="h-5 w-5 text-red-500" />;
      case 'comment':
        return <MessageCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'follow':
        return <UserPlusIcon className="h-5 w-5 text-green-500" />;
      case 'mention':
        return <AtSignIcon className="h-5 w-5 text-yellow-500" />;
      case 'blog':
        return <BookOpenIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationLink = notification => {
    if (notification.blogId) {
      return `/blogs/${notification.blogId}`;
    }
    if (notification.commentId) {
      return `/comments/${notification.commentId}`;
    }
    if (notification.type === 'follow') {
      return `/profile/${notification.Sender.username}`;
    }
    return '#';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex justify-between">
            Notifications
            <div className="flex gap-2">
              {notifications.some(n => !n.isRead) && (
                <CheckCircleIcon
                  className="h-6 w-6 text-green-600 cursor-pointer hover:text-green-800"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                />
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              No notifications yet
            </p>
          ) : (
            <div className="space-y-3">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    notification.isRead ? 'bg-white' : 'bg-gray-50'
                  } flex items-start justify-between`}
                >
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={notification.Sender.profileUrl} />
                      <AvatarFallback>
                        {notification.Sender.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <Link
                          to={`/profile/${notification.Sender.username}`}
                          className="font-medium hover:underline"
                        >
                          {notification.Sender.name}
                        </Link>
                        <span className="text-sm text-gray-500">
                          {new Date(notification.createdAt).toLocaleString()}
                        </span>
                        {!notification.isRead && (
                          <Badge variant="secondary">New</Badge>
                        )}
                        {notification.type === 'follow' &&
                          notification.status === 'accepted' && (
                            <Badge variant="outline" className="text-green-600">
                              Accepted
                            </Badge>
                          )}
                        {notification.type === 'follow' &&
                          notification.status === 'rejected' && (
                            <Badge variant="outline" className="text-red-600">
                              Rejected
                            </Badge>
                          )}
                      </div>
                      <p className="mt-1">{notification.message}</p>
                      <div className="mt-2 flex gap-2">
                        <Link to={getNotificationLink(notification)}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            View
                          </Button>
                        </Link>

                        {notification.type === 'follow' &&
                          !notification.isRead &&
                          !notification.status &&
                          user.isPrivate && (
                            <>
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() =>
                                  handleFollowRequest(notification.id, 'accept')
                                }
                              >
                                <UserCheckIcon className="h-4 w-4 mr-2" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleFollowRequest(notification.id, 'reject')
                                }
                              >
                                <UserXIcon className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </>
                          )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {!notification.isRead && (
                      <CheckCircleIcon
                        className="h-6 w-6 text-blue-600 cursor-pointer hover:text-blue-800"
                        onClick={() => markAsRead(notification.id)}
                        title="Mark as read"
                      />
                    )}
                    <Trash2Icon
                      className="h-6 w-6 text-red-600 cursor-pointer hover:text-red-800"
                      onClick={() => deleteNotification(notification.id)}
                      title="Delete notification"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationPage;
