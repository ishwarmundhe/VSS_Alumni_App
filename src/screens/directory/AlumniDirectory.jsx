import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { ArrowLeft, Search, MapPin, Briefcase, MailCheckIcon, MailCheck } from 'lucide-react-native';

// Import the new RTK Query hook
import { useGetDirectoryUsersQuery } from '../../api/apiSlice';

export default function AlumniDirectory({ navigation }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce the search input to avoid spamming the API
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500); // Wait 500ms after user stops typing
    return () => clearTimeout(timerId);
  }, [searchTerm]);

  // Fetch real data from the backend, passing the debounced search term
  const {
    data: alumni = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetDirectoryUsersQuery({
    search: debouncedSearch || undefined, // Send undefined if empty so RTK Query drops the param
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
      <StatusBar barStyle="light-content" backgroundColor="#2E4A8A" />

      {/* Header */}
      <View className="bg-[#2E4A8A] p-4 pt-16 shadow-sm z-10">
        <View className="flex-row items-center gap-3 mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Alumni Directory</Text>
        </View>
        <View className="bg-white rounded-lg flex-row items-center px-3 h-10 shadow-inner">
          <Search size={18} color="#717182" />
          <TextInput
            placeholderTextColor="#9CA3AF"
            placeholder="Search alumni..."
            className="flex-1 ml-2 text-[#1C1C1C]"
            value={searchTerm}
            onChangeText={setSearchTerm}
            returnKeyType="search"
          />
        </View>
      </View>

      <ScrollView
        className="p-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={refetch}
          />
        }
      >
        {/* Loading State */}
        {isLoading ? (
          <ActivityIndicator size="large" color="#2E4A8A" className="mt-10" />
        ) : (
          <>
            <Text className="text-sm text-gray-500 mb-4 font-medium">
              Showing {alumni.length} members
            </Text>

            {/* Empty State */}
            {alumni.length === 0 && (
              <View className="items-center mt-10">
                <Text className="text-gray-500 text-base">
                  No alumni found.
                </Text>
                {debouncedSearch ? (
                  <Text className="text-gray-400 text-sm mt-1">
                    Try a different search term.
                  </Text>
                ) : null}
              </View>
            )}

            {/* List */}
            {alumni.map(p => {
              // Use optional chaining to safely check for addresses
              const primaryAddress =
                p.addresses?.length > 0 ? p.addresses[0] : null;
              const locationString = primaryAddress
                ? `${primaryAddress.city}, ${primaryAddress.state}`
                : 'Location unavailable';

              // Store the job title to easily check if we should render the row
              const jobTitle = p.designation || p.profession;

              return (
                <TouchableOpacity
                  key={p.id}
                  onPress={() =>
                    navigation.navigate('UserProfile', { userId: p.id })
                  }
                  className="bg-white p-4 rounded-xl mb-3 shadow-sm flex-row gap-4 border border-gray-100"
                >
                  <Image
                    source={{
                      uri: p.profile_image || 'https://via.placeholder.com/150',
                    }}
                    className="w-12 h-12 rounded-full bg-gray-200"
                    resizeMode="cover"
                  />
                  <View className="flex-1">
                    <View className="flex-row justify-between items-start">
                      <Text className="font-bold text-[#1C1C1C] text-lg flex-1">
                        {p.first_name} {p.last_name}
                      </Text>

                      {/* Renders only if both years exist */}
                      {p.from_year && p.to_year && (
                        <View className="bg-blue-50 px-2 py-1 rounded">
                          <Text className="text-xs text-[#2E4A8A] font-medium">
                            {String(p.from_year).slice(2)}-
                            {String(p.to_year).slice(2)}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Conditionally render the Briefcase row ONLY if a job title exists */}
                    {jobTitle && (
                      <View className="flex-row items-center gap-1 mb-1 mt-1">
                        <Briefcase size={12} color="#717182" />
                        <Text
                          className="text-xs text-[#717182] flex-1 capitalize"
                          numberOfLines={1}
                        >
                          {jobTitle}
                          {p.company_name ? ` @ ${p.company_name}` : ''}
                        </Text>
                      </View>
                    )}

                    {/* Location row with fallback text */}
                    <View className="flex-row items-center gap-1 mt-1">
                      <MailCheckIcon size={12} color="#717182" />
                      <Text
                        className="text-xs text-[#717182] flex-1"
                        numberOfLines={1}
                      >
                        {p.email}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
