import React, { useState, useEffect } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useDidShow } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useQueueStore } from '@/store/useQueueStore';
import { Station } from '@/types';

type ScanStatus = 'idle' | 'scanning' | 'success' | 'failed';

const ScanPage: React.FC = () => {
  const { joinQueue, validateStationCode, currentVehicle } = useQueueStore();
  const [scanStatus, setScanStatus] = useState<ScanStatus>('idle');
  const [scanResult, setScanResult] = useState<{
    code: string;
    message: string;
    station?: Station;
    success: boolean;
  } | null>(null);

  useDidShow(() => {
    console.log('[ScanPage] page did show');
  });

  useEffect(() => {
    if (scanStatus === 'idle') {
      handleScan();
    }
  }, []);

  const handleScan = () => {
    if (scanStatus === 'scanning') return;

    setScanStatus('scanning');
    setScanResult(null);

    Taro.scanCode({
      scanType: ['qrCode', 'barCode'],
      success: (res) => {
        console.log('[ScanPage] scan success, result:', res.result);
        processScanResult(res.result);
      },
      fail: (err) => {
        console.log('[ScanPage] scan fail:', err);
        setScanStatus('failed');
        setScanResult({
          code: '',
          message: err.errMsg || '扫码失败，请检查相机权限后重试',
          success: false
        });
      }
    });
  };

  const processScanResult = (code: string) => {
    console.log('[ScanPage] processing scan result:', code);
    Taro.showLoading({ title: '正在识别...', mask: true });

    setTimeout(() => {
      const result = validateStationCode(code);
      console.log('[ScanPage] validation result:', result);

      Taro.hideLoading();

      if (!result.success) {
        setScanStatus('failed');
        setScanResult({
          code,
          message: result.message,
          success: false
        });
        return;
      }

      setScanStatus('success');
      setScanResult({
        code,
        message: result.message,
        station: result.station,
        success: true
      });
    }, 800);
  };

  const handleConfirmJoin = () => {
    if (!scanResult?.station) return;

    const station = scanResult.station;

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
  };

  const getStatusIcon = () => {
    switch (scanStatus) {
      case 'scanning': return '📷';
      case 'success': return '✅';
      case 'failed': return '❌';
      default: return '📷';
    }
  };

  const tips = [
    '请扫描场站入口处的二维码',
    '确保二维码清晰完整，光线充足',
    '入队后请保持APP在后台运行',
    '叫号后请在5分钟内到达指定位置'
  ];

  const getScanCodeDisplay = (code: string) => {
    if (!code) return '空内容';
    if (code.length > 50) return code.substring(0, 50) + '...';
    return code;
  };

  return (
    <View className={styles.page}>
      {scanStatus === 'idle' || scanStatus === 'scanning' ? (
        <>
          <View className={styles.scanArea}>
            <View className={styles.scanLine} />
            <Text className={styles.scanIcon}>{getStatusIcon()}</Text>
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

          <Button className={styles.scanBtn} onClick={handleScan} disabled={scanStatus === 'scanning'}>
            {scanStatus === 'scanning' ? '正在识别中...' : '重新扫码'}
          </Button>
        </>
      ) : (
        <View className={styles.resultContainer}>
          <View className={styles.resultCard}>
            <Text className={styles.resultIcon}>{getStatusIcon()}</Text>
            <Text className={styles.resultTitle}>
              {scanStatus === 'success' ? '扫码成功' : '扫码失败'}
            </Text>

            {scanResult && (
              <View className={styles.resultContent}>
                <View className={styles.resultRow}>
                  <Text className={styles.resultLabel}>识别内容</Text>
                  <Text className={styles.resultValue}>{getScanCodeDisplay(scanResult.code)}</Text>
                </View>
                <View className={styles.resultRow}>
                  <Text className={styles.resultLabel}>识别结果</Text>
                  <Text className={classnames(styles.resultValue, {
                    [styles.successText]: scanResult.success,
                    [styles.errorText]: !scanResult.success
                  })}>
                    {scanResult.message}
                  </Text>
                </View>

                {scanResult.station && (
                  <View className={styles.stationInfo}>
                    <View className={styles.stationHeader}>
                      <Text className={styles.stationName}>🏢 {scanResult.station.name}</Text>
                    </View>
                    <View className={styles.stationDetail}>
                      <Text className={styles.stationDetailLabel}>📍 地址</Text>
                      <Text className={styles.stationDetailValue}>{scanResult.station.address}</Text>
                    </View>
                    <View className={styles.stationDetail}>
                      <Text className={styles.stationDetailLabel}>📞 电话</Text>
                      <Text className={styles.stationDetailValue}>{scanResult.station.phone}</Text>
                    </View>
                    <View className={styles.stationDetail}>
                      <Text className={styles.stationDetailLabel}>⚡ 充电桩</Text>
                      <Text className={styles.stationDetailValue}>
                        <Text style={{ color: '#4caf50' }}>{scanResult.station.availablePorts}</Text>
                        {' / '}{scanResult.station.totalChargingPorts} 个空闲
                      </Text>
                    </View>
                    {currentVehicle && (
                      <View className={styles.stationDetail}>
                        <Text className={styles.stationDetailLabel}>🚛 当前车辆</Text>
                        <Text className={styles.stationDetailValue}>{currentVehicle.plateNumber}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>

          <View className={styles.resultActions}>
            {scanStatus === 'success' ? (
              <>
                <Button className={styles.confirmBtn} onClick={handleConfirmJoin}>
                  ✅ 确认入队
                </Button>
                <Button className={styles.retryBtn} onClick={handleScan}>
                  📷 重新扫码
                </Button>
              </>
            ) : (
              <>
                <Button className={styles.retryBtn} onClick={handleScan}>
                  📷 重新扫码
                </Button>
                <Button className={styles.backBtn} onClick={() => Taro.navigateBack()}>
                  返回首页
                </Button>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default ScanPage;
