import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { getStatusText, getStatusColor } from '@/utils/format';

interface StatusBadgeProps {
  status: string;
  size?: 'small' | 'normal' | 'large';
  customText?: string;
  customColor?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'normal',
  customText,
  customColor
}) => {
  const text = customText || getStatusText(status);
  const color = customColor || getStatusColor(status);

  return (
    <View
      className={classnames(styles.badge, {
        [styles.small]: size === 'small',
        [styles.large]: size === 'large'
      })}
      style={{ backgroundColor: color }}
    >
      <Text style={{ color: '#fff' }}>{text}</Text>
    </View>
  );
};

export default StatusBadge;
