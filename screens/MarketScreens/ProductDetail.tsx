import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import type { RootStackParamList, Product } from "../../types/navigation";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/ThemeContext";

type ProductDetailRoute = RouteProp<RootStackParamList, "ProductDetail">;

const { width } = Dimensions.get("window");

const ProductDetailScreen = () => {
  const route = useRoute<ProductDetailRoute>();
  const { product } = route.params as { product: Product };
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
    setActiveIndex(index);
  };

  return (
    <SafeAreaView style={[styles.container,{backgroundColor: theme.background}]}>
      <StatusBar
        translucent
        backgroundColor="transparent" // prevent the warning
        barStyle={isDark ? "light-content" : "dark-content"}
      />
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 40 }} />
        <Text style={[styles.title,{color: theme.text}]}>{product.title}</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ padding: 8 }}
        >
          <Ionicons name="close" size={28} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Images */}
      {product.images.length === 1 ? (
        <Image source={{ uri: product.images[0] }} style={styles.fullImage} />
      ) : (
        <View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {product.images.map((img, idx) => (
              <Image
                key={idx}
                source={{ uri: img }}
                style={styles.image}
                resizeMode="cover"
              />
            ))}
          </ScrollView>

          {/* Pagination Dots */}
          <View style={styles.dotsContainer}>
            {product.images.map((_: string, idx: number) => (
              <View
                key={idx}
                style={[styles.dot, activeIndex === idx && styles.activeDot]}
              />
            ))}
          </View>
        </View>
      )}

      {/* Product Info */}
      <Text style={styles.price}>
        KES {Number(product.price).toLocaleString("en-KE")}
      </Text>
      <Text style={styles.category}>Category: {product.category}</Text>
      <Text style={[styles.description,{color: theme.subtext}]}>{product.description}</Text>

      {/* Add to Cart */}
      <TouchableOpacity style={styles.buyButton}>
        <Text style={styles.buyText}>Chat with Seller</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    justifyContent: "space-between",
  },
  title: { fontSize: 22, fontWeight: "bold" },

  fullImage: {
    width: width - 32, // match padding
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
  },
  image: {
    width: width - 32,
    height: 300,
    borderRadius: 12,
    marginRight: 8,
  },

  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#4caf50",
    width: 10,
    height: 10,
  },

  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4caf50",
    marginBottom: 8,
    marginTop: 16,
  },
  category: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
    fontWeight: "bold",
  },
  description: { fontSize: 16, color: "#333", fontWeight: "500" },

  buyButton: {
    backgroundColor: "#4caf50",
    padding: 12,
    borderRadius: 50,
    alignItems: "center",
    marginTop: 20,
  },
  buyText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
