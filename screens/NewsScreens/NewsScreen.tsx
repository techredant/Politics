import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from "react-native";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";

const { width } = Dimensions.get("window");

interface NewsItem {
  _id: string;
  title: string;
  description: string;
  image: string;
  publishedAt: string;
  accountType: string;
  companyName?: string;
  nickName?: string;
}

const NewsScreen = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme, isDark } = useTheme();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get("http://192.168.100.4:3000/api/news");
        const filteredNews = res.data.filter(
          (item: NewsItem) => item.accountType !== "Personal Account"
        );
        setNews(filteredNews);
      } catch (err) {
        console.error("Error fetching news:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const renderItem = ({ item }: { item: NewsItem }) => {
    const displayName =
      item.accountType === "Personal Account"
        ? item.nickName || "Anonymous"
        : item.companyName || "Organization";

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: theme.card, shadowColor: theme.text },
        ]}
      >
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: theme.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.description, { color: theme.subtext }]}>
            {item.description.length > 100
              ? item.description.slice(0, 100) + "..."
              : item.description}
          </Text>
          <Text style={[styles.time, { color: theme.subtext }]}>
            {displayName} • {new Date(item.publishedAt).toLocaleDateString()}{" "}
            {new Date(item.publishedAt).toLocaleTimeString()}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loader, {backgroundColor: theme.background}]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Transparent StatusBar */}
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? "light-content" : "dark-content"}
      />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.header, { color: theme.text }]}>Latest News</Text>
        {news.length === 0 ? (
          <Text
            style={{ textAlign: "center", marginTop: 20, color: theme.subtext }}
          >
            No news from organizations yet.
          </Text>
        ) : (
          <FlatList
            data={news}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default NewsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 12 },
  header: { fontSize: 24, fontWeight: "bold", marginVertical: 16, textAlign: "center" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
    elevation: 2,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  image: { width: width - 24, height: 180 },
  textContainer: { padding: 12 },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 4 },
  description: { fontSize: 14, marginBottom: 6 },
  time: { fontSize: 12 },
});
