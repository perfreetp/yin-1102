import React, { useState } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useQueueStore } from '@/store/useQueueStore';
import { mockHistoryRecords } from '@/data/mockVehicles';
import VehicleCard from '@/components/VehicleCard';
import { Vehicle } from '@/types';

const ProfilePage: React.FC = () => {
  const { vehicles, currentVehicle, setCurrentVehicle, getUnreadCount } = useQueueStore();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(currentVehicle);

  const unreadCount = getUnreadCount();

  const handleAddVehicle = () => {
    console.log('[ProfilePage] add vehicle clicked');
    Taro.navigateTo({ url: '/pages/vehicle-edit/index' });
  };

  const handleVehicleEdit = (vehicle: Vehicle) => {
    console.log('[ProfilePage] edit vehicle:', vehicle.id);
    Taro.navigateTo({ url: `/pages/vehicle-edit/index?id=${vehicle.id}` });
  };

  const handleVehicleSelect = (vehicle: Vehicle) => {
    console.log('[ProfilePage] select vehicle:', vehicle.id);
    setSelectedVehicle(vehicle);
    setCurrentVehicle(vehicle);
    Taro.showToast({ title: '已切换车辆', icon: 'success' });
  };

  const handleHistoryClick = (record: any) => {
    console.log('[ProfilePage] history clicked:', record.id);
    Taro.showModal({
      title: record.stationName,
      content: `入站：${record.enterTime}\n出站：${record.exitTime}\n排队号：${record.queueNumber}\n等待时长：${record.waitTime}分钟\n充电类型：${record.chargingType}`,
      showCancel: false
    });
  };

  const handleViewAllHistory = () => {
    console.log('[ProfilePage] view all history');
    Taro.showToast({ title: '历史记录功能开发中', icon: 'none' });
  };

  const handleMenuClick = (menu: string) => {
    console.log('[ProfilePage] menu clicked:', menu);
    switch (menu) {
      case 'rating':
        Taro.navigateTo({ url: '/pages/rating/index' });
        break;
      case 'feedback':
        Taro.navigateTo({ url: '/pages/feedback/index' });
        break;
      case 'fleet':
        Taro.navigateTo({ url: '/pages/fleet/index' });
        break;
      default:
        Taro.showToast({ title: `${menu}功能开发中`, icon: 'none' });
    }
  };

  const handleQuickRating = () => {
    console.log('[ProfilePage] quick rating clicked');
    Taro.navigateTo({ url: '/pages/rating/index' });
  };

  const menuItems = [
    { id: 'fleet', icon: '👥', label: '车队管理', color: '#4caf50' },
    { id: 'rating', icon: '⭐', label: '服务评价', color: '#ff9800', badge: '1' },
    { id: 'feedback', icon: '📝', label: '催办反馈', color: '#f44336', badge: unreadCount > 0 ? String(unreadCount) : undefined },
    { id: 'settings', icon: '⚙️', label: '设置', color: '#9e9e9e' },
    { id: 'help', icon: '❓', label: '帮助中心', color: '#2196f3' }
  ];

  const recentHistory = mockHistoryRecords.slice(0, 3);

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.userCard}>
        <View className={styles.userInfo}>
          <View className={styles.avatar}>
            <Text>👨‍✈️</Text>
          </View>
          <View className={styles.userDetails}>
            <Text className={styles.userName}>张师傅</Text>
            <Text className={styles.userPhone}>138****8888</Text>
          </View>
        </View>
        <View className={styles.userStats}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{mockHistoryRecords.length}</Text>
            <Text className={styles.statLabel}>累计进站</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{vehicles.length}</Text>
            <Text className={styles.statLabel}>绑定车辆</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>4.8</Text>
            <Text className={styles.statLabel}>服务评分</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.titleIcon}>🚛</Text>
            我的车辆
          </Text>
          <Button className={styles.addBtn} onClick={handleAddVehicle}>
            + 添加车辆
          </Button>
        </View>
        <View className={styles.vehiclesList}>
          {vehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              selected={selectedVehicle?.id === vehicle.id}
              onSelect={() => handleVehicleSelect(vehicle)}
              onEdit={() => handleVehicleEdit(vehicle)}
            />
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.titleIcon}>📋</Text>
            最近进站
          </Text>
        </View>
        <View className={styles.historySection}>
          {recentHistory.length > 0 ? (
            <>
              {recentHistory.map((record) => (
                <View
                  key={record.id}
                  className={styles.historyItem}
                  onClick={() => handleHistoryClick(record)}
                >
                  <View className={styles.historyInfo}>
                    <Text className={styles.historyStation}>{record.stationName}</Text>
                    <Text className={styles.historyTime}>
                      {new Date(record.enterTime).toLocaleDateString('zh-CN')}
                    </Text>
                  </View>
                  <View className={styles.historyDetails}>
                    <Text className={styles.historyQueue}>#{record.queueNumber}</Text>
                    <Text className={styles.historyDuration}>等待{record.waitTime}分钟</Text>
                  </View>
                </View>
              ))}
              <Button className={styles.viewAllBtn} onClick={handleViewAllHistory}>
                查看全部历史记录 →
              </Button>
            </>
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📋</Text>
              <Text className={styles.emptyText}>暂无进站记录</Text>
            </View>
          )}
        </View>
      </View>

      <Button className={styles.ratingBtn} onClick={handleQuickRating}>
        ⭐ 对上次服务进行评价
      </Button>

      <View className={styles.section} style={{ marginTop: 32 }}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.titleIcon}>⚙️</Text>
            更多功能
          </Text>
        </View>
        <View className={styles.menuSection}>
          {menuItems.map((item) => (
            <Button
              key={item.id}
              className={styles.menuItem}
              onClick={() => handleMenuClick(item.id)}
            >
              <View className={styles.menuLeft}>
                <View
                  className={styles.menuIcon}
                  style={{ backgroundColor: `${item.color}15`, color: item.color }}
                >
                  <Text>{item.icon}</Text>
                </View>
                <Text className={styles.menuText}>{item.label}</Text>
              </View>
              <View style={{ display: 'flex', alignItems: 'center' }}>
                {item.badge && <View className={styles.menuBadge}>{item.badge}</View>}
                <Text className={styles.menuArrow}>›</Text>
              </View>
            </Button>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfilePage;
