import React, { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';
import { mockFleetMembers } from '@/data/mockQueue';
import { FleetMember } from '@/types';

const FleetPage: React.FC = () => {
  const [members, setMembers] = useState<FleetMember[]>(mockFleetMembers);
  const [hasFleet, setHasFleet] = useState(true);
  const fleetCode = '88235';

  const handleCopyCode = () => {
    console.log('[FleetPage] copy fleet code');
    Taro.setClipboardData({
      data: fleetCode,
      success: () => {
        Taro.showToast({ title: '车队码已复制', icon: 'success' });
      }
    });
  };

  const handleShare = () => {
    console.log('[FleetPage] share fleet');
    Taro.showToast({ title: '分享功能开发中', icon: 'none' });
  };

  const handleAddMember = () => {
    console.log('[FleetPage] add member');
    Taro.showModal({
      title: '添加队员',
      editable: true,
      placeholderText: '请输入队员的车队码',
      success: (res) => {
        if (res.confirm && res.content) {
          Taro.showToast({ title: '已发送邀请', icon: 'success' });
        }
      }
    });
  };

  const handleMemberClick = (member: FleetMember) => {
    console.log('[FleetPage] member clicked:', member.id);
    Taro.showModal({
      title: member.driverName,
      content: `车牌号：${member.plateNumber}\n排队号：${member.queueNumber}\n状态：${member.status === 'waiting' ? '排队中' : member.status === 'calling' ? '正在叫号' : '已完成'}`,
      showCancel: false
    });
  };

  const handleCreateFleet = () => {
    console.log('[FleetPage] create fleet');
    setHasFleet(true);
    Taro.showToast({ title: '车队创建成功', icon: 'success' });
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'waiting':
        return styles.statusWaiting;
      case 'calling':
        return styles.statusCalling;
      case 'completed':
        return styles.statusCompleted;
      default:
        return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting':
        return '排队中';
      case 'calling':
        return '叫号中';
      case 'completed':
        return '已完成';
      default:
        return status;
    }
  };

  const waitingCount = members.filter((m) => m.status === 'waiting').length;
  const callingCount = members.filter((m) => m.status === 'calling').length;
  const completedCount = members.filter((m) => m.status === 'completed').length;

  return (
    <View className={styles.page}>
      {hasFleet ? (
        <>
          <View className={styles.headerCard}>
            <View className={styles.fleetCode}>
              <Text className={styles.codeLabel}>我的车队码</Text>
              <Text className={styles.codeValue}>{fleetCode}</Text>
            </View>
            <View className={styles.codeActions}>
              <Button className={styles.codeBtn} onClick={handleCopyCode}>
                📋 复制车队码
              </Button>
              <Button className={styles.codeBtn} onClick={handleShare}>
                📤 邀请队友
              </Button>
            </View>
            <View className={styles.fleetStats}>
              <View className={styles.statItem}>
                <Text className={styles.statValue}>{members.length}</Text>
                <Text className={styles.statLabel}>总人数</Text>
              </View>
              <View className={styles.statItem}>
                <Text className={styles.statValue}>{waitingCount}</Text>
                <Text className={styles.statLabel}>排队中</Text>
              </View>
              <View className={styles.statItem}>
                <Text className={styles.statValue}>{completedCount}</Text>
                <Text className={styles.statLabel}>已完成</Text>
              </View>
            </View>
          </View>

          <View className={styles.section}>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>
                <Text className={styles.titleIcon}>👥</Text>
                队员列表
              </Text>
              <Button className={styles.addMemberBtn} onClick={handleAddMember}>
                + 添加
              </Button>
            </View>
            <View className={styles.membersList}>
              {members.map((member) => (
                <View
                  key={member.id}
                  className={styles.memberItem}
                  onClick={() => handleMemberClick(member)}
                >
                  <View className={styles.memberInfo}>
                    <View className={styles.memberAvatar}>
                      <Text>{member.driverName.charAt(0)}</Text>
                    </View>
                    <View className={styles.memberDetails}>
                      <Text className={styles.memberName}>{member.driverName}</Text>
                      <Text className={styles.memberPlate}>{member.plateNumber}</Text>
                    </View>
                  </View>
                  <View className={styles.memberStatus}>
                    <Text className={styles.queueNumber}>#{member.queueNumber}</Text>
                    <View
                      className={classnames(styles.statusBadge, getStatusClass(member.status))}
                    >
                      {getStatusText(member.status)}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.tipsCard}>
            <Text className={styles.tipsTitle}>
              <Text>💡</Text>
              车队共享说明
            </Text>
            <Text className={styles.tipsContent}>
              1. 车队成员可以实时查看彼此的排队进度
              {'\n'}
              2. 队友叫号或过号时，所有队员都会收到提醒
              {'\n'}
              3. 车队码有效期7天，过期后需要重新创建
              {'\n'}
              4. 最多支持20名队员加入同一个车队
            </Text>
          </View>
        </>
      ) : (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>👥</Text>
          <Text className={styles.emptyTitle}>还没有车队</Text>
          <Text className={styles.emptyDesc}>
            创建车队，与队友共享排队进度，协同进站更高效
          </Text>
          <Button className={styles.createBtn} onClick={handleCreateFleet}>
            🚚 创建车队
          </Button>
        </View>
      )}
    </View>
  );
};

export default FleetPage;
