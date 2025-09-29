// Key format: chatApp_conversations_{userId}
const getStorageKey = (userId) => `chatApp_conversations_${userId}`;

export const loadConversations = (userId) => {
  const key = getStorageKey(userId);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const saveConversations = (userId, conversations) => {
  localStorage.setItem(
    getStorageKey(userId),
    JSON.stringify(conversations)
  );
};
