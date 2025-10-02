import { useMemo } from 'react'
import { useChat } from '../context/ChatContext'
import { List, Avatar, Skeleton, Typography, Space, Image } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { Bubble } from '@ant-design/x'

import styled, { keyframes } from 'styled-components'
import Markdown, { defaultUrlTransform } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkImages from 'remark-images'


const { Text } = Typography

const welcom_text = `
**Привет! 👋 Я твой ассистент по базам данных.**

Могу помочь с:

🔍 **Проверка подключения** — проверю соединение с вашей БД (нужны: хост, порт, тип БД, логин и пароль)  
📊 **Доступность таблиц** — найду нужные таблицы и проверю, доступны ли они  
📝 **Структура (DDL)** — покажу структуру любой таблицы  
⚡ **Пайплайны данных** — настрою автоматическую загрузку данных

![Base64 Image 1](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==)


**С чего начнем? Просто расскажи, что нужно, и отправим данные для подключения!**`

// Typing animation
const typing = keyframes`
  0%, 60%, 100% { opacity: 0.3; }
  30% { opacity: 1; }
`;

const TypingIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  color: #1677ff;
  font-style: italic;
  
  &::after {
    content: '...';
    animation: ${typing} 1.4s infinite;
    margin-left: 4px;
  }
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 12px;
  margin: 4px 0;
  
  ${props => props.isUser ? `
    background: #bac0c8ff;
    color: black;
    margin-left: auto;
    text-align: right;
  ` : `
    background: #f5f5f5;
    color: #000;
    margin-right: auto;
  `}
  
  ${props => props.isTemp && `
    opacity: 0.7;
    border: 1px dashed #d9d9d9;
  `}
`;

export const MessageList = ({ messages: propMessages }) => {
  const { currentConv } = useChat();
  const messages = propMessages || currentConv?.messages || [];
  
  const sortedMessages = useMemo(() => 
    [...messages].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    ),
    [messages]
  );

  const urlTransform = (url) =>
        url.startsWith('data:') ? url : defaultUrlTransform(url)

  if (!sortedMessages.length) {
    return (
      <div style={{ 
        textAlign: '-webkit-center', 
        padding: '48px 24px',
        color: '#999'
      }}>
        <Image src="bender.svg" width="100px" />
        <div style={{textAlign: 'left', width: '600px', color: 'black', paddingTop: '30px'}}>
            <Markdown remarkPlugins={[remarkGfm, remarkImages]} urlTransform={urlTransform}>
              {welcom_text}
            </Markdown>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      gap: '12px',
      padding: '16px 0',
    }}>
      {sortedMessages.map(msg => (
            <Bubble 
              placement={msg.sender === 'user'? 'end': 'start'}
              loading={msg.typing}
              content={(<Markdown remarkPlugins={[remarkGfm, remarkImages]} urlTransform={urlTransform}>{msg.content}</Markdown>)}
              avatar={msg.sender !== 'user'? <Image src="bender.svg" width="30px" preview={false}/>: <Image src="fry.svg" width="30px" style={{'transform': 'scaleX(-1)'}} preview={false}/>}
              styles={{ content: { maxWidth: 500 } }}
            />

      ))}
    </div>
  );
};
