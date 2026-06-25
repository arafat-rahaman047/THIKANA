import api from './api';

export const listConversations = () => api.get('/conversations');
export const startConversation = (propertyId, messageText) => {
  return api.post('/conversations', { propertyId, messageText });
};
export const getMessages = (conversationId) => api.get(`/conversations/${conversationId}/messages`);
export const sendMessage = (conversationId, messageText) => {
  return api.post(`/conversations/${conversationId}/messages`, { messageText });
};

const messageService = {
  listConversations,
  startConversation,
  getMessages,
  sendMessage
};

export default messageService;
