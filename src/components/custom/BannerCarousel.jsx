import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  Image,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

const { width } = Dimensions.get('window');

// 1. Define the exact width you want for the carousel AND the slides
const CARD_WIDTH = width * 0.93;
const CARD_HEIGHT = 170;

const dummyBanners = [
  { id: '1', image: require('../../assets/banner/banner2.png') },
  { id: '2', image: require('../../assets/banner/banner3.png') },
  { id: '3', image: require('../../assets/banner/banner4.png') },
  { id: '4', image: require('../../assets/banner/banner.jpeg') },
  { id: '5', image: require('../../assets/banner/banner2.png') },
  { id: '6', image: require('../../assets/banner/banner4.png') },
];

const BannerCarousel = ({ data = dummyBanners, onBannerPress }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const timerRef = useRef(null);

  const startAutoScroll = () => {
    stopAutoScroll();
    timerRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % data.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 3000);
  };

  const stopAutoScroll = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (data.length > 1) {
      startAutoScroll();
    }
    return () => stopAutoScroll();
  }, [data.length]);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 50 }).current;

  // 2. Layout must match CARD_WIDTH exactly
  const getItemLayout = (data, index) => ({
    length: CARD_WIDTH,
    offset: CARD_WIDTH * index,
    index,
  });

  const onScrollToIndexFailed = info => {
    const wait = new Promise(resolve => setTimeout(resolve, 500));
    wait.then(() => {
      flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
    });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.slide}
      activeOpacity={0.9}
      onPress={() => onBannerPress && onBannerPress(item)}
    >
      <Image source={item.image} style={styles.image} resizeMode="cover" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrapper}>
      {/* Wrapper ensures the carousel is centered on screen */}
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={data}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScrollToIndexFailed={onScrollToIndexFailed}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          bounces={false}
          getItemLayout={getItemLayout}
          onScrollBeginDrag={() => stopAutoScroll()}
          onMomentumScrollEnd={() => startAutoScroll()}
          onScrollEndDrag={() => startAutoScroll()}
        />

        <View style={styles.paginationContainer}>
          <View style={styles.paginationIndicator}>
            <Text style={styles.paginationText}>
              {currentIndex + 1}/{data.length}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 0,
  },
  container: {
    height: CARD_HEIGHT,
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
  },
  slide: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  paginationIndicator: {
    backgroundColor: '#4a7c59',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  paginationText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
});

export default BannerCarousel;
