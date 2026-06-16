import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface ActionButtonProps {
  icon: string;
  label: string;
  description?: string;
  variant?: 'default' | 'primary' | 'warning' | 'danger';
  onClick?: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  description,
  variant = 'default',
  onClick
}) => {
  return (
    <Button
      className={classnames(styles.actionButton, {
        [styles.primary]: variant === 'primary',
        [styles.warning]: variant === 'warning',
        [styles.danger]: variant === 'danger'
      })}
      onClick={onClick}
    >
      <Text className={styles.icon}>{icon}</Text>
      <Text className={styles.label}>{label}</Text>
      {description && <Text className={styles.description}>{description}</Text>}
    </Button>
  );
};

export default ActionButton;
