import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  RefreshControl,
} from 'react-native';
import {
  ArrowLeft,
  CheckCircle,
  Users,
  Calendar,
  AlertCircle,
  Clock,
  ChevronRight,
  Megaphone,
  Download,
  UserPlus,
  Heart,
  FileText,
  Info,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import {
  useGetPendingUsersQuery,
  useGetAlumniUsersQuery,
  useApproveUserMutation,
  useGetEventsQuery,
} from '../../api/apiSlice';

import AdminEventsTab from './AdminEventsTab';

const StatCard = ({ icon: Icon, color, bg, label, value }) => (
  <View className="bg-white p-4 rounded-xl shadow-sm w-[48%] mb-4 border border-gray-100">
    <View
      className={`${bg} w-10 h-10 rounded-full items-center justify-center mb-2`}
    >
      <Icon size={20} color={color} />
    </View>
    <Text className="text-gray-500 text-xs font-medium">{label}</Text>
    <Text className="text-xl font-bold text-[#1C1C1C]">{value ?? 0}</Text>
  </View>
);

const UserListItem = ({
  user,
  isPending,
  onApprove,
  isApproving,
  onViewProfile,
}) => (
  <TouchableOpacity
    onPress={onViewProfile}
    className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100"
  >
    <View className="flex-row gap-3 mb-3 items-center">
      {/* 🚨 FIXED: Cache busting added directly to the URI */}
      <Image
        source={{
          uri: user.profile_image
            ? `${user.profile_image}?t=${Date.now()}`
            : 'https://via.placeholder.com/150',
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
              user.myapp_status === 'APPROVED'
                ? 'bg-green-100 text-green-700'
                : 'bg-orange-100 text-orange-700'
            }`}
          >
            {user.myapp_status || 'PENDING'}
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
            onPress={onApprove}
            disabled={isApproving}
            className="flex-1 bg-[#2E4A8A] py-2.5 rounded-lg flex-row justify-center items-center gap-2 shadow-sm"
          >
            <CheckCircle size={16} color="white" />
            <Text className="text-white font-bold text-sm">Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onViewProfile}
            className="flex-1 border border-gray-200 bg-gray-50 py-2.5 rounded-lg flex-row justify-center items-center gap-2"
          >
            <Info size={16} color="#666" />
            <Text className="text-gray-600 font-bold text-sm">
              View Details
            </Text>
          </TouchableOpacity>
        </View>
      </>
    )}
  </TouchableOpacity>
);

const EventCard = ({ event, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100"
  >
    <View className="flex-row justify-between items-start mb-2">
      <Text className="text-base font-bold text-[#1C1C1C] flex-1 mr-2">
        {event.event_name}
      </Text>
      {event.is_paid ? (
        <Text className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">
          ₹{event.registration_fee}
        </Text>
      ) : (
        <Text className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
          Free
        </Text>
      )}
    </View>
    <Text className="text-xs text-gray-500 mb-2">
      Hosted by {event.host_name}
    </Text>
    <View className="flex-row gap-4 border-t border-gray-50 pt-2">
      <View className="flex-row items-center gap-1">
        <Calendar size={12} color="#6B7280" />
        <Text className="text-xs text-gray-500">{event.date}</Text>
      </View>
      <View className="flex-row items-center gap-1">
        <Clock size={12} color="#6B7280" />
        <Text className="text-xs text-gray-500">{event.time}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDashboard({ navigation }) {
  const [tab, setTab] = useState('overview');

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
    data: events = [],
    isFetching: isFetchingEvents,
    refetch: refetchEvents,
  } = useGetEventsQuery();

  const pendingCount = pendingUsers.length;
  const approvedCount = approvedUsers.length;
  const totalCount = pendingCount + approvedCount;

  const [approveUser, { isLoading: isApproving }] = useApproveUserMutation();

  const handleRefresh = () => {
    refetchPending();
    refetchApproved();
    refetchEvents();
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
        {['overview', 'approvals', 'events'].map(t => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            className={`flex-1 p-3 border-b-2 ${
              tab === t ? 'border-[#2E4A8A]' : 'border-transparent'
            }`}
          >
            <Text
              className={`text-center font-bold text-xs uppercase tracking-wider ${
                tab === t ? 'text-[#2E4A8A]' : 'text-gray-500'
              }`}
            >
              {t === 'approvals' ? `Approvals (${pendingCount})` : t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'events' ? (
        <AdminEventsTab />
      ) : (
        <ScrollView
          className="p-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={
                isFetchingPending || isFetchingApproved || isFetchingEvents
              }
              onRefresh={handleRefresh}
            />
          }
        >
          {/* ── OVERVIEW TAB ── */}
          {tab === 'overview' && (
            <View className="pb-10">
              {/* Stats Grid */}
              <View className="flex-row flex-wrap justify-between mb-2">
                <StatCard
                  icon={Users}
                  color="#2563EB"
                  bg="bg-blue-100"
                  label="Approved Alumni"
                  value={approvedCount}
                />
                <StatCard
                  icon={AlertCircle}
                  color="#EA580C"
                  bg="bg-orange-100"
                  label="Pending Req"
                  value={pendingCount}
                />
                <StatCard
                  icon={Calendar}
                  color="#9333EA"
                  bg="bg-purple-100"
                  label="Total Events"
                  value={events.length}
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
                <TouchableOpacity
                  onPress={() => setTab('events')}
                  className="bg-white p-4 rounded-xl items-center flex-1 ml-2 shadow-sm border border-gray-100"
                >
                  <View className="bg-purple-50 w-10 h-10 rounded-full items-center justify-center mb-2">
                    <Calendar size={20} color="#9333EA" />
                  </View>
                  <Text className="text-xs font-semibold text-center text-gray-700">
                    New Event
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Upcoming Events */}
              <View className="flex-row justify-between items-center mb-3">
                <Text className="font-bold text-[#1C1C1C] text-lg">
                  Upcoming Events
                </Text>
                <TouchableOpacity onPress={() => setTab('events')}>
                  <Text className="text-sm text-[#2E4A8A] font-semibold">
                    Manage
                  </Text>
                </TouchableOpacity>
              </View>

              {isFetchingEvents ? (
                <Text className="text-gray-400 text-sm text-center py-4">
                  Loading events...
                </Text>
              ) : events.length === 0 ? (
                <View className="bg-white rounded-xl p-6 items-center border border-gray-100">
                  <Calendar size={32} color="#ccc" />
                  <Text className="text-gray-400 text-sm mt-2">
                    No events created yet
                  </Text>
                </View>
              ) : (
                events
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(`${a.date}T${a.time}`) -
                      new Date(`${b.date}T${b.time}`),
                  )
                  .slice(0, 3)
                  .map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onPress={() =>
                        navigation.navigate('EventDetails', {
                          eventId: event.id,
                        })
                      }
                    />
                  ))
              )}
            </View>
          )}

          {/* ── APPROVALS TAB ── */}
          {tab === 'approvals' && (
            <>
              {pendingUsers.length === 0 ? (
                <Text className="text-center text-gray-500 mt-10">
                  No pending requests.
                </Text>
              ) : (
                pendingUsers.map(user => (
                  <UserListItem
                    key={user.id}
                    user={user}
                    isPending={true}
                    isApproving={isApproving}
                    onApprove={() => handleApprove(user.id, user.first_name)}
                    onViewProfile={() => navToProfile(user.id)}
                  />
                ))
              )}
              <View className="h-10" />
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}
