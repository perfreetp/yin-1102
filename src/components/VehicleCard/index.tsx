import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import { Vehicle } from '@/types';

interface VehicleCardProps {
  vehicle: Vehicle;
  selected?: boolean;
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  selected = false,
  onSelect,
  onEdit,
  onDelete,
  showActions = true
}) => {
  const { plateNumber, vehicleType, weight, length, isDefault } = vehicle;

  return (
    <View
      className={classnames(styles.vehicleCard, { [styles.selected]: selected })}
      onClick={onSelect}
    >
      <View className={styles.header}>
        <Text className={styles.plateNumber}>{plateNumber}</Text>
        {isDefault && <View className={styles.defaultBadge}>默认车辆</View>}
      </View>

      <View className={styles.info}>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>车型：</Text>
          <Text className={styles.infoValue}>{vehicleType}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>总重：</Text>
          <Text className={styles.infoValue}>{weight}</Text>
        </View>
        <View className={styles.infoItem}>
          <Text className={styles.infoLabel}>车长：</Text>
          <Text className={styles.infoValue}>{length}</Text>
        </View>
      </View>

      {showActions && (
        <View className={styles.footer}>
          <Button className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>
            编辑
          </Button>
          <Button
            className={classnames(styles.actionBtn, styles.primaryBtn)}
            onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
          >
            {isDefault ? '使用中' : '设为默认'}
          </Button>
        </View>
      )}
    </View>
  );
};

export default VehicleCard;
