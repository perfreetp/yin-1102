import React from 'react';
import { Text, Button } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface ActionButtonProps {
  icon: string;
  label: string;
  description?: string;
  variant?: 'default' | 'primary' | 'warning' | 'danger';
  disabled?: boolean;
  onClick?: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  description,
  variant = 'default',
  disabled = false,
  onClick
}) => {
  return (
    <Button
      className={classnames(styles.actionButton, {
        [styles.primary]: variant === 'primary',
        [styles.warning]: variant === 'warning',
        [styles.danger]: variant === 'danger',
        [styles.disabled]: disabled
      })}
      onClick={onClick}
      disabled={disabled}
    >
      <Text className={styles.icon}>{icon}</Text>
      <Text className={styles.label}>{label}</Text>
      {description && <Text className={styles.description}>{description}</Text>}
    </Button>
  );
};

export default ActionButton;
