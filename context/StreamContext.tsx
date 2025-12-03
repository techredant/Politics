import React, { createContext, useContext, useState } from "react";
import { mediaDevices, RTCPeerConnection, RTCView } from "react-native-webrtc";

type WebRTCContextType = {
  localStream: any;
  remoteStream: any;
  startCall: (roomId: string) => void;
  endCall: () => void;
};

const WebRTCContext = createContext<WebRTCContextType>({} as WebRTCContextType);

export const WebRTCProvider: React.FC = ({ children }) => {
  const [localStream, setLocalStream] = useState<any>(null);
  const [remoteStream, setRemoteStream] = useState<any>(null);
  const pc = new RTCPeerConnection();

  const startCall = async () => {
    const stream = await mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setLocalStream(stream);
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.ontrack = (event: any) => setRemoteStream(event.streams[0]);
  };

  const endCall = () => {
    localStream?.getTracks().forEach((track) => track.stop());
    pc.close();
    setLocalStream(null);
    setRemoteStream(null);
  };

  return (
    <WebRTCContext.Provider
      value={{ localStream, remoteStream, startCall, endCall }}
    >
      {children}
    </WebRTCContext.Provider>
  );
};

export const useWebRTC = () => useContext(WebRTCContext);
