import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  TouchableOpacity,
  Image,
  Modal,
  View,
  StyleSheet,
  Text,
  Dimensions,
  StatusBar,
  FlatList,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import VideoPlayer from 'react-native-video';
import YoutubePlayer from 'react-native-youtube-iframe';
import { X } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;
const CARD_HEIGHT = 90;

const ProductCard = React.memo(({ item, onNavigate, onClose }) => {
  const defaultVariant = item.variants?.[0];

  const priceAmount =
    defaultVariant?.pricing?.price?.gross?.amount || item.price || 0;
  const originalPrice = Math.round(priceAmount * 1.67);
  const discountPercent =
    item.discount ||
    Math.round(((originalPrice - priceAmount) / originalPrice) * 100);

  const handleAddPress = () => {
    if (onClose) onClose();
    setTimeout(() => {
      if (onNavigate) onNavigate('ProductDetail', { product: item });
    }, 200);
  };

  return (
    <View style={styles.productCard}>
      <View style={styles.imageContainer}>
        <Image
          source={
            item.thumbnail?.url ? { uri: item.thumbnail.url } : item.image
          }
          style={styles.productImage}
          resizeMode="contain"
        />
        {discountPercent > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercent}% Off</Text>
          </View>
        )}
      </View>

      <View style={styles.productInfo}>
        <View>
          <Text
            style={styles.productName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.name}
          </Text>
          <Text style={styles.productWeight}>
            {defaultVariant?.name || item.weight || '100 g'}
          </Text>
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.priceBlock}>
            <Text style={styles.originalPrice}>₹{originalPrice}</Text>
            <Text style={styles.currentPrice}>₹ {Math.round(priceAmount)}</Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddPress}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const ProductCarousel = React.memo(
  ({ products, isVisible, onNavigate, onClose }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const flatListRef = useRef(null);

    const renderItem = useCallback(
      ({ item }) => (
        <ProductCard item={item} onNavigate={onNavigate} onClose={onClose} />
      ),
      [onNavigate, onClose],
    );

    const keyExtractor = useCallback(
      (item, index) => (item.id ? item.id.toString() : index.toString()),
      [],
    );

    const getItemLayout = useCallback(
      (data, index) => ({
        length: CARD_WIDTH + 12,
        offset: (CARD_WIDTH + 12) * index,
        index,
      }),
      [],
    );

    useEffect(() => {
      let interval;
      if (isVisible && products.length > 1) {
        interval = setInterval(() => {
          setCurrentPage(prevPage => {
            const nextPage =
              prevPage === products.length - 1 ? 0 : prevPage + 1;
            flatListRef.current?.scrollToIndex({
              index: nextPage,
              animated: true,
              viewPosition: 0.5,
            });
            return nextPage;
          });
        }, 4000);
      }
      return () => clearInterval(interval);
    }, [isVisible, products.length]);

    const onScroll = useCallback(
      event => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const page = Math.round(contentOffsetX / CARD_WIDTH);
        if (page >= 0 && page < products.length) {
          setCurrentPage(page);
        }
      },
      [products.length],
    );

    if (products.length === 0) return null;

    return (
      <View style={styles.carouselContainer}>
        <FlatList
          ref={flatListRef}
          data={products}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + 12}
          decelerationRate="fast"
          contentContainerStyle={styles.carouselContent}
          onScroll={onScroll}
          scrollEventThrottle={16}
          getItemLayout={getItemLayout}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          windowSize={3}
        />

        {products.length > 1 && (
          <View style={styles.pageIndicatorContainer}>
            {products.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentPage ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  },
);

const VideoCircle = ({
  imageSource,
  youtubeVideoId,
  localVideoSource,
  size = 100,
  storyTitle = 'Story',
  products = [],
  logoSource,
  subtitle,
  onNavigate,
  isPlayingVideo,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shouldRenderVideo, setShouldRenderVideo] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const hasYoutubeVideo = !!youtubeVideoId;
  const hasLocalVideo = !!localVideoSource;

  useEffect(() => {
    if (!isPlayingVideo) {
      setIsPlaying(false);
    }
  }, [isPlayingVideo]);

  useEffect(() => {
    if (modalVisible) {
      const timer = setTimeout(() => {
        setShouldRenderVideo(true);
        setIsPlaying(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShouldRenderVideo(false);
      setIsPlaying(false);
      progressAnim.setValue(0);
    }
  }, [modalVisible]);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = useCallback(() => {
    setIsPlaying(false);
    setShouldRenderVideo(false);
    setTimeout(() => {
      setModalVisible(false);
      progressAnim.setValue(0);
    }, 100);
  }, []);

  const onVideoEnd = () => {
    handleCloseModal();
  };

  const onProgress = useCallback(data => {
    if (data.seekableDuration > 0) {
      const percentage = data.currentTime / data.seekableDuration;

      Animated.timing(progressAnim, {
        toValue: percentage,
        duration: 250,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start();
    }
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });
  return (
    <>
      <TouchableOpacity onPress={handleOpenModal} activeOpacity={0.8}>
        <Image
          source={imageSource}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 2,
            borderColor: '#4a7c59',
            margin: 1,
          }}
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCloseModal}
        statusBarTranslucent={true}
      >
        <StatusBar
          backgroundColor="transparent"
          barStyle="light-content"
          translucent={true}
        />

        <View style={styles.modalContainer}>
          <View style={styles.videoWrapper}>
            {shouldRenderVideo ? (
              <>
                {hasYoutubeVideo ? (
                  <YoutubePlayer
                    height={height}
                    play={isPlaying}
                    videoId={youtubeVideoId}
                    onChangeState={event => {
                      if (event === 'ended') onVideoEnd();
                    }}
                    webViewStyle={styles.videoPlayer}
                  />
                ) : hasLocalVideo ? (
                  <VideoPlayer
                    source={localVideoSource}
                    style={styles.videoPlayer}
                    controls={false}
                    // resizeMode="cover"
                    onEnd={onVideoEnd}
                    onProgress={onProgress}
                    paused={!isPlaying}
                    repeat={false}
                    progressUpdateInterval={250}
                    ignoreSilentSwitch="ignore"
                  />
                ) : (
                  <Text style={styles.errorText}>No video source found.</Text>
                )}
              </>
            ) : (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading video...</Text>
              </View>
            )}
          </View>

          <View style={styles.overlayContainer}>
            <View style={styles.topBarContainer}>
              <View style={styles.progressContainer}>
                <View style={styles.progressBarBackground}>
                  <Animated.View
                    style={[styles.progressBarFill, { width: progressWidth }]}
                  />
                </View>
              </View>

              <View style={styles.topBarContent}>
                <View style={styles.leftSection}>
                  <Image source={imageSource} style={styles.storyCircle} />
                  <Text style={styles.storyTitle}>{storyTitle}</Text>
                </View>

                <View style={styles.rightSection}>
                  <TouchableOpacity
                    onPress={handleCloseModal}
                    style={styles.closeButton}
                    activeOpacity={0.6}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  >
                    <X size={24} color="white" />
                  </TouchableOpacity>

                  {logoSource && (
                    <Image source={logoSource} style={styles.logoImage} />
                  )}
                </View>
              </View>
            </View>

            {subtitle && (
              <View style={styles.subtitleContainer}>
                <Text style={styles.subtitle}>{subtitle}</Text>
              </View>
            )}

            <ProductCarousel
              products={products}
              isVisible={modalVisible}
              onNavigate={onNavigate}
              onClose={handleCloseModal}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  overlayContainer: {
    flex: 1,
    zIndex: 10,
    justifyContent: 'space-between',
  },
  topBarContainer: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 8 : 48,
    width: '100%',
  },
  progressContainer: {
    paddingHorizontal: 10,
    marginBottom: 12,
    width: '100%',
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  topBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storyCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'white',
  },
  storyTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    alignSelf: 'center',
    marginTop: 100,
  },
  subtitleContainer: {
    position: 'absolute',
    bottom: 160,
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  subtitle: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    fontWeight: '500',
  },
  carouselContainer: {
    marginBottom: 50,
    width: '100%',
  },
  carouselContent: {
    paddingHorizontal: (width - CARD_WIDTH) / 2,
  },
  productCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: 'white',
    borderRadius: 12,
    marginRight: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  imageContainer: {
    width: 110,
    height: '100%',
    backgroundColor: '#f9f9f9',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderBottomRightRadius: 8,
  },
  discountText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  productInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  productWeight: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  priceBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 10,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 4,
    borderRadius: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  pageIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activeDot: {
    backgroundColor: '#4CAF50',
    width: 8,
    height: 8,
  },
  inactiveDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
});

export default VideoCircle;
