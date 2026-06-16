import React, { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useQueueStore } from '@/store/useQueueStore';
import { Station } from '@/types';

const ScanPage: React.FC = () => {
  const { joinQueue, validateStationCode, currentVehicle } = useQueueStore();
  const [scanning, setScanning] = useState(false);

  const testCodes = [
    { code: 'STATION-S001', desc: '京东物流港充电站' },
    { code: 'STATION-S002', desc: '顺丰速运顺义场站' },
    { code: 'STATION-S003', desc: '中通快递通州枢纽站' },
    { code: 'https://example.com', desc: '普通网页链接（无效）' },
    { code: 'WECHAT-123456', desc: '微信小程序码（无效）' },
    { code: 'INVALID-123', desc: '无效二维码（无效）' },
    { code: 'abc', desc: '不完整二维码（无效）' },
    { code: '', desc: '空内容（无效）' }
  ];

  const handleScan = () => {
    if (scanning) return;
    
    const items = testCodes.map((item, index) => `${index + 1}. ${item.desc}`).join('\n');
    
    Taro.showActionSheet({
      itemList: testCodes.map(item => `${item.desc}`),
      success: (res) => {
        const selected = testCodes[res.tapIndex];
        processScanResult(selected.code);
      }
    });
  };

  const processScanResult = (code: string) => {
    console.log('[ScanPage] scan result:', code);
    setScanning(true);
    Taro.showLoading({ title: '正在识别...', mask: true });

    setTimeout(() => {
      const result = validateStationCode(code);
      console.log('[ScanPage] validation result:', result);
      
      Taro.hideLoading();
      setScanning(false);

      if (!result.success) {
        Taro.showModal({
          title: '扫码失败',
          content: result.message,
          showCancel: false,
          confirmText: '我知道了',
          confirmColor: '#1e88e5'
        });
        return;
      }

      const station = result.station as Station;
      
      if (currentVehicle) {
        Taro.showModal({
          title: '确认入队',
          content: `场站：${station.name}\n地址：${station.address}\n当前车辆：${currentVehicle.plateNumber}\n\n空闲充电桩：${station.availablePorts}/${station.totalChargingPorts}个`,
          confirmText: '确认入队',
          confirmColor: '#1e88e5',
          cancelText: '取消',
          success: (modalRes) => {
            if (modalRes.confirm) {
              joinQueue(station.id, station.name);
              Taro.showToast({ title: '入队成功！', icon: 'success' });
              setTimeout(() => {
                Taro.switchTab({ url: '/pages/queue/index' });
              }, 1000);
            }
          }
        });
      } else {
        joinQueue(station.id, station.name);
        Taro.showToast({ title: '入队成功！', icon: 'success' });
        setTimeout(() => {
          Taro.switchTab({ url: '/pages/queue/index' });
        }, 1000);
      }
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
        📷 模拟扫码（选择测试场景）
      </Button>
    </View>
  );
};

export default ScanPage;
