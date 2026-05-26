import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Plus } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const SpecialCard = ({ title, backgroundImage, onExploreMore, style }) => {
  return (
    <TouchableOpacity
      style={[styles.cardContainer, style]}
      onPress={onExploreMore}
      activeOpacity={0.8}
      className="border-gray-300"
    >
      <ImageBackground
        source={backgroundImage}
        style={styles.cardBackground}
        imageStyle={styles.cardImageStyle}
      >
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={onExploreMore}
            activeOpacity={0.6}
          >
            <Text style={styles.exploreButtonText}>Explore More</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const SpecialForYouSection = ({ onNavigate }) => {
  const specialOffers = [
    {
      id: 'seeds',
      title: 'Seeds Oil',
      backgroundImage: require('../../assets/banner/banner2.png'),
      targetScreen: 'ProductList',
    },
    {
      id: 'fruit-salad',
      title: 'Spice Festival',
      backgroundImage: require('../../assets/banner/banner3.png'),
      targetScreen: 'ProductList',
    },
    {
      id: 'ghee-fest',
      title: 'Atta Dhamaka',
      backgroundImage: require('../../assets/banner/banner4.png'),
      targetScreen: 'ProductList',
    },
  ];

  const handleExploreMore = item => {
    console.log(`Exploring: ${item.title}`);
    onNavigate(item.targetScreen, { offerId: item.id, title: item.title });
  };

  return (
    <View style={styles.sectionContainer}>
      <View className="flex-row items-center">
        <View className="flex-1 h-px bg-gray-300" />
        <View style={styles.sectionHeader}>
          <Plus size={18} color="#4a7c59" style={styles.headerDivider} />
          <Text style={styles.sectionTitle}>Special for you</Text>
          <Plus size={18} color="#4a7c59" style={styles.headerDivider} />
        </View>
        <View className="flex-1 h-px bg-gray-300" />
      </View>

      <View style={styles.cardsGrid}>
        <SpecialCard
          title={specialOffers[0].title}
          backgroundImage={specialOffers[0].backgroundImage}
          onExploreMore={() => handleExploreMore(specialOffers[0])}
        />

        <View style={styles.bottomCardsRow}>
          <SpecialCard
            style={styles.halfWidthCard}
            title={specialOffers[1].title}
            backgroundImage={specialOffers[1].backgroundImage}
            onExploreMore={() => handleExploreMore(specialOffers[1])}
          />
          <SpecialCard
            style={styles.halfWidthCard}
            title={specialOffers[2].title}
            backgroundImage={specialOffers[2].backgroundImage}
            onExploreMore={() => handleExploreMore(specialOffers[2])}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // marginBottom: 20,
  },
  headerDivider: {
    marginHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  cardsGrid: {
    gap: 16,
    marginTop: 20,
  },
  cardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardBackground: {
    width: '100%',
    height: 180,
    justifyContent: 'flex-end',
  },
  cardImageStyle: {
    borderRadius: 16,
  },
  cardContent: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    width: '100%',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  exploreButton: {
    backgroundColor: '#4a7c59',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '400',
  },
  bottomCardsRow: {
    flexDirection: 'row',
    gap: 16, // Added gap for spacing between the two cards
  },
  halfWidthCard: {
    flex: 1, // This is the most important part
    // All other styles are inherited from cardContainer
  },
});

export default SpecialForYouSection;
