import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { useTheme } from "@/context/ThemeContext";
import { LoaderKitView } from "react-native-loader-kit";

const BASE_URL = "https://politics-chi.vercel.app/api/users";

interface Member {
  _id: string;
  clerkId: string;
  firstName: string;
  lastName: string;
  nickName: string;
  image: string;
  followers: string[];
  isFollowing?: boolean;
}

interface MembersScreenProps {
  currentUserId: string; // Clerk ID
}

const MembersScreen: React.FC<MembersScreenProps> = ({ currentUserId }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const { theme, isDark } = useTheme();

  // ---------------- Fetch All Members ----------------
  const fetchUsers = async () => {
    try {
      const response = await axios.get(BASE_URL, {
        params: { clerkId: currentUserId },
      });

      // Filter out current user so they don’t see themselves first
      const sorted = response.data.sort((a: Member, b: Member) => {
        if (a.clerkId === currentUserId) return -1; // current user first
        if (b.clerkId === currentUserId) return 1;
        return 0;
      });

      setMembers(sorted);
    } catch (error: any) {
      console.error("❌ Error fetching users:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ---------------- Follow / Unfollow ----------------
  const toggleFollow = async (member: Member) => {
    try {
      const endpoint = `${BASE_URL}/${currentUserId}/${
        member.isFollowing ? "unfollow" : "follow"
      }/${member.clerkId}`; // use clerkId, not _id
      await axios.post(endpoint);

      setMembers((prev) =>
        prev.map((m) =>
          m.clerkId === member.clerkId
            ? { ...m, isFollowing: !member.isFollowing }
            : m
        )
      );
    } catch (err: any) {
      console.error(
        "❌ Error updating follow state:",
        err.response?.data || err.message
      );
    }
  };

  // ---------------- Render Each Member ----------------
  const renderMember = ({ item }: { item: Member }) => {
    const isCurrentUser = item.clerkId === currentUserId;

    return (
      <View style={[styles.memberCard, { backgroundColor: theme.card }]}>
        {/* Avatar + Info */}
        <View style={styles.userInfo}>
          <Image
            source={{
              uri:
                item.image?.trim() !== ""
                  ? item.image
                  : `https://api.dicebear.com/7.x/initials/svg?seed=${
                      item.firstName || "User"
                    }`,
            }}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: theme.text }]}>
              {item.firstName} {item.lastName}
            </Text>
            <Text style={[styles.username, { color: theme.subtext }]}>
              @{item.nickName || "unknown"}
            </Text>
          </View>
        </View>

        {/* Follow / Unfollow / You */}
        {isCurrentUser ? (
          <View style={styles.youChip}>
            <Text style={styles.youText}>You</Text>
          </View>
        ) : (
          <TouchableOpacity onPress={() => toggleFollow(item)}>
            <Text
              style={item.isFollowing ? styles.unfollowText : styles.followText}
            >
              {item.isFollowing ? "Unfollow" : "Follow"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // ---------------- UI ----------------
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      <Text style={[styles.title, { color: theme.text }]}>
        Members ({members.length})
      </Text>

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <LoaderKitView
            style={{ width: 50, height: 50 }}
            name="BallScaleRippleMultiple"
            animationSpeedMultiplier={1.0}
            color={theme.text}
          />
        </View>
      ) : (
        <FlatList
          data={members}
          renderItem={renderMember}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default MembersScreen;

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 12,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  userInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  name: { fontSize: 16, fontWeight: "600" },
  username: { fontSize: 14, marginTop: 2 },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  followText: {
    color: "blue", // Blue text for Follow
    fontWeight: "bold",
  },
  unfollowText: {
    color: "red", // Red text for Unfollow
    fontWeight: "bold",
  },

  // "You" chip (Twitter style)
  youChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#1DA1F2",
    backgroundColor: "transparent",
  },
  youText: {
    color: "#1DA1F2",
    fontWeight: "600",
    fontStyle: "italic",
  },
});
