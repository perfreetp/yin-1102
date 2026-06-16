import React, { useState, useEffect } from 'react';
import { View, Text, Button, Input, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { useQueueStore } from '@/store/useQueueStore';
import { Vehicle } from '@/types';

const vehicleTypeOptions = [
  '重型半挂牵引车',
  '重型厢式货车',
  '重型冷藏车',
  '重型平板车',
  '重型自卸车',
  '其他车型'
];

const VehicleEditPage: React.FC = () => {
  const router = useRouter();
  const { vehicles, addVehicle, updateVehicle, deleteVehicle } = useQueueStore();
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    plateNumber: '',
    vehicleType: '',
    weight: '',
    length: '',
    isDefault: false
  });
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    const id = router.params.id;
    if (id) {
      const vehicle = vehicles.find((v) => v.id === id);
      if (vehicle) {
        console.log('[VehicleEditPage] editing vehicle:', vehicle);
        setFormData(vehicle);
        setIsEdit(true);
      }
    }
  }, [router.params.id, vehicles]);

  const handleInputChange = (field: keyof Vehicle, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTypeSelect = (type: string) => {
    handleInputChange('vehicleType', type);
  };

  const handleSubmit = () => {
    if (!formData.plateNumber?.trim()) {
      Taro.showToast({ title: '请输入车牌号', icon: 'none' });
      return;
    }
    if (!formData.vehicleType) {
      Taro.showToast({ title: '请选择车型', icon: 'none' });
      return;
    }

    console.log('[VehicleEditPage] submit:', formData);

    if (isEdit && formData.id) {
      updateVehicle(formData.id, {
        plateNumber: formData.plateNumber,
        vehicleType: formData.vehicleType,
        weight: formData.weight,
        length: formData.length,
        isDefault: formData.isDefault
      });
    } else {
      addVehicle({
        plateNumber: formData.plateNumber!,
        vehicleType: formData.vehicleType!,
        weight: formData.weight || '',
        length: formData.length || '',
        isDefault: formData.isDefault || false
      });
    }

    Taro.showToast({
      title: isEdit ? '保存成功' : '添加成功',
      icon: 'success'
    });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1000);
  };

  const handleDelete = () => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除该车辆信息吗？删除后将无法恢复。',
      confirmColor: '#f44336',
      success: (res) => {
        if (res.confirm && formData.id) {
          console.log('[VehicleEditPage] delete vehicle:', formData.id);
          deleteVehicle(formData.id);
          Taro.showToast({ title: '删除成功', icon: 'success' });
          setTimeout(() => {
            Taro.navigateBack();
          }, 1000);
        }
      }
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.formCard}>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.required}>*</Text>
            车牌号
          </Text>
          <Input
            className={styles.input}
            placeholder="请输入车牌号，如：京A·D88235"
            value={formData.plateNumber}
            onInput={(e) => handleInputChange('plateNumber', e.detail.value)}
            maxlength={10}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.required}>*</Text>
            车型
          </Text>
          <View className={styles.vehicleTypes}>
            {vehicleTypeOptions.map((type) => (
              <Button
                key={type}
                className={classnames(styles.typeItem, {
                  [styles.typeItemSelected]: formData.vehicleType === type
                })}
                onClick={() => handleTypeSelect(type)}
              >
                {type}
              </Button>
            ))}
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>总质量（选填）</Text>
          <Input
            className={styles.input}
            placeholder="请输入总质量，如：49吨"
            value={formData.weight}
            onInput={(e) => handleInputChange('weight', e.detail.value)}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>车长（选填）</Text>
          <Input
            className={styles.input}
            placeholder="请输入车长，如：17.5米"
            value={formData.length}
            onInput={(e) => handleInputChange('length', e.detail.value)}
          />
        </View>

        <View className={styles.switchRow}>
          <Text className={styles.switchLabel}>设为默认车辆</Text>
          <Switch
            checked={formData.isDefault}
            onChange={(e) => handleInputChange('isDefault', e.detail.value)}
            color="#1e88e5"
          />
        </View>
      </View>

      <Button className={styles.submitBtn} onClick={handleSubmit}>
        {isEdit ? '保存修改' : '添加车辆'}
      </Button>

      {isEdit && (
        <Button className={styles.deleteBtn} onClick={handleDelete}>
          删除车辆
        </Button>
      )}

      <View className={styles.tipsCard} style={{ marginTop: 32 }}>
        <Text className={styles.tipsTitle}>
          <Text>💡</Text>
          温馨提示
        </Text>
        <Text className={styles.tipsContent}>
          1. 准确的车辆信息有助于场站为您安排合适的充电位
          {'\n'}
          2. 默认车辆会在扫码入队时自动选中
          {'\n'}
          3. 如有多辆车，可以添加多个车辆信息并随时切换
        </Text>
      </View>
    </View>
  );
};

export default VehicleEditPage;
