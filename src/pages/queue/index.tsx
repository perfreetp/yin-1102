import React, { useState, useCallback } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useQueueStore } from '@/store/useQueueStore';
import { chargingPreferences, oneClickActions, mockFleetMembers } from '@/data/mockQueue';
import QueueCard from '@/components/QueueCard';
import ActionButton from '@/components/ActionButton';
import StatusBadge from '@/components/StatusBadge';
import { ChargingPreference } from '@/types';
import { getPreferenceColor, formatWaitTime } from '@/utils/format';

const QueuePage: React.FC = () => {
  const { queueInfo, updatePreference, simulateQueueUpdate, leaveQueue } = useQueueStore();
  const [selectedPreference, setSelectedPreference] = useState<ChargingPreference>(
    queueInfo.chargingPreference
  );
  const [refreshing, setRefreshing] = useState(false);

  const isInQueue = queueInfo.status !== 'notInQueue';

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    console.log('[QueuePage] refreshing...');
    setTimeout(() => {
      simulateQueueUpdate();
      setRefreshing(false);
    }, 1000);
  }, [simulateQueueUpdate]);

  const handlePreferenceSelect = (pref: ChargingPreference) => {
    console.log('[QueuePage] preference selected:', pref);
    setSelectedPreference(pref);
    updatePreference(pref);
    Taro.showToast({ title: `已设置为${pref.label}`, icon: 'success' });
  };

  const handleOneClickAction = (type: string, label: string) => {
    console.log('[QueuePage] one click action:', type);
    Taro.showModal({
      title: '确认操作',
      content: `确定要上报"${label}"吗？`,
      success: (res) => {
        if (res.confirm) {
          console.log('[QueuePage] action confirmed:', type);
          Taro.showToast({ title: '已上报', icon: 'success' });
        }
      }
    });
  };

  const handleShareFleet = () => {
    console.log('[QueuePage] share fleet clicked');
    Taro.showToast({ title: '车队码已复制', icon: 'success' });
  };

  const handleSimulateProgress = () => {
    console.log('[QueuePage] simulate progress clicked');
    simulateQueueUpdate();
    Taro.showToast({ title: '已模拟叫号', icon: 'success' });
  };

  const handleLeaveQueue = () => {
    Taro.showModal({
      title: '确认离开队列',
      content: '离开后需要重新扫码入队，确定要离开吗？',
      confirmColor: '#f44336',
      success: (res) => {
        if (res.confirm) {
          console.log('[QueuePage] leave queue confirmed');
          leaveQueue();
          Taro.showToast({ title: '已离开队列', icon: 'success' });
        }
      }
    });
  };

  const preferenceIcons: Record<string, string> = {
    fast: '⚡',
    exit: '🚪',
    quiet: '🤫',
    normal: '📋'
  };

  const preferenceDescs: Record<string, string> = {
    fast: '优先分配高功率充电桩',
    exit: '优先分配靠近出口的桩位',
    quiet: '优先分配远离噪音的区域',
    normal: '按常规顺序安排'
  };

  return (
    <ScrollView
      className={styles.page}
      scrollY
      refresherEnabled
      refresherTriggered={refreshing}
      onRefresherRefresh={handleRefresh}
    >
      {isInQueue ? (
        <>
          <View className={styles.section}>
            <QueueCard queueInfo={queueInfo} />
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.titleIcon}>⚡</Text>
              补电偏好
            </Text>
            <View className={styles.preferenceCard}>
              <Text style={{ fontSize: 24, color: '#4a4a4a' }}>
                选择您的充电偏好，我们将优先为您安排
              </Text>
              <View className={styles.preferenceList}>
                {chargingPreferences.map((pref) => (
                  <Button
                    key={pref.type}
                    className={classnames(styles.preferenceItem, {
                      [styles.preferenceSelected]: selectedPreference.type === pref.type
                    })}
                    onClick={() => handlePreferenceSelect(pref)}
                  >
                    <Text
                      className={styles.preferenceIcon}
                      style={{ color: getPreferenceColor(pref.type) }}
                    >
                      {preferenceIcons[pref.type]}
                    </Text>
                    <Text className={styles.preferenceLabel}>{pref.label}</Text>
                    <Text className={styles.preferenceDesc}>{preferenceDescs[pref.type]}</Text>
                  </Button>
                ))}
              </View>
            </View>
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.titleIcon}>📌</Text>
              一键上报
            </Text>
            <View className={styles.actionsGrid}>
              {oneClickActions.map((action) => (
                <ActionButton
                  key={action.id}
                  icon={action.icon}
                  label={action.label}
                  description={action.description}
                  variant={action.type === 'reverse' ? 'danger' : action.type === 'arrived' ? 'primary' : 'warning'}
                  onClick={() => handleOneClickAction(action.type, action.label)}
                />
              ))}
            </View>
          </View>

          <View className={styles.section}>
            <View className={styles.fleetSection}>
              <View className={styles.fleetHeader}>
                <Text className={styles.fleetTitle}>
                  <Text>👥</Text>
                  同行车队
                </Text>
                <View style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <Text className={styles.fleetCount}>共{mockFleetMembers.length}人</Text>
                  <Button className={styles.shareBtn} onClick={handleShareFleet}>
                    邀请队友
                  </Button>
                </View>
              </View>
              <View className={styles.fleetList}>
                {mockFleetMembers.map((member) => (
                  <View key={member.id} className={styles.fleetItem}>
                    <View className={styles.driverInfo}>
                      <View className={styles.driverAvatar}>
                        <Text>{member.driverName.charAt(0)}</Text>
                      </View>
                      <View className={styles.driverDetails}>
                        <Text className={styles.driverName}>{member.driverName}</Text>
                        <Text className={styles.driverPlate}>{member.plateNumber}</Text>
                      </View>
                    </View>
                    <View className={styles.queueStatus}>
                      <Text className={styles.queueNum}>#{member.queueNumber}</Text>
                      <StatusBadge status={member.status} size="small" />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          <Button className={styles.simulateBtn} onClick={handleSimulateProgress}>
            🔄 模拟叫号前进
          </Button>

          <Button className={styles.leaveBtn} onClick={handleLeaveQueue}>
            离开队列
          </Button>

          <View className={styles.tipsCard}>
            <Text className={styles.tipsTitle}>
              <Text>💡</Text>
              温馨提示
            </Text>
            <Text className={styles.tipsContent}>
              1. 叫号后请在5分钟内到达指定充电位，超时将过号
              {'\n'}
              2. 如需临时离开，请点击"临时离开"，可保留位置5分钟
              {'\n'}
              3. 如需协助倒车，请点击"协助倒车"，工作人员会尽快赶来
              {'\n'}
              4. 排队进度每30秒自动刷新，也可下拉手动刷新
            </Text>
          </View>
        </>
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📋</Text>
          <Text className={styles.emptyText}>您尚未加入任何队列</Text>
          <Button
            style={{
              marginTop: 32,
              padding: '16rpx 48rpx',
              background: 'linear-gradient(135deg, #1e88e5 0%, #42a5f5 100%)',
              color: '#fff',
              borderRadius: 48,
              fontSize: 28
            }}
            onClick={() => Taro.navigateTo({ url: '/pages/scan/index' })}
          >
            扫码入队
          </Button>
        </View>
      )}
    </ScrollView>
  );
};

export default QueuePage;
