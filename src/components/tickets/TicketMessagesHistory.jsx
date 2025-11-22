import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { collection, onSnapshot, query, orderBy, where, addDoc, Timestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, appId } from '../../config/firebase';
import { UserIcon, ClockIcon, MessageIcon, PaperClipIcon } from '../icons';
import { sendEmail, loadEmailConfig } from '../../services/emailService';

function TicketMessagesHistory({ ticketId, userRole, currentUser }) {
  const { addNotification } = useNotification();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
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
  }, [ticketId, addNotification]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    setSending(true);

    try {
      const messageData = {
        ticketId: ticketId,
        content: newMessage.trim(),
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email,
        senderRole: userRole,
        senderEmail: currentUser.email,
        isInternal: isInternal && (userRole === 'admin' || userRole === 'superadmin'),
        createdAt: Timestamp.now(),
        attachments: []
      };

      // Agregar el mensaje
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'ticketMessages'), messageData);
      
      // Obtener información del ticket para las notificaciones
      const ticketRef = doc(db, 'artifacts', appId, 'public', 'data', 'tickets', ticketId);
      const ticketDoc = await getDoc(ticketRef);
      const ticket = ticketDoc.exists() ? { id: ticketDoc.id, ...ticketDoc.data() } : null;
      
      // Actualizar el contador de respuestas del ticket
      await updateDoc(ticketRef, {
        replyCount: messages.length + 1,
        lastReplyAt: Timestamp.now(),
        lastReplyBy: currentUser.displayName || currentUser.email,
        updatedAt: Timestamp.now(),
        // Si el admin responde, cambiar estado a "Respondido"
        ...(userRole === 'admin' || userRole === 'superadmin' ? { status: 'Respondido' } : {})
      });
      
      // Enviar notificaciones por email (solo si NO es nota interna)
      if (ticket && !messageData.isInternal) {
        try {
          console.log('📧 [TICKET] Iniciando envío de notificaciones por respuesta');
          await loadEmailConfig();
          
          const ticketNumber = ticket.ticketNumber;
          const ticketSubject = ticket.subject;
          const messageContent = newMessage.trim();
          const senderName = currentUser.displayName || currentUser.email;
          const senderEmail = currentUser.email;
          const emailConfig = await loadEmailConfig();
          
          if (userRole === 'client') {
            // Cliente responde - Notificar al administrador
            const adminEmail = emailConfig?.fromEmail;
            if (adminEmail) {
              console.log('📧 [TICKET] Enviando email al administrador por respuesta del cliente:', adminEmail);
              const adminEmailHtml = `
                <h2>Nueva Respuesta - Ticket ${ticketNumber}</h2>
                <p>El cliente ha respondido a su ticket de soporte.</p>
                <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                  <p><strong>Número de Ticket:</strong> ${ticketNumber}</p>
                  <p><strong>Cliente:</strong> ${ticket.clientName || senderName}${ticket.clientEmail ? ` (${ticket.clientEmail})` : ''}</p>
                  <p><strong>Asunto:</strong> ${ticketSubject}</p>
                  <p><strong>Respuesta:</strong></p>
                  <p style="white-space: pre-wrap; background-color: #ffffff; padding: 10px; border-radius: 3px; margin-top: 10px;">${messageContent}</p>
                </div>
                <p>Por favor, revisa y responde desde el panel de administración.</p>
              `;
              
              await sendEmail({
                to: adminEmail,
                toName: emailConfig?.fromName || 'Administrador',
                subject: `Nueva Respuesta - Ticket ${ticketNumber}`,
                html: adminEmailHtml,
                text: `Nueva Respuesta - Ticket ${ticketNumber}\n\nEl cliente ha respondido a su ticket de soporte.\n\nNúmero de Ticket: ${ticketNumber}\nCliente: ${ticket.clientName || senderName}${ticket.clientEmail ? ` (${ticket.clientEmail})` : ''}\nAsunto: ${ticketSubject}\n\nRespuesta:\n${messageContent}\n\nPor favor, revisa y responde desde el panel de administración.`,
                type: 'Notificación',
                recipientType: 'Administrador',
                module: 'tickets',
                event: 'ticketReply',
                metadata: {
                  ticketId: ticketId,
                  ticketNumber: ticketNumber,
                  senderEmail: senderEmail,
                  senderName: senderName
                }
              });
            }
          } else {
            // Admin responde - Notificar al cliente
            const clientEmail = ticket.clientEmail;
            if (clientEmail) {
              console.log('📧 [TICKET] Enviando email al cliente por respuesta del administrador:', clientEmail);
              const clientEmailHtml = `
                <h2>Nueva Respuesta - Ticket ${ticketNumber}</h2>
                <p>Estimado/a <strong>${ticket.clientName || 'Cliente'}</strong>,</p>
                <p>Hemos respondido a tu ticket de soporte.</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p><strong>Número de Ticket:</strong> ${ticketNumber}</p>
                  <p><strong>Asunto:</strong> ${ticketSubject}</p>
                  <p><strong>Respuesta:</strong></p>
                  <p style="white-space: pre-wrap; background-color: #ffffff; padding: 10px; border-radius: 3px; margin-top: 10px;">${messageContent}</p>
                </div>
                <p>Puedes ver la respuesta completa y responder desde tu panel de cliente.</p>
                <p>Saludos cordiales,<br>Equipo de Soporte</p>
              `;
              
              await sendEmail({
                to: clientEmail,
                toName: ticket.clientName || 'Cliente',
                subject: `Respuesta a Ticket ${ticketNumber} - ${ticketSubject}`,
                html: clientEmailHtml,
                text: `Nueva Respuesta - Ticket ${ticketNumber}\n\nEstimado/a ${ticket.clientName || 'Cliente'},\n\nHemos respondido a tu ticket de soporte.\n\nNúmero de Ticket: ${ticketNumber}\nAsunto: ${ticketSubject}\n\nRespuesta:\n${messageContent}\n\nPuedes ver la respuesta completa y responder desde tu panel de cliente.\n\nSaludos cordiales,\nEquipo de Soporte`,
                type: 'Notificación',
                recipientType: 'Cliente',
                module: 'tickets',
                event: 'ticketReply',
                metadata: {
                  ticketId: ticketId,
                  ticketNumber: ticketNumber,
                  senderEmail: senderEmail,
                  senderName: senderName
                }
              });
            }
          }
          
          console.log('✅ [TICKET] Notificaciones por respuesta completadas');
        } catch (emailError) {
          console.error("❌ [TICKET] Error sending reply notification emails:", emailError);
          // No fallar el envío del mensaje si falla el email
        }
      }
      
      setNewMessage('');
      setIsInternal(false);
      addNotification(messageData.isInternal ? 'Nota interna agregada' : 'Mensaje enviado', 'success');
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
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
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

