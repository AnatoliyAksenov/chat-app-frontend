import { createContext, useState, useContext, useEffect } from 'react';
import { 
  getConversations as fetchConversations,
  getMessages as fetchMessages,
  sendMessage as sendApiMessage
} from '../api/chat';
import { loadConversations, saveConversations } from '../utils/localStorage';
import { useAuth } from './AuthContext';
import { notification } from 'antd';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [currentConv, setCurrentConv] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Initialize conversations from backend OR localStorage
  useEffect(() => {
    if (!user) return;
    
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const convs = await fetchConversations();
        setConversations(convs);
        saveConversations(user.id, convs);
      } catch (error) {
        console.warn("Backend unreachable, using localStorage", error);
        const localConvs = loadConversations(user.id);
        setConversations(localConvs);
        notification.warning({
          message: 'Offline Mode',
          description: 'Using locally stored conversations'
        });
      }
      setIsLoading(false);
    };

    loadInitialData();
  }, [user]);

  // Load messages for selected conversation
  const loadMessages = async (convId) => {
    try {
      // 1. Try in-memory first
      const existingConv = conversations.find(c => c.id === convId);
      if (existingConv?.messages?.length > 0) {
        setCurrentConv(existingConv);
        return;
      }

      // 2. Try localStorage
      const allConvs = loadConversations(user.id);
      const localConv = allConvs.find(c => c.id === convId);
      if (localConv) {
        setCurrentConv(localConv);
        return;
      }

      // 3. Fetch from backend
      setIsLoading(true);
      const messages = await fetchMessages(convId);
      
      // Update conversation with messages
      const updatedConvs = conversations.map(conv => 
        conv.id === convId ? { ...conv, messages } : conv
      );
      
      setConversations(updatedConvs);
      saveConversations(user.id, updatedConvs);
      setCurrentConv(updatedConvs.find(c => c.id === convId));
      
    } catch (error) {
      notification.error({
        message: 'Load Failed',
        description: 'Could not fetch messages'
      });
      console.error("Message load error", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create new conversation with agent
  const createNewConversation = (agentId) => {
    const newConv = {
      id: `temp-${Date.now()}`, // Temporary ID
      agentId,
      title: `Chat with ${agentId.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}`,
      messages: [],
      createdAt: new Date().toISOString()
    };

    const updatedConvs = [newConv, ...conversations];
    setConversations(updatedConvs);
    saveConversations(user.id, updatedConvs);
    setCurrentConv(newConv);
  };

  // Switch between conversations
  const switchConversation = (convId) => {
    const conversation = conversations.find(c => c.id === convId);
    
    if (!conversation) {
      notification.error({
        message: 'Conversation Not Found',
        description: 'This conversation may have been deleted'
      });
      return;
    }

    // If messages not loaded yet, fetch them
    if (!conversation.messages?.length) {
      loadMessages(convId);
    } else {
      setCurrentConv(conversation);
    }
  };

// Replace the existing sendMessage function with this complete implementation:

const sendMessage = async (content) => {
  if (!currentConv || !content.trim() || isSending) return;
  
  setIsSending(true);
  const tempUserMsgId = `temp-user-${crypto.randomUUID()}`;
  const tempAgentMsgId = `temp-agent-${crypto.randomUUID()}`;

  // Create optimistic user message
  const userMessage = {
    id: tempUserMsgId,
    content,
    sender: 'user',
    timestamp: new Date().toISOString(),
    temp: true
  };

  // Create placeholder "typing" message for agent
  const agentTypingMessage = {
    id: tempAgentMsgId,
    content: '🤔 Thinking...',
    sender: 'agent',
    agentId: currentConv.agentId,
    timestamp: new Date().toISOString(),
    typing: true, // Special flag for typing indicator
    temp: true
  };

  try {
    // 1. Optimistically add user message + agent typing indicator
    const updatedConv = {
      ...currentConv,
      messages: [
        ...(currentConv.messages || []),
        userMessage,
        agentTypingMessage
      ]
    };
    
    const updatedConvs = conversations.map(conv => 
      conv.id === currentConv.id ? updatedConv : conv
    );
    
    setConversations(updatedConvs);
    setCurrentConv(updatedConv);
    saveConversations(user.id, updatedConvs);

    // 2. Send to backend and wait for both user + agent response
    const response = await sendApiMessage({
      conversationId: currentConv.id,
      content,
      agentId: currentConv.agentId
    });

    // 3. Replace temp messages with real ones from backend
    const finalMessages = [
      ...currentConv.messages.filter(m => 
        m.id !== tempUserMsgId && m.id !== tempAgentMsgId
      ),
      response.userMessage, // Real user message with backend ID
      response.agentMessage  // Real agent response
    ];

    const finalConv = {
      ...currentConv,
      messages: finalMessages,
      lastMessageAt: response.agentMessage.timestamp
    };

    const finalConvs = conversations.map(conv => 
      conv.id === currentConv.id ? finalConv : conv
    );

    setConversations(finalConvs);
    saveConversations(user.id, finalConvs);
    setCurrentConv(finalConv);

    // 4. Success notification
    notification.success({
      message: 'Message sent',
      description: `${currentConv.agentId.split('-').join(' ')} has responded`,
      duration: 2
    });

  } catch (error) {
    // 5. Error handling - remove both temp messages
    const revertedMessages = currentConv.messages.filter(m => 
      m.id !== tempUserMsgId && m.id !== tempAgentMsgId
    );

    const revertedConv = {
      ...currentConv,
      messages: revertedMessages
    };

    setConversations(conversations.map(conv => 
      conv.id === currentConv.id ? revertedConv : conv
    ));
    saveConversations(user.id, conversations);
    setCurrentConv(revertedConv);

    notification.error({
      message: 'Message Failed',
      description: 'Could not send message or get agent response. Try again.',
      duration: 4
    });

    console.error("Send message error:", error);

  } finally {
    setIsSending(false);
  }
};

  return (
    <ChatContext.Provider value={{ 
      conversations,
      currentConv,
      isLoading,
      isSending,
      loadMessages,
      sendMessage,
      switchConversation,
      createNewConversation
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
