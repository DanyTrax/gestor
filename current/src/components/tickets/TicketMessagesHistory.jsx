import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { collection, onSnapshot, query, orderBy, where, addDoc, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../../config/firebase';
import { UserIcon, ClockIcon, MessageIcon, PaperClipIcon } from '../icons';

function TicketMessagesHistory({ ticketId, isDemo, userRole, currentUser }) {
  const { addNotification } = useNotification();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isDemo) {
      setMessages([
        {
          id: 'msg1',
          ticketId: ticketId,
          content: 'Hola, tengo un problema con el acceso a mi panel de cliente. No puedo iniciar sesión desde ayer.',
          senderId: 'client1',
          senderName: 'Juan Pérez',
          senderRole: 'client',
          senderEmail: 'juan@ejemplo.com',
          isInternal: false,
          createdAt: { seconds: Date.now() / 1000 - 3600 },
          attachments: []
        },
        {
          id: 'msg2',
          ticketId: ticketId,
          content: 'Hola Juan, gracias por contactarnos. He revisado tu cuenta y veo que hay un problema con la configuración de tu perfil. Voy a solucionarlo ahora mismo.',
          senderId: 'admin1',
          senderName: 'Admin Principal',
          senderRole: 'admin',
          senderEmail: 'admin@empresa.com',
          isInternal: false,
          createdAt: { seconds: Date.now() / 1000 - 1800 },
          attachments: []
        },
        {
          id: 'msg3',
          ticketId: ticketId,
          content: 'Nota interna: El cliente tiene un problema de configuración en su perfil. Necesito revisar la base de datos.',
          senderId: 'admin1',
          senderName: 'Admin Principal',
          senderRole: 'admin',
          senderEmail: 'admin@empresa.com',
          isInternal: true,
          createdAt: { seconds: Date.now() / 1000 - 900 },
          attachments: []
        }
      ]);
      setLoading(false);
      return;
    }

    if (!ticketId) {
      setLoading(false);
      return;
    }

    const messagesQuery = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'ticketMessages'),
      where('ticketId', '==', ticketId)
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Ordenar por fecha de creación en el cliente para evitar necesidad de índice compuesto
      messagesData.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateA - dateB; // Orden ascendente (más antiguos primero)
      });
      
      setMessages(messagesData);
      setLoading(false);
    }, (error) => {
      console.error('Error loading messages:', error);
      addNotification('Error al cargar los mensajes', 'error');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [ticketId, isDemo, addNotification]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    setSending(true);

    if (isDemo) {
      const demoMessage = {
        id: `msg_${Date.now()}`,
        ticketId: ticketId,
        content: newMessage,
        senderId: currentUser?.uid || 'demo',
        senderName: currentUser?.displayName || 'Usuario Demo',
        senderRole: userRole || 'client',
        senderEmail: currentUser?.email || 'demo@ejemplo.com',
        isInternal: false,
        createdAt: { seconds: Date.now() / 1000 },
        attachments: []
      };
      setMessages(prev => [...prev, demoMessage]);
      setNewMessage('');
      setSending(false);
      addNotification('Mensaje enviado (modo demo)', 'success');
      
      // Notificar al componente padre que se actualizó el contador
      if (window.updateTicketReplyCount) {
        window.updateTicketReplyCount(ticketId, messages.length + 1);
      }
      return;
    }

    try {
      const messageData = {
        ticketId: ticketId,
        content: newMessage.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email,
        senderRole: userRole,
        senderEmail: currentUser.email,
        isInternal: false,
        createdAt: Timestamp.now(),
        attachments: []
      };

      // Agregar el mensaje
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'ticketMessages'), messageData);
      
      // Actualizar el contador de respuestas del ticket
      const ticketRef = doc(db, 'artifacts', appId, 'public', 'data', 'tickets', ticketId);
      await updateDoc(ticketRef, {
        replyCount: messages.length + 1,
        lastReplyAt: Timestamp.now(),
        lastReplyBy: currentUser.displayName || currentUser.email,
        updatedAt: Timestamp.now()
      });
      
      setNewMessage('');
      addNotification('Mensaje enviado', 'success');
    } catch (error) {
      console.error('Error sending message:', error);
      addNotification('Error al enviar el mensaje', 'error');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '--';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '--';
    const now = new Date();
    const date = new Date(timestamp.seconds * 1000);
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffMinutes > 0) return `hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
    return 'hace unos segundos';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Historial de mensajes */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p>No hay mensajes en este ticket</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderRole === 'client' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderRole === 'client'
                    ? 'bg-gray-100 text-gray-900'
                    : message.isInternal
                    ? 'bg-yellow-100 text-yellow-900 border border-yellow-300'
                    : 'bg-blue-100 text-blue-900'
                }`}
              >
                {message.isInternal && (
                  <div className="text-xs font-semibold text-yellow-700 mb-1">
                    NOTA INTERNA
                  </div>
                )}
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <UserIcon />
                    <span>{message.senderName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ClockIcon />
                    <span>{getTimeAgo(message.createdAt)}</span>
                  </div>
                </div>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-300">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <PaperClipIcon />
                      <span>{message.attachments.length} archivo{message.attachments.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Formulario para enviar mensaje */}
      <div className="border-t pt-4">
        <form onSubmit={handleSendMessage} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {userRole === 'client' ? 'Responder al ticket' : 'Responder al cliente'}
            </label>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder={
                userRole === 'client'
                  ? 'Escribe tu respuesta aquí...'
                  : 'Escribe tu respuesta al cliente aquí...'
              }
              required
            />
          </div>
          
          {userRole === 'admin' || userRole === 'superadmin' ? (
            <div className="flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Nota interna (solo visible para administradores)</span>
              </label>
            </div>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <MessageIcon />
                  Enviar Mensaje
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TicketMessagesHistory;

