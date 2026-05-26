import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Users,
  Wallet,
  Calendar,
  AlertCircle,
  Clock,
  ChevronRight,
  Megaphone,
  Download,
  UserPlus,
  Heart,
  FileText,
  InfoIcon,
} from 'lucide-react-native';

import {
  useGetPendingUsersQuery,
  useGetAlumniUsersQuery,
  useGetAlumniStatsQuery,
  useApproveUserMutation,
} from '../../api/apiSlice';
import AdminEventsTab from './AdminEventsTab';

export default function AdminDashboard({ navigation }) {
  const [tab, setTab] = useState('overview');

  // API Hooks
  const {
    data: pendingUsers = [],
    isFetching: isFetchingPending,
    refetch: refetchPending,
  } = useGetPendingUsersQuery();
  const {
    data: approvedUsers = [],
    isFetching: isFetchingApproved,
    refetch: refetchApproved,
  } = useGetAlumniUsersQuery();
  const {
    data: stats = { total_count: 0, approved_count: 0, pending_count: 0 },
    refetch: refetchStats,
  } = useGetAlumniStatsQuery();
  const [approveUser, { isLoading: isApproving }] = useApproveUserMutation();

  const handleRefresh = () => {
    refetchPending();
    refetchApproved();
    refetchStats();
  };

  const handleApprove = async (userId, userName) => {
    try {
      await approveUser(userId).unwrap();
      Toast.show({
        type: 'success',
        text1: 'User Approved',
        text2: `${userName} has been successfully approved!`,
      });
    } catch (error) {
      console.error('Approval failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Approval Failed',
        text2: 'Failed to approve user. Please try again.',
      });
    }
  };

  const navToProfile = userId => {
    navigation.navigate('UserProfile', { userId });
  };

  // --- STATIC MOCK DATA FOR OVERVIEW ---
  const recentActivities = [
    {
      id: 1,
      text: 'Rahul P. submitted registration',
      time: '10 mins ago',
      icon: UserPlus,
      color: '#2563EB',
      bg: 'bg-blue-100',
    },
    {
      id: 2,
      text: 'Sneha G. donated ₹5,000 to Hostel Fund',
      time: '2 hours ago',
      icon: Heart,
      color: '#EA580C',
      bg: 'bg-orange-100',
    },
    {
      id: 3,
      text: 'Amit D. posted a new job opportunity',
      time: '5 hours ago',
      icon: FileText,
      color: '#16A34A',
      bg: 'bg-green-100',
    },
  ];

  const recentDonations = [
    { id: 1, name: 'Vikram Singh', batch: '2015', amount: '₹10,000' },
    { id: 2, name: 'Anjali Nair', batch: '2018', amount: '₹2,500' },
    { id: 3, name: 'Priya Sharma', batch: '2012', amount: '₹5,000' },
  ];

  // --- REUSABLE COMPONENTS ---
  const StatCard = ({ icon: Icon, color, bg, label, value }) => (
    <View className="bg-white p-4 rounded-xl shadow-sm w-[48%] mb-4 border border-gray-100">
      <View
        className={`${bg} w-10 h-10 rounded-full items-center justify-center mb-2`}
      >
        <Icon size={20} color={color} />
      </View>
      <Text className="text-gray-500 text-xs font-medium">{label}</Text>
      <Text className="text-xl font-bold text-[#1C1C1C]">{value}</Text>
    </View>
  );

  const UserListItem = ({ user, isPending }) => (
    <TouchableOpacity
      onPress={() => navToProfile(user.id)}
      className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100"
    >
      <View className="flex-row gap-3 mb-3 items-center">
        <Image
          source={{
            uri: user.profile_image || 'https://via.placeholder.com/150',
          }}
          className="w-12 h-12 rounded-full bg-gray-200"
        />
        <View className="flex-1">
          <View className="flex-row justify-between items-start">
            <Text className="font-bold text-lg text-[#1C1C1C] flex-1">
              {user.first_name} {user.last_name}
            </Text>
            <Text
              className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                user.status === 'APPROVED'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-orange-100 text-orange-700'
              }`}
            >
              {user.status || 'PENDING'}
            </Text>
          </View>
          <Text className="text-sm text-gray-600">{user.email}</Text>
          <Text className="text-xs text-gray-500 mt-1">
            +91 {user.mobile} • {user.gender}
          </Text>
        </View>
        <ChevronRight size={20} color="#9CA3AF" />
      </View>

      {isPending && (
        <>
          <View className="h-[1px] bg-gray-100 mb-3" />
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => handleApprove(user.id, user.first_name)}
              disabled={isApproving}
              className="flex-1 bg-[#2E4A8A] py-2.5 rounded-lg flex-row justify-center items-center gap-2 shadow-sm"
            >
              <CheckCircle size={16} color="white" />
              <Text className="text-white font-bold text-sm">Approve</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navToProfile(user.id)}
              className="flex-1 border border-gray-200 bg-gray-50 py-2.5 rounded-lg flex-row justify-center items-center gap-2"
            >
              <InfoIcon size={16} color="#666" />
              <Text className="text-gray-600 font-bold text-sm">
                View Details
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
      <StatusBar barStyle="light-content" backgroundColor="#2E4A8A" />

      {/* Header */}
      <View className="bg-[#2E4A8A] p-4 flex-row items-center gap-3 pt-16 pb-6 shadow-sm z-10">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Admin Dashboard</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-white border-b border-gray-200">
        {['overview', 'approvals', 'alumni', 'events'].map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            className={`flex-1 p-3 border-b-2 ${tab === t ? 'border-[#2E4A8A]' : 'border-transparent'}`}
          >
            <Text
              className={`text-center font-bold text-xs uppercase tracking-wider ${
                tab === t ? 'text-[#2E4A8A]' : 'text-gray-500'
              }`}
            >
              {t === 'approvals' ? `Approvals (${stats.pending_count})` : t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        className="p-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetchingPending || isFetchingApproved}
            onRefresh={handleRefresh}
          />
        }
      >
        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <View className="pb-10">
            {/* Stats Grid */}
            <View className="flex-row flex-wrap justify-between mb-2">
              <StatCard
                icon={Users}
                color="#2563EB"
                bg="bg-blue-100"
                label="Approved Alumni"
                value={stats.approved_count}
              />
              <StatCard
                icon={AlertCircle}
                color="#EA580C"
                bg="bg-orange-100"
                label="Pending Req"
                value={stats.pending_count}
              />
              <StatCard
                icon={Wallet}
                color="#16A34A"
                bg="bg-green-100"
                label="Total Funds"
                value="₹ 4.5L"
              />
              <StatCard
                icon={Calendar}
                color="#9333EA"
                bg="bg-purple-100"
                label="Active Events"
                value="3"
              />
            </View>

            {/* Quick Actions */}
            <Text className="font-bold text-[#1C1C1C] text-lg mb-3">
              Quick Actions
            </Text>
            <View className="flex-row justify-between mb-6">
              <TouchableOpacity className="bg-white p-4 rounded-xl items-center flex-1 mr-2 shadow-sm border border-gray-100">
                <View className="bg-blue-50 w-10 h-10 rounded-full items-center justify-center mb-2">
                  <Megaphone size={20} color="#2E4A8A" />
                </View>
                <Text className="text-xs font-semibold text-center text-gray-700">
                  Broadcast
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-white p-4 rounded-xl items-center flex-1 mx-1 shadow-sm border border-gray-100">
                <View className="bg-green-50 w-10 h-10 rounded-full items-center justify-center mb-2">
                  <Download size={20} color="#16A34A" />
                </View>
                <Text className="text-xs font-semibold text-center text-gray-700">
                  Export CSV
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-white p-4 rounded-xl items-center flex-1 ml-2 shadow-sm border border-gray-100">
                <View className="bg-purple-50 w-10 h-10 rounded-full items-center justify-center mb-2">
                  <Calendar size={20} color="#9333EA" />
                </View>
                <Text className="text-xs font-semibold text-center text-gray-700">
                  New Event
                </Text>
              </TouchableOpacity>
            </View>

            {/* Recent Activity */}
            <Text className="font-bold text-[#1C1C1C] text-lg mb-3">
              Recent Activity
            </Text>
            <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
              {recentActivities.map((activity, index) => (
                <View
                  key={activity.id}
                  className={`flex-row items-center gap-3 py-3 ${index !== recentActivities.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <View
                    className={`${activity.bg} w-8 h-8 rounded-full items-center justify-center`}
                  >
                    <activity.icon size={14} color={activity.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm text-[#1C1C1C] font-medium">
                      {activity.text}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Clock size={10} color="#9CA3AF" />
                      <Text className="text-[10px] text-gray-400 ml-1">
                        {activity.time}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Recent Donations */}
            <View className="flex-row justify-between items-center mb-3">
              <Text className="font-bold text-[#1C1C1C] text-lg">
                Recent Donations
              </Text>
              <TouchableOpacity>
                <Text className="text-sm text-[#2E4A8A] font-semibold">
                  View All
                </Text>
              </TouchableOpacity>
            </View>
            <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              {recentDonations.map((donation, index) => (
                <View
                  key={donation.id}
                  className={`flex-row justify-between items-center py-3 ${index !== recentDonations.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  <View>
                    <Text className="text-sm font-bold text-[#1C1C1C]">
                      {donation.name}
                    </Text>
                    <Text className="text-xs text-gray-500">
                      Batch {donation.batch}
                    </Text>
                  </View>
                  <Text className="text-sm font-bold text-[#16A34A]">
                    {donation.amount}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* APPROVALS TAB */}
        {tab === 'approvals' && (
          <>
            {pendingUsers.length === 0 ? (
              <Text className="text-center text-gray-500 mt-10">
                No pending requests.
              </Text>
            ) : (
              pendingUsers.map(user => (
                <UserListItem key={user.id} user={user} isPending={true} />
              ))
            )}
            <View className="h-10" />
          </>
        )}

        {/* ALUMNI TAB */}
        {tab === 'alumni' && (
          <>
            {approvedUsers.length === 0 ? (
              <Text className="text-center text-gray-500 mt-10">
                No approved alumni found.
              </Text>
            ) : (
              approvedUsers.map(user => (
                <UserListItem key={user.id} user={user} isPending={false} />
              ))
            )}
            <View className="h-10" />
          </>
        )}

        {/* EVENTS TAB */}
        {tab === 'events' && <AdminEventsTab />}
      </ScrollView>
    </View>
  );
}
