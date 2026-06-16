import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { QueueInfo } from '@/types';
import { getStatusText, getStatusColor, formatWaitTime, formatTime } from '@/utils/format';

interface QueueCardProps {
  queueInfo: QueueInfo;
  className?: string;
}

const QueueCard: React.FC<QueueCardProps> = ({ queueInfo, className }) => {
  const {
    stationName,
    queueNumber,
    aheadCount,
    estimatedWaitTime,
    status,
    joinTime,
    estimatedCallTime,
    chargingPreference,
    totalInQueue
  } = queueInfo;

  const progress = totalInQueue > 0
    ? Math.min(100, Math.max(0, ((queueNumber - aheadCount) / queueNumber) * 100))
    : 0;

  return (
    <View className={classnames(styles.queueCard, className)}>
      <View className={styles.header}>
        <View className={styles.stationInfo}>
          <Text className={styles.stationName}>{stationName}</Text>
          <Text className={styles.joinTime}>入队时间：{formatTime(joinTime)}</Text>
        </View>
        <View
          className={styles.statusBadge}
          style={{ backgroundColor: getStatusColor(status) }}
        >
          {getStatusText(status)}
        </View>
      </View>

      <View className={styles.mainInfo}>
        <View className={styles.infoItem}>
          <Text className={styles.infoValue}>{queueNumber}</Text>
          <Text className={styles.infoLabel}>我的号码</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={classnames(styles.infoValue, styles.highlightValue)}>{aheadCount}</Text>
          <Text className={styles.infoLabel}>前方车辆</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoValue}>{formatWaitTime(estimatedWaitTime)}</Text>
          <Text className={styles.infoLabel}>预计等待</Text>
        </View>
      </View>

      <View className={styles.progressBar}>
        <View className={styles.progressFill} style={{ width: `${progress}%` }} />
      </View>

      <View className={styles.footer}>
        <View className={styles.preference}>
          <Text className={styles.preferenceLabel}>补电偏好：</Text>
          <Text className={styles.preferenceValue}>{chargingPreference.label}</Text>
        </View>
        <Text className={styles.estimatedTime}>预计叫号：{formatTime(estimatedCallTime)}</Text>
      </View>
    </View>
  );
};

export default QueueCard;
