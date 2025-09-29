import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { AgentSelector } from '../components/AgentSelector';
import { MessageList } from '../components/MessageList';
import { 
  Layout, 
  Input, 
  Button, 
  List, 
  Typography, 
  Space, 
  Divider,
  Empty,
  Spin,
  Avatar,
  Badge,
  Image
} from 'antd';

import { Sender } from '@ant-design/x';

import { 
  SendOutlined, 
  MessageOutlined, 
  LogoutOutlined,
} from '@ant-design/icons';
import styled from 'styled-components';

const { Header, Sider, Content } = Layout;
const { TextArea } = Input;
const { Text, Title } = Typography;

const ChatContainer = styled(Layout)`
  width: 100vw !important;
  min-height: 100vh !important;
  max-height: 100vh;
  overflow: hidden;
`;

const ChatSider = styled(Sider)`
  background: #fafafa !important;
  border-right: 1px solid #f0f0f0;
  
  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
`;

const ChatContent = styled(Content)`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #ffffff;
`;

const MessageInput = styled.div`
  padding: 16px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
`;

export default function Chat() {
  const { user, logout } = useAuth();
  const { 
    conversations,
    currentConv,
    isLoading,
    isSending,
    switchConversation,
    sendMessage,
    createNewConversation
  } = useChat();

  const [messageInput, setMessageInput] = useState('');
  const [selectedConvId, setSelectedConvId] = useState(null);

  // Auto-select first conversation
  useEffect(() => {
    if (conversations.length > 0 && !selectedConvId) {
      const firstConv = conversations[0];
      setSelectedConvId(firstConv.id);
      switchConversation(firstConv.id);
    }
  }, [conversations, selectedConvId, switchConversation]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || isSending) return;
    
    const message = messageInput;
    setMessageInput(''); // Clear immediately for UX
    
    try {
      await sendMessage(message);
    } catch (error) {
      // Error handled in context, just restore input
      setMessageInput(message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleConversationSelect = (convId) => {
    setSelectedConvId(convId);
    switchConversation(convId);
  };

  return (
    <ChatContainer>
      {/* ===== LEFT SIDEBAR: Conversations List ===== */}
      <ChatSider width={320} collapsible={false}>
        <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
                <Image src="1757794263.png" width="50px" style={{float: "left"}} preview={false}/>
                <Title level={4} style={{ margin: 0 }}>
                  DE Chat
                </Title>
            </Space>
            <Text type="secondary">С возвращением, {user?.name || user?.id}</Text>
          </Space>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <Spin size="large" />
              <div>Loading conversations...</div>
            </div>
          ) : conversations.length === 0 ? (
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No conversations yet"
              style={{ marginTop: '50px' }}
            >
              <Text type="secondary">Select an agent above to start chatting</Text>
            </Empty>
          ) : (
            <List
              dataSource={conversations}
              renderItem={(conv) => (
                <List.Item
                  key={conv.id}
                  onClick={() => handleConversationSelect(conv.id)}
                  style={{
                    cursor: 'pointer',
                    padding: '12px',
                    margin: '4px 0',
                    borderRadius: '8px',
                    background: selectedConvId === conv.id ? '#e6f7ff' : 'transparent',
                    border: selectedConvId === conv.id ? '1px solid #161617ff' : '1px solid transparent'
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={<Image src="chat-square.svg" width="50px" preview={false}/>}
                        style={{ backgroundColor: selectedConvId === conv.id ? '#e6f7ff' : 'transparent' }}
                      />
                    }
                    title={
                      <Space>
                        {conv.title || `Chat ${conv.id.slice(-4)}`}
                        {conv.messages?.length > 0 && (
                          <Badge 
                            count={conv.messages.length} 
                            style={{ backgroundColor: '#286c05ff' }}
                          />
                        )}
                      </Space>
                    }
                    description={
                      <Text type="secondary" ellipsis>
                        {conv.messages?.length > 0 
                          ? conv.messages[conv.messages.length - 1].content.slice(0, 50) + '...'
                          : 'No messages yet'
                        }
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>

        <Divider style={{ margin: '8px 0' }} />
        
        <div style={{ padding: '16px' }}>
          <Button 
            block 
            icon={<LogoutOutlined />}
            onClick={logout}
          >
            Sign Out
          </Button>
        </div>
      </ChatSider>

      {/* ===== MAIN CHAT AREA ===== */}
      <Layout style={{ background: '#ffffff' }}>
        {/* Header with Agent Selector */}
        <Header style={{ 
          background: '#ffffff', 
          borderBottom: '1px solid #f0f0f0',
          padding: '0 24px',
          height: '64px',
          lineHeight: '64px'
        }}>
          <AgentSelector />
        </Header>

        {/* Messages Area */}
        <ChatContent>
          <MessagesContainer>
            {currentConv ? (
              <MessageList messages={currentConv.messages} />
            ) : (
              <Empty 
                image={<MessageOutlined style={{ fontSize: '64px', color: '#d9d9d9' }} />}
                description="Select a conversation or create a new one"
                style={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              />
            )}
          </MessagesContainer>

          {/* Message Input */}
          {currentConv && (
            <MessageInput>
                <Sender 
                value={messageInput}
                onChange={(v) => setMessageInput(v)}
                loading={isSending}
                onSubmit={handleSendMessage}
                autoSize={{ minRows: 1, maxRows: 8 }}
                />
            </MessageInput>
          )}
        </ChatContent>
      </Layout>
    </ChatContainer>
  );
}
