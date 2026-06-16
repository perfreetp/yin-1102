import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useQueueStore } from '@/store/useQueueStore';

const ScanPage: React.FC = () => {
  const { joinQueue } = useQueueStore();

  const handleScan = () => {
    console.log('[ScanPage] scan clicked');
    Taro.showToast({ title: '正在扫描...', icon: 'loading', duration: 1500 });
    setTimeout(() => {
      joinQueue('S001', '京东物流港充电站');
      Taro.showToast({ title: '入队成功！', icon: 'success' });
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/queue/index' });
      }, 1000);
    }, 1500);
  };

  const tips = [
    '请扫描场站入口处的二维码',
    '确保二维码清晰完整，光线充足',
    '入队后请保持APP在后台运行',
    '叫号后请在5分钟内到达指定位置'
  ];

  return (
    <View className={styles.page}>
      <View className={styles.scanArea}>
        <View className={styles.scanLine} />
        <Text className={styles.scanIcon}>📷</Text>
        <Text className={styles.scanText}>
          将二维码放入框内
          {'\n'}
          自动识别加入队列
        </Text>
      </View>

      <View className={styles.tips}>
        <Text className={styles.tipsTitle}>
          <Text>💡</Text>
          扫码须知
        </Text>
        <View className={styles.tipsContent}>
          {tips.map((tip, index) => (
            <View key={index} className={styles.tipItem}>
              <Text className={styles.tipIcon}>•</Text>
              <Text>{tip}</Text>
            </View>
          ))}
        </View>
      </View>

      <Button className={styles.scanBtn} onClick={handleScan}>
        📷 点击扫码入队
      </Button>
    </View>
  );
};

export default ScanPage;
