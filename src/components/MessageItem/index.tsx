import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Message } from '@/types';
import { getMessageTypeText, getMessageTypeColor, getMessageTypeBgColor, formatTimeAgo } from '@/utils/format';

interface MessageItemProps {
  message: Message;
  onClick?: () => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, onClick }) => {
  const { type, title, content, time, read } = message;

  return (
    <View
      className={classnames(styles.messageItem, { [styles.unread]: !read })}
      onClick={onClick}
    >
      <View className={styles.header}>
        <View style={{ display: 'flex', alignItems: 'center' }}>
          <View
            className={styles.typeTag}
            style={{
              backgroundColor: getMessageTypeBgColor(type),
              color: getMessageTypeColor(type)
            }}
          >
            {getMessageTypeText(type)}
          </View>
          {!read && <View className={styles.unreadDot} />}
        </View>
        <Text className={styles.time}>{formatTimeAgo(time)}</Text>
      </View>
      <Text className={styles.title}>{title}</Text>
      <Text className={styles.content}>{content}</Text>
    </View>
  );
};

export default MessageItem;
