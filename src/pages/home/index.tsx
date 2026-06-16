import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, ScrollView, Swiper, SwiperItem } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useQueueStore } from '@/store/useQueueStore';
import { quickActions, notificationList } from '@/data/mockQueue';
import { stationInfo } from '@/data/mockNavigation';
import QueueCard from '@/components/QueueCard';
import { getStatusText } from '@/utils/format';

const HomePage: React.FC = () => {
  const { queueInfo, currentVehicle, simulateQueueUpdate, getUnreadCount } = useQueueStore();
  const [currentNotice, setCurrentNotice] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('[HomePage] mounted, queueStatus:', queueInfo.status);
  }, [queueInfo.status]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    console.log('[HomePage] refreshing data...');
    setTimeout(() => {
      simulateQueueUpdate();
      setRefreshing(false);
      Taro.showToast({ title: '已刷新', icon: 'success' });
    }, 1000);
  }, [simulateQueueUpdate]);

  const handleScan = () => {
    console.log('[HomePage] navigate to scan page');
    Taro.navigateTo({ url: '/pages/scan/index' });
  };

  const handleActionClick = (page: string) => {
    console.log('[HomePage] action clicked, navigate to:', page);
    if (page.startsWith('/pages/queue') || page.startsWith('/pages/navigation') ||
        page.startsWith('/pages/messages') || page.startsWith('/pages/profile')) {
      Taro.switchTab({ url: page });
    } else {
      Taro.navigateTo({ url: page });
    }
  };

  const handleQueueCardClick = () => {
    console.log('[HomePage] queue card clicked, switch to queue tab');
    Taro.switchTab({ url: '/pages/queue/index' });
  };

  const unreadCount = getUnreadCount();
  const isInQueue = queueInfo.status !== 'notInQueue';

  return (
    <ScrollView
      className={styles.page}
      scrollY
      refresherEnabled
      refresherTriggered={refreshing}
      onRefresherRefresh={handleRefresh}
    >
      <View className={styles.header}>
        <View>
          <Text className={styles.greeting}>你好，张师傅</Text>
          <Text className={styles.subGreeting}>今天也要注意安全哦</Text>
        </View>
        <View className={styles.vehicleInfo}>
          <Text className={styles.vehicleIcon}>🚛</Text>
          <Text className={styles.vehiclePlate}>{currentVehicle?.plateNumber || '未绑定'}</Text>
        </View>
      </View>

      <View className={styles.noticeBanner}>
        <Text className={styles.noticeIcon}>📢</Text>
        <Swiper
          className={styles.noticeContent}
          autoplay
          circular
          vertical
          interval={3000}
          onChange={(e) => setCurrentNotice(e.detail.current)}
        >
          {notificationList.map((notice) => (
            <SwiperItem key={notice.id}>
              <Text className={styles.noticeContent}>{notice.content}</Text>
            </SwiperItem>
          ))}
        </Swiper>
      </View>

      {isInQueue ? (
        <View onClick={handleQueueCardClick}>
          <QueueCard queueInfo={queueInfo} />
        </View>
      ) : (
        <View className={styles.noQueueSection}>
          <Text className={styles.noQueueIcon}>📋</Text>
          <Text className={styles.noQueueTitle}>尚未加入队列</Text>
          <Text className={styles.noQueueDesc}>
            扫描场站入口二维码即可加入排队，
            {'\n'}
            实时查看排队进度，减少无效等待
          </Text>
          <Button className={styles.scanBtn} onClick={handleScan}>
            <Text className={styles.scanIcon}>📷</Text>
            <Text>扫码入队</Text>
          </Button>
        </View>
      )}

      <View className={styles.quickActions}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.titleIcon}>⚡</Text>
          快捷功能
        </Text>
        <View className={styles.actionGrid}>
          {quickActions.map((action) => (
            <Button
              key={action.id}
              className={styles.actionItem}
              onClick={() => handleActionClick(action.page)}
            >
              <View
                className={styles.actionIcon}
                style={{ backgroundColor: `${action.color}15`, color: action.color }}
              >
                <Text>{action.icon}</Text>
              </View>
              <Text className={styles.actionLabel}>{action.label}</Text>
              {action.id === '4' && unreadCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: '#f44336',
                    color: '#fff',
                    fontSize: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </View>
              )}
            </Button>
          ))}
        </View>
      </View>

      <View className={styles.stationInfo}>
        <View className={styles.stationHeader}>
          <View>
            <Text className={styles.stationName}>{stationInfo.name}</Text>
            <View className={styles.stationStatus}>营业中</View>
          </View>
          <Button className={styles.refreshBtn} onClick={handleRefresh}>
            🔄 刷新
          </Button>
        </View>
        <View className={styles.stationStats}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stationInfo.totalChargingPorts}</Text>
            <Text className={styles.statLabel}>总桩位</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue} style={{ color: '#4caf50' }}>
              {stationInfo.availablePorts}
            </Text>
            <Text className={styles.statLabel}>空闲</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue} style={{ color: '#ff9800' }}>
              {isInQueue ? queueInfo.totalInQueue : '--'}
            </Text>
            <Text className={styles.statLabel}>排队中</Text>
          </View>
        </View>
        <View className={styles.stationAddress}>
          <Text className={styles.addressIcon}>📍</Text>
          <Text className={styles.addressText}>{stationInfo.address}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomePage;
