import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import { useLevel } from "@/context/LevelContext";
import { Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import { useTheme } from "@/context/ThemeContext";

interface Post {
  _id: string;
  caption: string;
  levelType: string;
  levelValue: string;
}

interface Trend {
  id: string;
  keyword: string;
  mentions: number;
}

const TrendScreen = () => {
  const { currentLevel } = useLevel();
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme, isDark } = useTheme();

  // Political keywords list
  const POLITICAL_KEYWORDS = [
    "election",
    "elections",
    "vote",
    "voting",
    "campaign",
    "president",
    "parliament",
    "senate",
    "governor",
    "constitution",
    "government",
    "opposition",
    "party",
    "democracy",
    "freedom",
    "development",
    "policy",
    "manifesto",
    "corruption",
    "reform",
    "bill",
    "law",
    "justice",
    "rights",
    "county",
  ];

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `https://politics-chi.vercel.app/api/posts`
        );
        const posts: Post[] = res.data;

        // Filter posts for current level
        const filteredPosts = posts.filter(
          (p) => p.levelValue === currentLevel.value
        );

        // Extract & filter keywords
        const keywordCount: Record<string, number> = {};
        filteredPosts.forEach((post) => {
          const words = post.caption
            ? post.caption.toLowerCase().split(/\s+/)
            : [];
          words.forEach((word) => {
            if (!word) return;
            if (POLITICAL_KEYWORDS.includes(word)) {
              keywordCount[word] = (keywordCount[word] || 0) + 1;
            }
          });
        });

        // Sort + limit to top 20
        const sortedTrends = Object.entries(keywordCount)
          .map(([keyword, mentions], idx) => ({
            id: idx.toString(),
            keyword,
            mentions,
          }))
          .sort((a, b) => b.mentions - a.mentions)
          .slice(0, 20);

        setTrends(sortedTrends);
      } catch (err) {
        console.error("Error fetching posts for trends:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [currentLevel]);

  const renderTrend = ({ item }: { item: Trend }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.keyword}>{item.keyword}</Text>
        <Feather name="more-horizontal" size={18} color="#888" />
      </View>
      <Text style={styles.mentions}>{item.mentions} mentions</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Loading trends...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Transparent StatusBar */}
      <StatusBar
        translucent
        backgroundColor="transparent" // prevent the warning
        barStyle={isDark ? "light-content" : "dark-content"}
      />
      <Text style={[styles.header, { color: theme.text }]}>
        Trending for {currentLevel?.value}
      </Text>
      <FlatList
        data={trends}
        renderItem={renderTrend}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
};

export default TrendScreen;

const styles = StyleSheet.create({
  header: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  keyword: { fontSize: 16, fontWeight: "600", color: "#1DA1F2" },
  mentions: { fontSize: 13, color: "#666" },
});
