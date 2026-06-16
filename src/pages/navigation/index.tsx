import React, { useState } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { mockMapPoints, stationInfo, pointTypeConfig } from '@/data/mockNavigation';
import MapPoint from '@/components/MapPoint';
import { useQueueStore } from '@/store/useQueueStore';
import { StationMapPoint } from '@/types';

type PointType = 'all' | 'charging' | 'rest' | 'toilet' | 'weigh';

const NavigationPage: React.FC = () => {
  const { queueInfo } = useQueueStore();
  const [activeFilter, setActiveFilter] = useState<PointType>('all');
  const [selectedPoint, setSelectedPoint] = useState<StationMapPoint | null>(null);
  const [mapScale, setMapScale] = useState(1);

  const processStatus = queueInfo.processStatus;

  const getGuidanceConfig = (): { title: string; desc: string; highlightPoints: StationMapPoint[]; recommendedPoint?: StationMapPoint } => {
    const chargingAvailable = mockMapPoints.filter(p => p.type === 'charging' && p.status === 'available');

    switch (processStatus) {
      case 'calling':
        return {
          title: '🔔 已叫号，请前往充电区',
          desc: '请根据推荐路线前往充电区，5分钟内到达指定位置',
          highlightPoints: chargingAvailable,
          recommendedPoint: chargingAvailable[0]
        };
      case 'arrived':
        return {
          title: '🚚 已到门口，前往桩位',
          desc: '请沿入口道路前往分配的充电桩位，注意场内限速5km/h',
          highlightPoints: chargingAvailable,
          recommendedPoint: chargingAvailable[0]
        };
      case 'charging':
        return {
          title: '⚡ 充电中，可去休息区等待',
          desc: '充电期间可前往休息区等待，充电完成会有通知提醒',
          highlightPoints: mockMapPoints.filter(p => p.type === 'rest'),
          recommendedPoint: mockMapPoints.find(p => p.id === 'r1')
        };
      case 'completed':
        return {
          title: '✅ 充电完成，请前往出口',
          desc: '请沿主路驶向出口，出口处有称重点可称重',
          highlightPoints: mockMapPoints.filter(p => p.type === 'weigh'),
          recommendedPoint: mockMapPoints.find(p => p.id === 'w2')
        };
      default:
        return {
          title: '📍 场站导航',
          desc: '浏览场站内各类设施位置',
          highlightPoints: [],
          recommendedPoint: undefined
        };
    }
  };

  const guidance = getGuidanceConfig();

  const handleFilterChange = (filter: PointType) => {
    console.log('[NavigationPage] filter changed:', filter);
    setActiveFilter(filter);
    setSelectedPoint(null);
  };

  const handlePointClick = (point: StationMapPoint) => {
    console.log('[NavigationPage] point clicked:', point);
    setSelectedPoint(point);
  };

  const handleNavigate = (point: StationMapPoint) => {
    console.log('[NavigationPage] navigate to:', point.name);
    Taro.showToast({ title: `正在导航到${point.name}`, icon: 'success' });
  };

  const handleZoomIn = () => {
    setMapScale((prev) => Math.min(prev + 0.2, 1.5));
  };

  const handleZoomOut = () => {
    setMapScale((prev) => Math.max(prev - 0.2, 0.6));
  };

  const filteredPoints = activeFilter === 'all'
    ? mockMapPoints
    : mockMapPoints.filter((p) => p.type === activeFilter);

  const filters: { type: PointType; label: string; icon: string }[] = [
    { type: 'all', label: '全部', icon: '📍' },
    { type: 'charging', label: '充电区', icon: '⚡' },
    { type: 'rest', label: '休息区', icon: '☕' },
    { type: 'toilet', label: '洗手间', icon: '🚻' },
    { type: 'weigh', label: '称重点', icon: '⚖️' }
  ];

  const detailItems = [
    { icon: '⚡', title: '充电区', desc: stationInfo.totalChargingPorts + '个充电桩，空闲' + stationInfo.availablePorts + '个' },
    { icon: '☕', title: '休息区', desc: stationInfo.restArea },
    { icon: '🚻', title: '洗手间', desc: stationInfo.toilet },
    { icon: '⚖️', title: '称重服务', desc: stationInfo.weighStation }
  ];

  return (
    <ScrollView className={styles.page} scrollY>
      {processStatus !== 'notInQueue' && processStatus !== 'queuing' && (
        <View className={styles.guidanceCard}>
          <Text className={styles.guidanceTitle}>{guidance.title}</Text>
          <Text className={styles.guidanceDesc}>{guidance.desc}</Text>
          {guidance.recommendedPoint && (
            <View className={styles.guidanceAction}>
              <View className={styles.recommendedPoint}>
                <Text className={styles.recommendedIcon}>
                  {pointTypeConfig[guidance.recommendedPoint.type].icon}
                </Text>
                <View className={styles.recommendedInfo}>
                  <Text className={styles.recommendedName}>{guidance.recommendedPoint.name}</Text>
                  <Text className={styles.recommendedDesc}>{guidance.recommendedPoint.description}</Text>
                </View>
              </View>
              <Button
                className={styles.guidanceNavBtn}
                onClick={() => handleNavigate(guidance.recommendedPoint!)}
              >
                🧭 导航前往
              </Button>
            </View>
          )}
        </View>
      )}

      <View className={styles.mapContainer}>
        <View
          className={styles.mapBg}
          style={{ transform: `scale(${mapScale})`, transformOrigin: 'center center' }}
        >
          <View className={classnames(styles.road, styles.roadH)} style={{ top: 280 }} />
          <View className={classnames(styles.road, styles.roadV)} style={{ left: 380 }} />

          <View className={classnames(styles.zone, styles.zoneA)}>
            <Text className={styles.zoneLabel}>A区</Text>
          </View>
          <View className={classnames(styles.zone, styles.zoneB)}>
            <Text className={styles.zoneLabel}>B区</Text>
          </View>
          <View className={classnames(styles.zone, styles.zoneC)}>
            <Text className={styles.zoneLabel}>C区</Text>
          </View>

          {filteredPoints.map((point) => {
            return (
              <MapPoint
                key={point.id}
                point={point}
                selected={selectedPoint?.id === point.id}
                onClick={() => handlePointClick(point)}
              />
            );
          })}
        </View>

        <View className={styles.mapControls}>
          <Button className={styles.controlBtn} onClick={handleZoomIn}>+</Button>
          <Button className={styles.controlBtn} onClick={handleZoomOut}>−</Button>
        </View>
      </View>

      <View className={styles.legend}>
        <View className={styles.legendItem}>
          <View className={styles.legendDot} style={{ backgroundColor: '#4caf50' }} />
          <Text className={styles.legendText}>空闲</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={styles.legendDot} style={{ backgroundColor: '#f44336' }} />
          <Text className={styles.legendText}>占用</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={styles.legendDot} style={{ backgroundColor: '#9e9e9e' }} />
          <Text className={styles.legendText}>道路</Text>
        </View>
      </View>

      <View className={styles.filterSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.titleIcon}>🔍</Text>
          设施筛选
        </Text>
        <View className={styles.filterTabs}>
          {filters.map((filter) => (
            <Button
              key={filter.type}
              className={classnames(styles.filterTab, {
                [styles.filterTabActive]: activeFilter === filter.type
              })}
              onClick={() => handleFilterChange(filter.type)}
            >
              <Text className={styles.tabIcon}>{filter.icon}</Text>
              <Text>{filter.label}</Text>
            </Button>
          ))}
        </View>
      </View>

      {filteredPoints.length > 0 ? (
        <View className={styles.pointsList}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.titleIcon}>📍</Text>
            点位列表
          </Text>
          {filteredPoints.map((point) => {
            const isRecommended = guidance.recommendedPoint?.id === point.id;
            return (
              <View key={point.id} className={classnames(styles.pointCard, { [styles.recommendedCard]: isRecommended })}>
                <View className={styles.pointHeader}>
                  <View className={styles.pointInfo}>
                    <View
                      className={styles.pointIcon}
                      style={{ backgroundColor: `${pointTypeConfig[point.type].color}20` }}
                    >
                      <Text>{pointTypeConfig[point.type].icon}</Text>
                    </View>
                    <View className={styles.pointDetails}>
                      <Text className={styles.pointName}>
                        {point.name}
                        {isRecommended && <Text style={{ color: '#ff9800', marginLeft: 8, fontSize: 24 }}>推荐</Text>}
                      </Text>
                      <Text className={styles.pointDesc}>{point.description}</Text>
                    </View>
                  </View>
                  <View
                    className={classnames(styles.pointStatus, {
                      [styles.statusAvailable]: point.status === 'available',
                      [styles.statusOccupied]: point.status === 'occupied'
                    })}
                  >
                    {point.status === 'available' ? '空闲' : '占用'}
                  </View>
                </View>
                <View style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                  <Button
                    className={styles.navigateBtn}
                    onClick={() => handleNavigate(point)}
                  >
                    🧭 导航到这里
                  </Button>
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>🔍</Text>
          <Text className={styles.emptyText}>暂无该类型设施</Text>
        </View>
      )}

      <View className={styles.stationDetails}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.titleIcon}>ℹ️</Text>
          场站信息
        </Text>
        {detailItems.map((item, index) => (
          <View key={index} className={styles.detailItem}>
            <View className={styles.detailIcon}>
              <Text>{item.icon}</Text>
            </View>
            <View className={styles.detailContent}>
              <Text className={styles.detailTitle}>{item.title}</Text>
              <Text className={styles.detailDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default NavigationPage;
