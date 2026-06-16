import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useQueueStore } from '@/store/useQueueStore';
import { chargingPreferences, oneClickActions } from '@/data/mockQueue';
import QueueCard from '@/components/QueueCard';
import ActionButton from '@/components/ActionButton';
import StatusBadge from '@/components/StatusBadge';
import { ChargingPreference, ActionReport, QueueProcessStatus } from '@/types';
import { getPreferenceColor, formatTime } from '@/utils/format';

const QueuePage: React.FC = () => {
  const { queueInfo, updatePreference, simulateQueueUpdate, leaveQueue, reportAction, clearActionReport, fleetMembers, updateProcessStatus, simulateChargingProgress, markOverdue, recoverFromOverdue, completeAndSave } = useQueueStore();
  const [selectedPreference, setSelectedPreference] = useState<ChargingPreference>(
    queueInfo.chargingPreference
  );
  const [refreshing, setRefreshing] = useState(false);
  const chargingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isInQueue = queueInfo.status !== 'notInQueue';

  useEffect(() => {
    if (queueInfo.processStatus === 'charging') {
      if (chargingTimerRef.current) clearInterval(chargingTimerRef.current);
      chargingTimerRef.current = setInterval(() => {
        simulateChargingProgress();
      }, 5000);
    } else {
      if (chargingTimerRef.current) {
        clearInterval(chargingTimerRef.current);
        chargingTimerRef.current = null;
      }
    }
    return () => {
      if (chargingTimerRef.current) {
        clearInterval(chargingTimerRef.current);
        chargingTimerRef.current = null;
      }
    };
  }, [queueInfo.processStatus, simulateChargingProgress]);

  const processSteps: { status: QueueProcessStatus; label: string; icon: string }[] = [
    { status: 'queuing', label: '排队中', icon: '⏳' },
    { status: 'calling', label: '叫号中', icon: '🔔' },
    { status: 'arrived', label: '已到门口', icon: '🚚' },
    { status: 'charging', label: '充电中', icon: '⚡' },
    { status: 'completed', label: '已完成', icon: '✅' }
  ];

  const getNextStepHint = () => {
    const hints: Record<QueueProcessStatus, { title: string; content: string; action?: string }> = {
      notInQueue: { title: '尚未入队', content: '请扫描场站入口二维码加入排队' },
      queuing: { title: '耐心等待', content: `前方还有${queueInfo.aheadCount}台车，预计等待${queueInfo.estimatedWaitTime}分钟，请保持APP在后台运行`, action: '可以先去休息区休息' },
      calling: { title: '请立即前往', content: `您的${queueInfo.queueNumber}号已叫号，请在5分钟内到达B区充电区`, action: '点击"已到门口"上报到达' },
      arrived: { title: '等待引导', content: '您已到达场站入口，请在原地等待工作人员引导入场', action: '如有需要可点击"协助倒车"' },
      charging: { title: '充电中', content: '车辆正在充电中，请在休息区耐心等待', action: '充电完成后会自动通知您' },
      completed: { title: '已完成', content: '本次充电已完成，祝您一路平安', action: '欢迎下次光临' },
      overdue: { title: '您已过号', content: '5分钟内未到场站，排队号已失效', action: '可尝试恢复排队或重新扫码入队' }
    };
    return hints[queueInfo.processStatus] || hints.notInQueue;
  };

  const handleStartCharging = () => {
    Taro.showModal({
      title: '确认开始充电',
      content: '确认车辆已停好并连接充电桩，开始充电？',
      success: (res) => {
        if (res.confirm) {
          updateProcessStatus('charging');
          Taro.showToast({ title: '开始充电', icon: 'success' });
        }
      }
    });
  };

  const handleComplete = () => {
    Taro.showModal({
      title: '确认完成',
      content: '确认充电已完成，准备离场？完成后记录将保存到历史。',
      success: (res) => {
        if (res.confirm) {
          completeAndSave();
          Taro.showToast({ title: '已完成，记录已保存', icon: 'success' });
        }
      }
    });
  };

  const handleSimulateOverdue = () => {
    Taro.showModal({
      title: '模拟过号',
      content: '确定模拟过号场景？',
      success: (res) => {
        if (res.confirm) {
          markOverdue();
        }
      }
    });
  };

  const handleRecoverQueue = () => {
    Taro.showModal({
      title: '恢复排队',
      content: '将为您恢复排队，排队号会重新排入队列，确认恢复？',
      success: (res) => {
        if (res.confirm) {
          recoverFromOverdue();
          Taro.showToast({ title: '已恢复排队', icon: 'success' });
        }
      }
    });
  };

  const handleRescan = () => {
    Taro.navigateTo({ url: '/pages/scan/index' });
  };

  const handleCallStation = () => {
    const station = useQueueStore.getState().stations.find(s => s.id === queueInfo.stationId);
    if (station) {
      Taro.makePhoneCall({ phoneNumber: station.phone });
    } else {
      Taro.showToast({ title: '场站电话不可用', icon: 'none' });
    }
  };

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

  const handleOneClickAction = (type: 'arrived' | 'leave' | 'reverse', label: string) => {
    console.log('[QueuePage] one click action:', type);
    Taro.showModal({
      title: '确认操作',
      content: `确定要上报"${label}"吗？`,
      success: (res) => {
        if (res.confirm) {
          console.log('[QueuePage] action confirmed:', type);
          reportAction(type, label);
          Taro.showToast({ title: '已上报，等待场站确认', icon: 'none' });
        }
      }
    });
  };

  const handleClearAction = () => {
    Taro.showModal({
      title: '确认取消',
      content: '确定要取消当前上报状态吗？',
      success: (res) => {
        if (res.confirm) {
          clearActionReport();
          Taro.showToast({ title: '已取消', icon: 'success' });
        }
      }
    });
  };

  const getActionStatusText = (action: ActionReport) => {
    const statusMap: Record<string, { text: string; icon: string; color: string }> = {
      pending: { text: '等待场站确认', icon: '⏳', color: '#ff9800' },
      confirmed: { text: '场站已确认收到', icon: '✓', color: '#4caf50' },
      completed: { text: '已处理完成', icon: '✅', color: '#2196f3' }
    };
    return statusMap[action.status] || statusMap.pending;
  };

  const getActionIcon = (type: string) => {
    const icons: Record<string, string> = {
      arrived: '🚚',
      leave: '⏸️',
      reverse: '🆘'
    };
    return icons[type] || '📌';
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

  const chargingInfo = queueInfo.chargingInfo;

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
          {queueInfo.processStatus === 'overdue' ? (
            <View className={styles.overdueCard}>
              <Text className={styles.overdueIcon}>⚠️</Text>
              <Text className={styles.overdueTitle}>您已过号</Text>
              <Text className={styles.overdueDesc}>
                您的{queueInfo.queueNumber}号因5分钟内未到场站已过号。
                {'\n'}您可以选择以下操作：
              </Text>
              <View className={styles.overdueActions}>
                <Button className={styles.recoverBtn} onClick={handleRecoverQueue}>
                  🔄 恢复排队
                </Button>
                <Button className={styles.rescanBtn} onClick={handleRescan}>
                  📷 重新扫码入队
                </Button>
                <Button className={styles.callStationBtn} onClick={handleCallStation}>
                  📞 联系场站
                </Button>
              </View>
              <Text className={styles.overdueTip}>
                提示：恢复排队后您的号会重新排入队列；重新扫码将进入新的排队；联系场站可与工作人员沟通特殊情况。
              </Text>
            </View>
          ) : (
            <>
              <View className={styles.section}>
                <QueueCard queueInfo={queueInfo} />
              </View>

              <View className={styles.section}>
                <Text className={styles.sectionTitle}>
                  <Text className={styles.titleIcon}>📍</Text>
                  进站流程
                </Text>
                <View className={styles.processTimeline}>
                  {processSteps.map((step, index) => {
                    const currentIndex = processSteps.findIndex(s => s.status === queueInfo.processStatus);
                    const stepIndex = processSteps.findIndex(s => s.status === step.status);
                    const isCompleted = stepIndex < currentIndex || queueInfo.processStatus === 'completed';
                    const isCurrent = step.status === queueInfo.processStatus;

                    return (
                      <View key={step.status} className={styles.processStep}>
                        <View className={classnames(styles.processCircle, {
                          [styles.completed]: isCompleted,
                          [styles.current]: isCurrent
                        })}>
                          <Text className={styles.processIcon}>{step.icon}</Text>
                        </View>
                        <Text className={classnames(styles.processLabel, {
                          [styles.labelCompleted]: isCompleted,
                          [styles.labelCurrent]: isCurrent
                        })}>
                          {step.label}
                        </Text>
                        {index < processSteps.length - 1 && (
                          <View className={classnames(styles.processLine, {
                            [styles.lineCompleted]: index < currentIndex
                          })} />
                        )}
                      </View>
                    );
                  })}
                </View>

                {queueInfo.processStatus !== 'notInQueue' && (
                  <View className={styles.nextStepHint}>
                    <View className={styles.nextStepHeader}>
                      <Text className={styles.nextStepIcon}>💡</Text>
                      <Text className={styles.nextStepTitle}>{getNextStepHint().title}</Text>
                    </View>
                    <Text className={styles.nextStepContent}>{getNextStepHint().content}</Text>
                    {getNextStepHint().action && (
                      <Text className={styles.nextStepAction}>👉 {getNextStepHint().action}</Text>
                    )}
                  </View>
                )}
              </View>

              {chargingInfo && queueInfo.processStatus === 'charging' && (
                <View className={styles.section}>
                  <Text className={styles.sectionTitle}>
                    <Text className={styles.titleIcon}>⚡</Text>
                    充电进度
                  </Text>
                  <View className={styles.chargingProgressCard}>
                    <View className={styles.batteryRow}>
                      <View className={styles.batteryVisual}>
                        <View className={styles.batteryShell}>
                          <View
                            className={styles.batteryFill}
                            style={{ width: `${chargingInfo.currentBattery}%` }}
                          />
                        </View>
                        <View className={styles.batteryCap} />
                      </View>
                      <Text className={styles.batteryPct}>{chargingInfo.currentBattery}%</Text>
                    </View>
                    <View className={styles.chargingDetails}>
                      <View className={styles.chargingDetailItem}>
                        <Text className={styles.chargingDetailLabel}>🔋 目标电量</Text>
                        <Text className={styles.chargingDetailValue}>{chargingInfo.targetBattery}%</Text>
                      </View>
                      <View className={styles.chargingDetailItem}>
                        <Text className={styles.chargingDetailLabel}>⚡ 充电功率</Text>
                        <Text className={styles.chargingDetailValue}>{chargingInfo.chargingPower}kW</Text>
                      </View>
                      <View className={styles.chargingDetailItem}>
                        <Text className={styles.chargingDetailLabel}>⏱️ 已充时长</Text>
                        <Text className={styles.chargingDetailValue}>{chargingInfo.chargingDuration}分钟</Text>
                      </View>
                      <View className={styles.chargingDetailItem}>
                        <Text className={styles.chargingDetailLabel}>🕐 预计充满</Text>
                        <Text className={styles.chargingDetailValue}>{chargingInfo.estimatedFullTime || '计算中...'}</Text>
                      </View>
                      <View className={styles.chargingDetailItem}>
                        <Text className={styles.chargingDetailLabel}>💰 费用预估</Text>
                        <Text className={styles.chargingDetailValue}>{chargingInfo.estimatedCost > 0 ? `¥${chargingInfo.estimatedCost}` : '计算中...'}</Text>
                      </View>
                      <View className={styles.chargingDetailItem}>
                        <Text className={styles.chargingDetailLabel}>📍 充电桩</Text>
                        <Text className={styles.chargingDetailValue}>{chargingInfo.chargingPileName}</Text>
                      </View>
                    </View>
                    <Button className={styles.completeBtn} onClick={handleComplete}>
                      ✅ 充电完成，准备离场
                    </Button>
                  </View>
                </View>
              )}

              {queueInfo.processStatus === 'arrived' && (
                <View className={styles.section}>
                  <Button className={styles.startChargingBtn} onClick={handleStartCharging}>
                    ⚡ 车辆已就位，开始充电
                  </Button>
                </View>
              )}

              {queueInfo.processStatus === 'completed' && (
                <View className={styles.section}>
                  <View className={styles.completedCard}>
                    <Text className={styles.completedIcon}>🎉</Text>
                    <Text className={styles.completedTitle}>充电已完成</Text>
                    <Text className={styles.completedDesc}>本次充电记录已保存至历史，感谢使用！</Text>
                    <Button className={styles.completedBtn} onClick={() => Taro.switchTab({ url: '/pages/home/index' })}>
                      返回首页
                    </Button>
                  </View>
                </View>
              )}

              {queueInfo.processStatus !== 'charging' && queueInfo.processStatus !== 'completed' && (
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
              )}

              {queueInfo.currentAction && (
                <View className={styles.section}>
                  <View className={styles.actionStatusCard}>
                    <View className={styles.actionStatusHeader}>
                      <View className={styles.actionStatusInfo}>
                        <Text className={styles.actionStatusIcon}>
                          {getActionIcon(queueInfo.currentAction.type)}
                        </Text>
                        <View>
                          <Text className={styles.actionStatusLabel}>
                            {queueInfo.currentAction.label}
                          </Text>
                          <Text className={styles.actionStatusTime}>
                            上报时间：{formatTime(queueInfo.currentAction.reportTime)}
                          </Text>
                        </View>
                      </View>
                      <View
                        className={styles.actionStatusBadge}
                        style={{ backgroundColor: `${getActionStatusText(queueInfo.currentAction).color}15`, color: getActionStatusText(queueInfo.currentAction).color }}
                      >
                        <Text>{getActionStatusText(queueInfo.currentAction).icon}</Text>
                        <Text style={{ marginLeft: 8 }}>{getActionStatusText(queueInfo.currentAction).text}</Text>
                      </View>
                    </View>
                    <Button className={styles.actionClearBtn} onClick={handleClearAction}>
                      取消上报
                    </Button>
                  </View>
                </View>
              )}

              {queueInfo.processStatus !== 'charging' && queueInfo.processStatus !== 'completed' && (
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
                        description={queueInfo.currentAction ? '已有待处理上报' : action.description}
                        variant={action.type === 'reverse' ? 'danger' : action.type === 'arrived' ? 'primary' : 'warning'}
                        onClick={() => handleOneClickAction(action.type, action.label)}
                        disabled={!!queueInfo.currentAction}
                      />
                    ))}
                  </View>
                </View>
              )}

              <View className={styles.section}>
                <View className={styles.fleetSection}>
                  <View className={styles.fleetHeader}>
                    <Text className={styles.fleetTitle}>
                      <Text>👥</Text>
                      同行车队
                    </Text>
                    <View style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <Text className={styles.fleetCount}>共{fleetMembers.length}人</Text>
                      <Button className={styles.shareBtn} onClick={handleShareFleet}>
                        邀请队友
                      </Button>
                    </View>
                  </View>
                  <View className={styles.fleetList}>
                    {fleetMembers.map((member) => (
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

              <Button className={styles.overdueSimBtn} onClick={handleSimulateOverdue}>
                ⚠️ 模拟过号
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
                  4. 充电进度每5秒自动更新，也可下拉手动刷新
                </Text>
              </View>
            </>
          )}
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
