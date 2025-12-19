// import { StyleSheet } from 'react-native'
// import { SafeAreaView } from 'react-native-safe-area-context'
// import {
//   CallContent,
//   StreamCall,
//   StreamVideo,
//   StreamVideoClient,
//   User,
// } from '@stream-io/video-react-native-sdk'
// import { StatusBar } from 'expo-status-bar'

// const apiKey = 'sh3w4dys9h5b'
// const userId = 'demo-user-dwrocVaS'
// const token = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiZGVtby11c2VyLWR3cm9jVmFTIiwic3ViIjoidXNlci9kZW1vLXVzZXItZHdyb2NWYVMiLCJhcGlLZXkiOiJzaDN3NGR5czloNWIiLCJpYXQiOjE3NjYwODc3MDcsImV4cCI6MTc2NjA5MTMwN30.p6F3DKGFhG3SaAE0O0lQ0XDsHeMrnw1YQNpbn1fNnHo'

// const user: User = { id: userId }
// const client = StreamVideoClient.getOrCreateInstance({ apiKey, user, token })
// const call = client.call('default', 'demo-call-aaEfKK-D')
// call.join({ create: true })

// export default function VideoCallScreen() {
//   return (
//     <SafeAreaView style={styles.container}>
//       <StreamVideo client={client}>
//         <StreamCall call={call}>
//           <CallContent />
//         </StreamCall>
//       </StreamVideo>
//       <StatusBar style="auto" />
//     </SafeAreaView>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// })


import { View, Text } from 'react-native'
import React from 'react'

const VideoCallScreen = () => {
  return (
    <View>
      <Text>VideoCallScreen</Text>
    </View>
  )
}

export default VideoCallScreen