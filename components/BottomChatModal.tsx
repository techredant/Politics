import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
} from "react-native";
import {
  Chat,
  Channel,
  MessageList,
  MessageInput,
} from "stream-chat-react-native";
import { StreamChat } from "stream-chat";
import { useUser } from "@clerk/clerk-expo";
import AnimatedIconButton from "@/components/AnimatedIconButton";
import { MaterialIcons } from "@expo/vector-icons";

const chatClient = StreamChat.getInstance(process.env.STREAM_CHAT_KEY!);

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

type BottomChatModalProps = {
  channelId: string;
  onClose?: () => void;
};

const BottomChatModal: React.FC<BottomChatModalProps> = ({
  channelId,
  onClose,
}) => {
  const { user, isLoaded } = useUser();
  const [channel, setChannel] = useState<any>(null);

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Animate modal up on mount
  useEffect(() => {
    Animated.spring(translateY, {
      toValue: SCREEN_HEIGHT / 3,
      useNativeDriver: true,
    }).start();
  }, []);

  // Connect Stream Chat user
  useEffect(() => {
    if (!isLoaded || !user) return;

    const connectUser = async () => {
      try {
        await chatClient.connectUser(
          {
            id: user.id,
            name: user.firstName!,
            image: user.imageUrl,
          },
          process.env.STREAM_USER_TOKEN!
        );

        const c = chatClient.channel("messaging", channelId);
        await c.watch();
        setChannel(c);
      } catch (err) {
        console.error("Stream Chat error:", err);
      }
    };

    connectUser();

    return () => chatClient.disconnectUser();
  }, [isLoaded, user, channelId]);

  // --- PanResponder for drag ---
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // Only allow dragging down
        if (gestureState.dy > 0) {
          translateY.setValue(SCREEN_HEIGHT / 3 + gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > SCREEN_HEIGHT / 4) {
          // Dismiss modal
          Animated.spring(translateY, {
            toValue: SCREEN_HEIGHT,
            useNativeDriver: true,
          }).start(() => onClose?.());
        } else {
          // Snap back
          Animated.spring(translateY, {
            toValue: SCREEN_HEIGHT / 3,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  return (
    <>
      {channel && (
        <Animated.View
          style={[styles.container, { transform: [{ translateY }] }]}
          {...panResponder.panHandlers}
        >
          <View style={styles.header}>
            <AnimatedIconButton
              icon={<MaterialIcons name="close" size={24} color="#fff" />}
              onPress={() => {
                Animated.spring(translateY, {
                  toValue: SCREEN_HEIGHT,
                  useNativeDriver: true,
                }).start(() => onClose?.());
              }}
            />
          </View>

          <Chat client={chatClient}>
            <Channel channel={channel}>
              <MessageList />
              <MessageInput />
            </Channel>
          </Chat>
        </Animated.View>
      )}
    </>
  );
};

export default BottomChatModal;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 5,
    elevation: 10,
  },
  header: {
    height: 40,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
});
