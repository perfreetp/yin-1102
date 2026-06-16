import React, { useState } from 'react';
import { View, Text, Button, Textarea, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { feedbackOptions } from '@/data/mockVehicles';

const FeedbackPage: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');

  const handleOptionSelect = (value: string) => {
    console.log('[FeedbackPage] option selected:', value);
    setSelectedOption(value);
  };

  const handleSubmit = () => {
    if (!selectedOption) {
      Taro.showToast({ title: '请选择反馈类型', icon: 'none' });
      return;
    }
    if (!description.trim()) {
      Taro.showToast({ title: '请描述具体问题', icon: 'none' });
      return;
    }

    console.log('[FeedbackPage] submit:', { selectedOption, description, contact });
    Taro.showModal({
      title: '提交成功',
      content: '您的反馈已提交，我们将尽快处理并回复您。',
      showCancel: false,
      success: () => {
        Taro.navigateBack();
      }
    });
  };

  const isSubmitDisabled = !selectedOption || !description.trim();

  const optionIcons: Record<string, string> = {
    long_wait: '⏰',
    no_call: '📢',
    equipment: '🔧',
    service: '👤',
    other: '📋'
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>⏰ 催办反馈</Text>
        <Text className={styles.headerDesc}>
          遇到排队长时间不动或其他问题？
          {'\n'}
          请告诉我们，我们会尽快处理。
        </Text>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.titleIcon}>📋</Text>
          问题类型
        </Text>
        <View className={styles.optionsCard}>
          {feedbackOptions.map((option) => (
            <Button
              key={option.id}
              className={classnames(styles.optionItem, {
                [styles.optionSelected]: selectedOption === option.value
              })}
              onClick={() => handleOptionSelect(option.value)}
            >
              <View className={styles.optionIcon}>
                <Text>{optionIcons[option.value] || '📋'}</Text>
              </View>
              <Text className={styles.optionText}>{option.label}</Text>
              {selectedOption === option.value && (
                <Text className={styles.checkIcon}>✓</Text>
              )}
            </Button>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.inputSection}>
          <Text className={styles.inputLabel}>详细描述 *</Text>
          <Textarea
            className={styles.textarea}
            placeholder="请详细描述您遇到的问题，包括时间、地点、具体情况等..."
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
            maxlength={500}
          />
          <Text className={styles.charCount}>{description.length}/500</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.contactSection}>
          <Text className={styles.contactLabel}>联系方式（选填）</Text>
          <Input
            className={styles.input}
            placeholder="请输入您的手机号，方便我们联系您"
            value={contact}
            onInput={(e) => setContact(e.detail.value)}
            type="number"
            maxlength={11}
          />
        </View>
      </View>

      <Button
        className={classnames(styles.submitBtn, {
          [styles.submitBtnDisabled]: isSubmitDisabled
        })}
        onClick={handleSubmit}
        disabled={isSubmitDisabled}
      >
        提交反馈
      </Button>

      <View className={styles.tipsCard}>
        <Text className={styles.tipsTitle}>
          <Text>💡</Text>
          温馨提示
        </Text>
        <Text className={styles.tipsContent}>
          1. 催办反馈将优先处理，工作人员会在5分钟内响应
          {'\n'}
          2. 如遇紧急情况，请直接拨打场站服务热线
          {'\n'}
          3. 您也可以在消息中心查看处理进度
        </Text>
      </View>
    </View>
  );
};

export default FeedbackPage;
