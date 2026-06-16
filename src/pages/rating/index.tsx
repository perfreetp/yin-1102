import React, { useState } from 'react';
import { View, Text, Button, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';

const ratingItems = [
  { id: 'service', label: '服务态度' },
  { id: 'order', label: '排队秩序' },
  { id: 'guide', label: '引导准确度' }
];

const quickTags = [
  '响应迅速',
  '态度友好',
  '秩序井然',
  '引导清晰',
  '环境整洁',
  '设施完善'
];

const RatingPage: React.FC = () => {
  const [ratings, setRatings] = useState<Record<string, number>>({
    service: 0,
    order: 0,
    guide: 0
  });
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleStarClick = (itemId: string, star: number) => {
    console.log('[RatingPage] rating:', itemId, star);
    setRatings((prev) => ({ ...prev, [itemId]: star }));
  };

  const handleTagClick = (tag: string) => {
    console.log('[RatingPage] tag clicked:', tag);
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    const totalRating = Object.values(ratings).reduce((sum, r) => sum + r, 0);
    if (totalRating === 0) {
      Taro.showToast({ title: '请至少选择一项评分', icon: 'none' });
      return;
    }

    console.log('[RatingPage] submit:', { ratings, comment, selectedTags });
    Taro.showToast({ title: '评价提交成功！', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  const isSubmitDisabled = Object.values(ratings).every((r) => r === 0);

  const renderStars = (itemId: string, rating: number) => {
    return (
      <View className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Text
            key={star}
            className={classnames(styles.star, { [styles.starActive]: star <= rating })}
            onClick={() => handleStarClick(itemId, star)}
          >
            ★
          </Text>
        ))}
      </View>
    );
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerIcon}>⭐</Text>
        <Text className={styles.headerTitle}>服务评价</Text>
        <Text className={styles.headerSubtitle}>您的评价是我们进步的动力</Text>
      </View>

      <View className={styles.ratingCard}>
        {ratingItems.map((item) => (
          <View key={item.id} className={styles.ratingItem}>
            <Text className={styles.ratingLabel}>{item.label}</Text>
            {renderStars(item.id, ratings[item.id] || 0)}
          </View>
        ))}
      </View>

      <View className={styles.inputSection}>
        <Text className={styles.inputTitle}>补充建议（选填）</Text>
        <Textarea
          className={styles.textarea}
          placeholder="请输入您的建议或意见..."
          value={comment}
          onInput={(e) => setComment(e.detail.value)}
          maxlength={200}
        />
        <View className={styles.quickTags}>
          {quickTags.map((tag) => (
            <Button
              key={tag}
              className={styles.tag}
              style={{
                background: selectedTags.includes(tag) ? '#e3f2fd' : undefined,
                borderColor: selectedTags.includes(tag) ? '#1e88e5' : undefined,
                color: selectedTags.includes(tag) ? '#1e88e5' : undefined
              }}
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </Button>
          ))}
        </View>
      </View>

      <Button
        className={classnames(styles.submitBtn, {
          [styles.submitBtnDisabled]: isSubmitDisabled
        })}
        onClick={handleSubmit}
        disabled={isSubmitDisabled}
      >
        提交评价
      </Button>
    </View>
  );
};

export default RatingPage;
