import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useQueueStore } from '@/store/useQueueStore';
import MessageItem from '@/components/MessageItem';
import { Message } from '@/types';
import { getMessageTypeText, getMessageTypeColor, getMessageTypeBgColor } from '@/utils/format';

type MessageFilter = 'all' | 'calling' | 'reminder' | 'overdue' | 'reroute' | 'system';

const MessagesPage: React.FC = () => {
  const { messages, markMessageRead, markAllMessagesRead } = useQueueStore();
  const [activeFilter, setActiveFilter] = useState<MessageFilter>('all');

  const unreadCount = useMemo(
    () => messages.filter((m) => !m.read).length,
    [messages]
  );

  const filteredMessages = useMemo(() => {
    if (activeFilter === 'all') return messages;
    return messages.filter((m) => m.type === activeFilter);
  }, [messages, activeFilter]);

  const filters: { type: MessageFilter; label: string }[] = [
    { type: 'all', label: '全部' },
    { type: 'calling', label: '叫号' },
    { type: 'reminder', label: '提醒' },
    { type: 'overdue', label: '过号' },
    { type: 'reroute', label: '改道' },
    { type: 'system', label: '系统' }
  ];

  const getFilterCount = (type: MessageFilter) => {
    if (type === 'all') return messages.length;
    return messages.filter((m) => m.type === type).length;
  };

  const handleFilterChange = (filter: MessageFilter) => {
    console.log('[MessagesPage] filter changed:', filter);
    setActiveFilter(filter);
  };

  const handleMessageClick = (message: Message) => {
    console.log('[MessagesPage] message clicked:', message.id);
    if (!message.read) {
      markMessageRead(message.id);
    }
    Taro.showModal({
      title: message.title,
      content: message.content,
      showCancel: false,
      confirmText: '知道了'
    });
  };

  const handleMarkAllRead = () => {
    if (unreadCount === 0) {
      Taro.showToast({ title: '没有未读消息', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '确认操作',
      content: `确定要标记全部${unreadCount}条消息为已读吗？`,
      success: (res) => {
        if (res.confirm) {
          console.log('[MessagesPage] mark all read');
          markAllMessagesRead();
          Taro.showToast({ title: '已全部标记', icon: 'success' });
        }
      }
    });
  };

  const getMessageClass = (message: Message) => {
    if (message.type === 'calling') return styles.callMessage;
    if (message.type === 'overdue') return styles.overdueMessage;
    return '';
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.header}>
        <View style={{ display: 'flex', alignItems: 'center' }}>
          <Text className={styles.title}>消息中心</Text>
          {unreadCount > 0 && (
            <View className={styles.unreadBadge}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </View>
          )}
        </View>
        <Button className={styles.readAllBtn} onClick={handleMarkAllRead}>
          全部已读
        </Button>
      </View>

      <ScrollView className={styles.filterTabs} scrollX>
        {filters.map((filter) => (
          <Button
            key={filter.type}
            className={classnames(styles.filterTab, {
              [styles.filterTabActive]: activeFilter === filter.type
            })}
            onClick={() => handleFilterChange(filter.type)}
          >
            <Text>{filter.label}</Text>
            <Text className={styles.tabCount}>({getFilterCount(filter.type)})</Text>
          </Button>
        ))}
      </ScrollView>

      {filteredMessages.length > 0 ? (
        <View className={styles.messagesList}>
          {filteredMessages.map((message) => (
            <View
              key={message.id}
              className={classnames(
                styles.messageItem,
                { [styles.unread]: !message.read },
                getMessageClass(message)
              )}
              onClick={() => handleMessageClick(message)}
            >
              <View className={styles.headerRow}>
                <View className={styles.leftHeader}>
                  <View
                    className={styles.typeTag}
                    style={{
                      backgroundColor: getMessageTypeBgColor(message.type),
                      color: getMessageTypeColor(message.type)
                    }}
                  >
                    {getMessageTypeText(message.type)}
                  </View>
                  {!message.read && <View className={styles.unreadDot} />}
                </View>
                <Text className={styles.time}>
                  {new Date(message.time).toLocaleString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Text>
              </View>
              <Text className={styles.messageTitle}>{message.title}</Text>
              <Text className={styles.messageContent}>{message.content}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📭</Text>
          <Text className={styles.emptyTitle}>暂无消息</Text>
          <Text className={styles.emptyDesc}>有新消息时会在这里显示</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default MessagesPage;
