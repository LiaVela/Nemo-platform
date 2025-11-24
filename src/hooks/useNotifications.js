// src/hooks/useNotifications.js
import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification 
} from '@/services/notificationService';

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notificationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
        
        setNotifications(notificationsData);
        setUnreadCount(notificationsData.filter(n => n.unread).length);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error al cargar notificaciones:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const markAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
    } catch (err) {
      console.error('Error al marcar como leída:', err);
      setError(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(userId);
    } catch (err) {
      console.error('Error al marcar todas como leídas:', err);
      setError(err);
    }
  };

  const deleteOne = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
    } catch (err) {
      console.error('Error al eliminar notificación:', err);
      setError(err);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteOne
  };
};