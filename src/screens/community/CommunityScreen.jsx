import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image, // <--- Added Image import
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Image as ImageIcon,
  Send,
  MoreHorizontal,
  Share2,
  Rocket,
} from 'lucide-react-native';

export default function CommunityScreen({ navigation }) {
  const [postText, setPostText] = useState('');

  // 1. Updated Data with Profile and Post Images
  const posts = [
    {
      id: 1,
      author: 'Amit Deshmukh',
      userImage: 'https://randomuser.me/api/portraits/men/32.jpg',
      batch: '2008-2013',
      timestamp: '2 hours ago',
      content:
        'Grateful to VSS for shaping my life. The values and discipline I learned during my stay continue to guide me in my career.',
      likes: 45,
      comments: 12,
      postImage: null, // Text-only post
    },
    {
      id: 2,
      author: 'Sneha Kulkarni',
      userImage: 'https://randomuser.me/api/portraits/women/44.jpg',
      batch: '2009-2014',
      timestamp: '2 days ago',
      content:
        'Proud to announce that our Seattle alumni group has raised $5000 for the scholarship fund. Thank you everyone!',
      likes: 156,
      comments: 34,
      postImage:
        'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // Group photo
    },
    {
      id: 3,
      author: 'Rahul Patil',
      userImage: 'https://randomuser.me/api/portraits/men/86.jpg',
      batch: '2015-2019',
      timestamp: '5 days ago',
      content:
        'Throwback to the annual sports day 2018! Found this gem in my old hard drive. Who remembers this match?',
      likes: 89,
      comments: 21,
      postImage:
        'https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80', // Sports photo
    },
  ];

  return (
    <View className="flex-1 bg-[#F2F4F7]">
      <SafeAreaView className="bg-[#2E4A8A]">
        <View className="px-6 py-2 flex-row items-center gap-3">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Community</Text>
        </View>
      </SafeAreaView>
      <View className="flex-1 relative">
        {/* Dimmed & Disabled ScrollView */}
        <View className="flex-1 opacity-50" pointerEvents="none">
          <ScrollView className="flex-1">
            {/* Create Post Section */}
            <View className="bg-white p-4 mb-3 shadow-sm">
              <View className="flex-row gap-3">
                {/* Current User Image */}
                <Image
                  source={{
                    uri: 'https://randomuser.me/api/portraits/men/11.jpg',
                  }}
                  className="w-10 h-10 rounded-full bg-gray-200"
                />
                <View className="flex-1">
                  <TextInput
                    placeholder="Share your memories or updates..."
                    multiline
                    numberOfLines={3}
                    style={{ textAlignVertical: 'top' }}
                    className="bg-[#F8F9FA] rounded-xl p-3 text-[#1C1C1C] mb-3 border border-gray-100"
                    value={postText}
                    onChangeText={setPostText}
                  />
                  <View className="flex-row justify-between items-center">
                    <TouchableOpacity className="flex-row items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                      <ImageIcon size={18} color="#2E4A8A" />
                      <Text className="text-[#2E4A8A] text-xs font-medium">
                        Add Photo
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="bg-[#2E4A8A] flex-row items-center px-5 py-2 rounded-full gap-2 shadow-sm">
                      <Send size={14} color="white" />
                      <Text className="text-white font-semibold text-xs uppercase tracking-wide">
                        Post
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Feed */}
            <View className="pb-6">
              {posts.map(post => (
                <View
                  key={post.id}
                  className="bg-white p-4 mb-2 shadow-sm border-y border-gray-100"
                >
                  {/* Post Header */}
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row gap-3 items-center">
                      <Image
                        source={{ uri: post.userImage }}
                        className="w-10 h-10 rounded-full bg-gray-100"
                      />
                      <View>
                        <Text className="text-[#1C1C1C] font-bold text-base">
                          {post.author}
                        </Text>
                        <Text className="text-xs text-gray-500">
                          Batch {post.batch} • {post.timestamp}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity>
                      <MoreHorizontal size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>

                  {/* Post Content Text */}
                  <Text className="text-[#1C1C1C] text-[15px] leading-6 mb-3">
                    {post.content}
                  </Text>

                  {/* Conditional Post Image */}
                  {post.postImage && (
                    <Image
                      source={{ uri: post.postImage }}
                      className="w-full h-64 rounded-lg mb-3 bg-gray-100"
                      resizeMode="cover"
                    />
                  )}

                  {/* Action Buttons */}
                  <View className="flex-row items-center justify-between pt-3 border-t border-gray-100 mt-1">
                    <View className="flex-row gap-6">
                      <TouchableOpacity className="flex-row items-center gap-2">
                        <Heart size={22} color="#4B5563" />
                        <Text className="text-sm text-gray-600 font-medium">
                          {post.likes}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity className="flex-row items-center gap-2">
                        <MessageCircle size={22} color="#4B5563" />
                        <Text className="text-sm text-gray-600 font-medium">
                          {post.comments}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity>
                      <Share2 size={20} color="#4B5563" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      <View
        className="absolute inset-0 justify-center items-center px-6"
        pointerEvents="none"
      >
        {/* Subtle dark backdrop to make the card pop */}
        <View className="absolute inset-0 bg-black/10" />

        {/* Floating Card */}
        <View className="bg-white w-full max-w-sm px-8 py-10 rounded-3xl shadow-2xl items-center border border-gray-100">
          {/* Icon Container with soft background */}
          <View className="w-24 h-24 bg-blue-50 rounded-full items-center justify-center mb-6 shadow-sm border-4 border-white">
            <Rocket size={48} color="#2E4A8A" strokeWidth={1.5} />
          </View>

          {/* Typography */}
          <Text className="text-[#1C1C1C] text-3xl font-black tracking-wide mb-3 text-center">
            Coming Soon
          </Text>
          <Text className="text-[#717182] text-center leading-relaxed text-base">
            We are building a secure and transparent platform for alumni
            contributions. Stay tuned!
          </Text>

          {/* Decorative Dots */}
          <View className="flex-row gap-2 mt-8">
            <View className="w-2.5 h-2.5 rounded-full bg-[#2E4A8A] opacity-20" />
            <View className="w-2.5 h-2.5 rounded-full bg-[#2E4A8A] opacity-50" />
            <View className="w-2.5 h-2.5 rounded-full bg-[#2E4A8A]" />
          </View>
        </View>
      </View>
    </View>
  );
}
