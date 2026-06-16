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
  const { queueInfo, toggleLeavingCheck } = useQueueStore();
  const [activeFilter, setActiveFilter] = useState<PointType>('all');
  const [selectedPoint, setSelectedPoint] = useState<StationMapPoint | null>(null);
  const [mapScale, setMapScale] = useState(1);

  const processStatus = queueInfo.processStatus;
  const isLeavingState = processStatus === 'completed' || processStatus === 'leaving';

  const getGuidanceConfig = (): { title: string; desc: string; highlightPoints: StationMapPoint[]; recommendedPoint?: StationMapPoint; steps?: string[] } => {
    const chargingAvailable = mockMapPoints.filter(p => p.type === 'charging' && p.status === 'available');
    const weighPoints = mockMapPoints.filter(p => p.type === 'weigh');
    const exitPoint = weighPoints.find(p => p.id === 'w2');

    switch (processStatus) {
      case 'calling':
        return {
          title: '🔔 已叫号，请前往充电区',
          desc: '请根据推荐路线前往充电区，5分钟内到达指定位置',
          highlightPoints: chargingAvailable,
          recommendedPoint: chargingAvailable[0],
          steps: [
            '① 从停车场入口进入',
            '② 沿主路直行约200米',
            `③ 右转进入${chargingAvailable[0]?.name || 'B区'}`,
            `④ 在${chargingAvailable[0]?.description || '指定桩位'}停靠`
          ]
        };
      case 'arrived':
        return {
          title: '🚚 已到门口，前往桩位',
          desc: '请沿入口道路前往分配的充电桩位，注意场内限速5km/h',
          highlightPoints: chargingAvailable,
          recommendedPoint: chargingAvailable[0],
          steps: [
            '① 从入口闸机进入',
            '② 沿引导车辆方向慢速行驶',
            `③ 前往${chargingAvailable[0]?.name || '分配的充电桩位'}`,
            '④ 工作人员确认后停靠'
          ]
        };
      case 'charging':
        return {
          title: '⚡ 充电中，可去休息区等待',
          desc: '充电期间可前往休息区等待，充电完成会有通知提醒',
          highlightPoints: mockMapPoints.filter(p => p.type === 'rest'),
          recommendedPoint: mockMapPoints.find(p => p.id === 'r1')
        };
      case 'completed':
      case 'leaving':
        const needWeigh = queueInfo.leavingChecklist?.needWeigh;
        return {
          title: processStatus === 'leaving' ? '🚶 离场中，请按指引离开' : '✅ 充电完成，请准备离场',
          desc: needWeigh
            ? '请先前往出口地磅称重，然后驶离场站'
            : '无需称重，可直接沿主路驶向出口',
          highlightPoints: weighPoints,
          recommendedPoint: exitPoint,
          steps: needWeigh
            ? [
                '① 拔出充电枪并放回原位',
                '② 沿主路驶向出口方向',
                '③ 先通过出口地磅称重',
                '④ 称重完成后驶出大门'
              ]
            : [
                '① 拔出充电枪并放回原位',
                '② 确认车内物品齐全',
                '③ 沿主路驶向出口',
                '④ 从场站大门驶离'
              ]
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
          {guidance.steps && guidance.steps.length > 0 && (
            <View className={styles.routeSteps}>
              <Text className={styles.routeStepsTitle}>📍 详细路线步骤</Text>
              {guidance.steps.map((step, index) => (
                <View key={index} className={styles.routeStep}>
                  <View className={styles.routeStepDot}>
                    <Text>{index + 1}</Text>
                  </View>
                  <Text className={styles.routeStepText}>{step.replace(/^[①②③④⑤]/, '').trim()}</Text>
                </View>
              ))}
            </View>
          )}
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

      {isLeavingState && queueInfo.leavingChecklist && (
        <View className={styles.navChecklistCard}>
          <Text className={styles.navChecklistTitle}>⚠️ 离场前检查</Text>
          <Text className={styles.navChecklistTip}>完成以下检查后即可驶离场站</Text>
          <Button
            className={classnames(styles.navCheckItem, {
              [styles.navCheckDone]: queueInfo.leavingChecklist.unplugged
            })}
            onClick={() => toggleLeavingCheck('unplugged')}
          >
            <View className={styles.navCheckBox}>
              {queueInfo.leavingChecklist.unplugged && <Text>✓</Text>}
            </View>
            <View>
              <Text className={styles.navCheckName}>🔌 已拔下充电枪</Text>
              <Text className={styles.navCheckDesc}>确认充电枪已从车辆和充电桩上拔下并归位</Text>
            </View>
          </Button>
          <Button
            className={classnames(styles.navCheckItem, {
              [styles.navCheckDone]: queueInfo.leavingChecklist.paid
            })}
            onClick={() => toggleLeavingCheck('paid')}
          >
            <View className={styles.navCheckBox}>
              {queueInfo.leavingChecklist.paid && <Text>✓</Text>}
            </View>
            <View>
              <Text className={styles.navCheckName}>💰 费用已结清</Text>
              <Text className={styles.navCheckDesc}>
                本次费用 ¥{queueInfo.chargingInfo?.estimatedCost?.toFixed(2) || '0.00'}
              </Text>
            </View>
          </Button>
          <Button
            className={classnames(styles.navCheckItem, {
              [styles.navCheckDone]: !queueInfo.leavingChecklist.needWeigh || queueInfo.leavingChecklist.weighed
            })}
            onClick={() => queueInfo.leavingChecklist!.needWeigh && toggleLeavingCheck('weighed')}
            disabled={!queueInfo.leavingChecklist.needWeigh}
          >
            <View className={classnames(styles.navCheckBox, {
              [styles.navCheckBoxDisabled]: !queueInfo.leavingChecklist.needWeigh
            })}>
              {(!queueInfo.leavingChecklist.needWeigh || queueInfo.leavingChecklist.weighed) && <Text>✓</Text>}
            </View>
            <View>
              <Text className={styles.navCheckName}>⚖️ 出口地磅{queueInfo.leavingChecklist.needWeigh ? '（需称重）' : '（无需）'}</Text>
              <Text className={styles.navCheckDesc}>
                {queueInfo.leavingChecklist.needWeigh
                  ? '请前往出口地磅完成称重后再离开'
                  : '本次无需称重，可直接离场'}
              </Text>
            </View>
          </Button>
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
