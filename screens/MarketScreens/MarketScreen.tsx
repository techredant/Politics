import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { RootStackParamList, Product } from "../../types/navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

type MarketNavProp = NativeStackNavigationProp<RootStackParamList, "Market">;

const MarketScreen = () => {
  const navigation = useNavigation<MarketNavProp>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { theme, isDark } = useTheme();

  // Fetch all products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Product[]>(
        `http://192.168.100.4:3000/api/products`
      );
      setProducts(res.data);
      const uniqueCategories = Array.from(
        new Set(res.data.map((p) => p.category))
      );
      setCategories(uniqueCategories);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products;

  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("ProductDetail", { product: item })}
    >
      <Image source={{ uri: item.images[0] }} style={styles.image} />
      <View style={[styles.info,{backgroundColor: theme.card}]}>
        <Text style={[styles.name,{color: theme.text}]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.price}>
          KES {Number(item.price).toLocaleString("en-KE")}
        </Text>
      </View>
      {/* <TouchableOpacity style={styles.addButton}>
        <Ionicons name="cart" size={20} color="#fff" />
      </TouchableOpacity> */}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }


  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 12 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={styles.headerRow}>
              <Text></Text>
              <Text style={[styles.header, {color: theme.text}]}>Marketplace</Text>
              <TouchableOpacity
                style={styles.sellButton}
                onPress={() => navigation.navigate("Sell")}
              >
                <Text style={styles.sellText}>Sell</Text>
              </TouchableOpacity>
            </View>

            {/* Category Search */}
            <View style={[styles.categorySearchContainer, {borderColor: theme.border}]}>
              <Ionicons name="search" size={20} color="gray" />
              <TextInput
                placeholder="Search categories..."
                value={categorySearch}
                onChangeText={setCategorySearch}
                style={styles.categorySearchInput}
                placeholderTextColor={theme.subtext}
              />
              {categorySearch ? (
                <Ionicons
                  name="close"
                  size={20}
                  color="gray"
                  onPress={() => setCategorySearch("")}
                />
              ) : null}
            </View>

            {/* Categories */}
            {filteredCategories.length > 0 && (
              <FlatList
                horizontal
                data={[null, ...filteredCategories]}
                keyExtractor={(cat, i) => (cat ?? "all") + i}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingVertical: 10,
                  paddingHorizontal: 4,
                }}
                renderItem={({ item: cat }) => {
                  const selected =
                    cat === selectedCategory ||
                    (cat === null && selectedCategory === null);
                  return (
                    <TouchableOpacity
                      style={[
                        styles.categoryButton,
                        selected && styles.categorySelected,
                      ]}
                      onPress={() =>
                        setSelectedCategory(
                          cat === selectedCategory ? null : cat
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.categoryText,
                          selected && styles.categoryTextSelected,
                        ]}
                      >
                        {cat ?? "All"}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        }
        ListEmptyComponent={
          <Text
            style={{
              textAlign: "center",
              color: "#888",
              marginTop: 50,
              fontSize: 16,
            }}
          >
            No products available.
          </Text>
        }
      />
    </SafeAreaView>
  );
};

export default MarketScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#222",
  },
  sellButton: {
    backgroundColor: "#4caf50",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sellText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  list: { paddingBottom: 20 },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 8,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    position: "relative",
  },
  image: { height: 120, width: "100%" },
  info: { padding: 10 },
  name: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  price: { fontSize: 14, fontWeight: "bold", color: "#4caf50" },
  addButton: {
    position: "absolute",
    right: 10,
    bottom: 10,
    backgroundColor: "#4caf50",
    borderRadius: 20,
    padding: 6,
  },
  categoryButton: {
    backgroundColor: "#eee",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  categorySelected: { backgroundColor: "#4caf50" },
  categoryText: { color: "#333", fontWeight: "500" },
  categoryTextSelected: { color: "#fff" },
  categorySearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 8,
    marginHorizontal: 4,
  },
  categorySearchInput: {
    flex: 1,
    paddingHorizontal: 8,
    height: 36,
  },
});
