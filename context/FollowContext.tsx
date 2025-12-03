import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useUser } from "@clerk/clerk-expo";

const FollowCtx = createContext(null);

export const FollowProvider = ({ children }) => {
  const { user } = useUser();
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Fetch follow data from your API
  const fetchFollowData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/followers?userId=${user.id}`
      );
      if (!res.ok) throw new Error("Failed to fetch follow data");
      const data = await res.json();
      setFollowers(data.followers || []);
      setFollowing(data.following || []);
    } catch (err) {
      console.error("❌ Error fetching follow data:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFollowData();
  }, [fetchFollowData]);

  // ✅ Follow / Unfollow logic (with optimistic update)
  const handleFollow = async (targetUserId) => {
    if (!user?.id) return;

    const isFollowing = following.some((f) => f.userId === targetUserId);
    const method = isFollowing ? "DELETE" : "POST";

    // --- optimistic update ---
    const updatedFollowing = isFollowing
      ? following.filter((f) => f.userId !== targetUserId)
      : [...following, { userId: targetUserId }];

    setFollowing(updatedFollowing);

    try {
      const res = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/api/followers`,
        {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            followerUserId: user.id,
            followingUserId: targetUserId,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to update follow status");
      // Optionally re-fetch
      fetchFollowData();
    } catch (err) {
      console.error("❌ Error updating follow:", err);
      // rollback on error
      setFollowing(following);
    }
  };

  const followersCount = followers.length;
  const followingCount = following.length;

  return (
    <FollowCtx.Provider
      value={{
        followers,
        following,
        followersCount,
        followingCount,
        handleFollow,
        loading,
        error,
        refresh: fetchFollowData,
      }}
    >
      {children}
    </FollowCtx.Provider>
  );
};

export const useFollow = () => useContext(FollowCtx);
