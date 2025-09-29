import { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { Select, Button, Space, Tag, Image } from 'antd';
import { RobotOutlined } from '@ant-design/icons';

const AGENTS = [
  { id: 'de-agent', name: 'DE Agent', color: 'blue' },
  { id: 'support-agent', name: 'Support Bot', color: 'green' },
  { id: 'admin-agent', name: "Admin agent", color: 'red'}
];

export const AgentSelector = () => {
  const { currentConv, createNewConversation } = useChat();
  const [selectedAgent, setSelectedAgent] = useState(null);

  const handleSelect = (agentId) => {
    setSelectedAgent(agentId);
    createNewConversation(agentId);
  };

  return (
    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
      <div>
        {currentConv && (
          <Tag 
            color={AGENTS.find(a => a.id === currentConv.agentId)?.color}
          >
            {AGENTS.find(a => a.id === currentConv.agentId)?.name}
          </Tag>
        )}
      </div>
      
      <Select
        value={selectedAgent || undefined}
        onChange={handleSelect}
        placeholder="Select agent"
        style={{ minWidth: 200 }}
        options={AGENTS.map(agent => ({
          label: (
            <Space>
              {agent.name}
            </Space>
          ),
          value: agent.id,
          color: agent.color
        }))}
      />
    </Space>
  );
};
