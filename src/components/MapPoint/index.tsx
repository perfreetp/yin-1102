import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { StationMapPoint } from '@/types';
import { pointTypeConfig } from '@/data/mockNavigation';

interface MapPointProps {
  point: StationMapPoint;
  selected?: boolean;
  onClick?: () => void;
  showLabel?: boolean;
}

const MapPoint: React.FC<MapPointProps> = ({
  point,
  selected = false,
  onClick,
  showLabel = true
}) => {
  const { type, x, y, name, status } = point;
  const config = pointTypeConfig[type];

  return (
    <View
      className={classnames(styles.mapPoint, {
        [styles.selected]: selected,
        [styles.occupied]: status === 'occupied'
      })}
      style={{ left: `${x}rpx`, top: `${y}rpx` }}
      onClick={onClick}
    >
      <View
        className={styles.pointIcon}
        style={{ backgroundColor: config.color }}
      >
        <Text>{config.icon}</Text>
      </View>
      {showLabel && <View className={styles.pointLabel}>{name}</View>}
    </View>
  );
};

export default MapPoint;
