import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { RTCView } from "react-native-webrtc";
import { MaterialIcons, Ionicons, FontAwesome } from "@expo/vector-icons";
import AnimatedIconButton from "@/components/AnimatedIconButton";
// import { useWebRTC } from "@/context/WebRTCContext";

const VideoCallScreen = () => {
  const {
    localStream,
    remoteStream,
    startCall,
    endCall,
    toggleMute,
    toggleVideo,
    switchCamera,
    isMuted,
    isVideoOff,
  } = useWebRTC();
  const [muted, setMuted] = useState(isMuted);
  const [videoOff, setVideoOff] = useState(isVideoOff);

  useEffect(() => {
    startCall();
    return () => endCall();
  }, []);

  return (
    <View style={styles.container}>
      {localStream && (
        <RTCView
          streamURL={localStream.toURL()}
          style={styles.localVideo}
          objectFit="cover"
        />
      )}
      {remoteStream && (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.remoteVideo}
          objectFit="cover"
        />
      )}

      {/* Controls */}
      <View style={styles.controls}>
        {/* End Call */}
        <AnimatedIconButton
          icon={<MaterialIcons name="call-end" />}
          onPress={endCall}
          buttonStyle={{ backgroundColor: "red" }}
          size={40}
          color="#fff"
        />

        {/* Mute / Unmute */}
        <AnimatedIconButton
          icon={<Ionicons name={muted ? "mic-off" : "mic"} />}
          onPress={() => {
            toggleMute();
            setMuted(!muted);
          }}
          size={35}
          color="#fff"
        />

        {/* Video On/Off */}
        <AnimatedIconButton
          icon={<Ionicons name={videoOff ? "videocam-off" : "videocam"} />}
          onPress={() => {
            toggleVideo();
            setVideoOff(!videoOff);
          }}
          size={35}
          color="#fff"
        />

        {/* Switch Camera */}
        <AnimatedIconButton
          icon={<MaterialIcons name="flip-camera-ios" />}
          onPress={switchCamera}
          size={35}
          color="#fff"
        />
      </View>
    </View>
  );
};

export default VideoCallScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  remoteVideo: { flex: 1 },
  localVideo: {
    width: 120,
    height: 160,
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 2,
    borderRadius: 8,
  },
  controls: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
});
