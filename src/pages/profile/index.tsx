import React, { useState, useCallback } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import { useQueueStore } from '@/store/useQueueStore';
import VehicleCard from '@/components/VehicleCard';
import { Vehicle, HistoryRecord } from '@/types';

const ProfilePage: React.FC = () => {
  const { vehicles, setDefaultVehicle, getUnreadCount, historyRecords } = useQueueStore();
  const [expandedVehicle, setExpandedVehicle] = useState<string | null>(null);

  useDidShow(useCallback(() => {
    console.log('[ProfilePage] page did show, vehicles:', vehicles.length);
  }, [vehicles]));

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
    setDefaultVehicle(vehicle.id);
    Taro.showToast({ title: '已设为默认车辆', icon: 'success' });
  };

  const toggleVehicleHistory = (vehicleId: string) => {
    setExpandedVehicle(prev => prev === vehicleId ? null : vehicleId);
  };

  const getVehicleHistory = (vehicleId: string): HistoryRecord[] => {
    return historyRecords.filter(r => r.vehicleId === vehicleId);
  };

  const handleHistoryDetail = (record: HistoryRecord) => {
    console.log('[ProfilePage] history clicked:', record.id);
    const lines = [
      `场站：${record.stationName}`,
      `入站：${new Date(record.enterTime).toLocaleString('zh-CN')}`,
      `出站：${new Date(record.exitTime).toLocaleString('zh-CN')}`,
      `排队号：${record.queueNumber}`,
      `等待时长：${record.waitTime}分钟`,
      `充电类型：${record.chargingType}`
    ];
    if (record.chargingDuration) lines.push(`充电时长：${record.chargingDuration}分钟`);
    if (record.chargingCost) lines.push(`充电费用：¥${record.chargingCost}`);
    if (record.startBattery && record.endBattery) lines.push(`电量：${record.startBattery}% → ${record.endBattery}%`);
    if (record.chargingPileName) lines.push(`充电桩：${record.chargingPileName}`);
    if (record.vehiclePlateNumber) lines.push(`车辆：${record.vehiclePlateNumber}`);

    Taro.showModal({
      title: '进站详情',
      content: lines.join('\n'),
      showCancel: false
    });
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
            <Text className={styles.statValue}>{historyRecords.length}</Text>
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
          {vehicles.map((vehicle) => {
            const vehicleHistory = getVehicleHistory(vehicle.id);
            const isExpanded = expandedVehicle === vehicle.id;
            return (
              <View key={vehicle.id} className={styles.vehicleBlock}>
                <VehicleCard
                  vehicle={vehicle}
                  selected={vehicle.isDefault}
                  onSelect={() => handleVehicleSelect(vehicle)}
                  onEdit={() => handleVehicleEdit(vehicle)}
                />
                <Button
                  className={styles.vehicleHistoryToggle}
                  onClick={() => toggleVehicleHistory(vehicle.id)}
                >
                  📋 {isExpanded ? '收起记录' : `查看进站记录(${vehicleHistory.length})`}
                </Button>
                {isExpanded && vehicleHistory.length > 0 && (
                  <View className={styles.vehicleHistoryList}>
                    {vehicleHistory.slice(0, 5).map((record) => (
                      <View
                        key={record.id}
                        className={styles.historyItem}
                        onClick={() => handleHistoryDetail(record)}
                      >
                        <View className={styles.historyInfo}>
                          <Text className={styles.historyStation}>{record.stationName}</Text>
                          <Text className={styles.historyTime}>
                            {new Date(record.enterTime).toLocaleDateString('zh-CN')}
                          </Text>
                        </View>
                        <View className={styles.historyDetails}>
                          <Text className={styles.historyQueue}>#{record.queueNumber}</Text>
                          {record.chargingCost != null && (
                            <Text className={styles.historyCost}>¥{record.chargingCost}</Text>
                          )}
                          {record.endBattery != null && (
                            <Text className={styles.historyBattery}>🔋{record.endBattery}%</Text>
                          )}
                          <Text className={styles.historyDuration}>等{record.waitTime}分钟</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
                {isExpanded && vehicleHistory.length === 0 && (
                  <View className={styles.noHistory}>
                    <Text className={styles.noHistoryText}>暂无进站记录</Text>
                  </View>
                )}
              </View>
            );
          })}
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
          {historyRecords.length > 0 ? (
            <>
              {historyRecords.slice(0, 5).map((record) => (
                <View
                  key={record.id}
                  className={styles.historyItem}
                  onClick={() => handleHistoryDetail(record)}
                >
                  <View className={styles.historyInfo}>
                    <Text className={styles.historyStation}>{record.stationName}</Text>
                    <Text className={styles.historyTime}>
                      {new Date(record.enterTime).toLocaleDateString('zh-CN')}
                    </Text>
                  </View>
                  <View className={styles.historyDetails}>
                    <Text className={styles.historyQueue}>#{record.queueNumber}</Text>
                    {record.vehiclePlateNumber && (
                      <Text className={styles.historyVehicle}>{record.vehiclePlateNumber}</Text>
                    )}
                    {record.chargingCost != null && (
                      <Text className={styles.historyCost}>¥{record.chargingCost}</Text>
                    )}
                    <Text className={styles.historyDuration}>等{record.waitTime}分钟</Text>
                  </View>
                </View>
              ))}
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
