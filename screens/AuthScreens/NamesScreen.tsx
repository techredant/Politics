import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { useUserOnboarding } from "@/contexts/UserOnBoardingContext";
import { useAuth, useUser } from "@clerk/clerk-expo";
import * as ImagePicker from "expo-image-picker";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/navigation";
import { Picker } from "@react-native-picker/picker";
import { useTheme } from "@/context/ThemeContext";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Location">;

const accountOptions = [
  "Personal Account",
  "Business Account",
  "Non-profit and Community Account",
  "Public Figure Account",
  "Media and Publisher Account",
  "News and Media Outlet",
  "E-commerce and Retail Account",
  "Entertainment and Event Account",
];

const NamesScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useUser();
  const { getToken } = useAuth();
  const { theme, isDark } = useTheme();

  const {
    firstName = "",
    setFirstName,
    lastName = "",
    setLastName,
    nickName = "",
    setNickName,
    image = user?.imageUrl,
    setImage,
  } = useUserOnboarding();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    nickName: "",
    accountType: "",
  });
  const [accountType, setAccountType] = useState(accountOptions[0]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setImage(result.assets[0].uri);
    }
  };

  const validateFields = () => {
    const newErrors = {
      firstName: "",
      lastName: "",
      nickName: "",
      accountType: "",
    };
    let valid = true;

    if (accountType === "Personal Account") {
      if (!firstName.trim()) {
        newErrors.firstName = "First name is required";
        valid = false;
      }
      if (!lastName.trim()) {
        newErrors.lastName = "Last name is required";
        valid = false;
      }
      if (!nickName.trim()) {
        newErrors.nickName = "Nickname is required";
        valid = false;
      }
    } else {
      if (!firstName.trim()) {
        newErrors.firstName = "First name is required";
        valid = false;
      }
      if (!nickName.trim()) {
        newErrors.nickName = "Organization name is required";
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!user?.id) return;
        const res = await axios.get(
          `https://politics-chi.vercel.app/api/users/${user.id}`
        );
        if (res.data) {
          setFirstName(res.data.firstName || "");
          setLastName(res.data.lastName || "");
          setNickName(res.data.nickName || "");
          setImage(res.data.image || "");
          setAccountType(res.data.accountType || accountOptions[0]);
          setIsEditing(true); // ✅ user exists, editing
        }
      } catch (err) {
        console.log("No existing user, proceeding as new.");
        setIsEditing(false); // ✅ new user
      }
    };
    fetchUser();
  }, [user]);

  const handleSubmit = async () => {
    if (!validateFields()) return;
    setLoading(true);

    try {
      const payload = {
        clerkId: user?.id,
        email: user?.primaryEmailAddress?.emailAddress,
        firstName: accountType === "Personal Account" ? firstName : "",
        lastName: accountType === "Personal Account" ? lastName : "",
        nickName,
        image,
        accountType,
      };

      let res;
      if (isEditing) {
        res = await axios.put(
          `https://politics-chi.vercel.app/api/users/${user?.id}`,
          payload
        );
      } else {
        res = await axios.post(
          "https://politics-chi.vercel.app/api/users/create-user",
          payload
        );
      }

      if (res.data.success) {
        if (!isEditing) {
          // only update metadata the first time
          await user?.update({
            unsafeMetadata: {
              hasNames: true,
              accountType,
              ...user.unsafeMetadata,
            },
          });
        }
        navigation.replace("Location");
      }
    } catch (err) {
      console.error("Error saving user:", err);
      setErrors((prev) => ({ ...prev, accountType: "Failed to save profile" }));
    } finally {
      setLoading(false);
    }
  };

  // const handleSubmit = async () => {
  //   if (!validateFields()) return;

  //   setLoading(true);

  //   try {
  //     const payload = {
  //       clerkId: user?.id,
  //       email: user?.primaryEmailAddress?.emailAddress,
  //       firstName: accountType === "Personal Account" ? firstName : "",
  //       lastName: accountType === "Personal Account" ? lastName : "",
  //       nickName,
  //       image,
  //       provider: "clerk",
  //       accountType,
  //     };

  //     const res = await axios.post(
  //       "https://politics-chi.vercel.app/api/users/create-user",
  //       payload,
  //       { timeout: 5000 }
  //     );

  //     if (res.data.success) {
  //       await user?.update({
  //         unsafeMetadata: {
  //           hasNames: true,
  //           accountType,
  //           ...user.unsafeMetadata,
  //         },
  //       });

  //       navigation.replace("Location");
  //     }
  //   } catch (err) {
  //     console.error("Error saving user:", err);
  //     setErrors((prev) => ({ ...prev, accountType: "Failed to save profile" }));
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.background,
        justifyContent: "center",
        paddingHorizontal: 20,
      }}
    >
      {/* Transparent StatusBar */}
      <StatusBar
        translucent
        backgroundColor="transparent" // prevent the warning
        barStyle={isDark ? "light-content" : "dark-content"}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 10 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text
            className="font-bold mb-4 text-center text-2xl"
            style={{ color: theme.text }}
          >
            Complete Your Profile 🚀
          </Text>

          <TouchableOpacity onPress={pickImage} className="items-center mb-4">
            {image ? (
              <Image
                source={{ uri: image }}
                style={{ width: 100, height: 100, borderRadius: 50 }}
              />
            ) : (
              <Image
                source={{
                  uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNKfj6RsyRZqO4nnWkPFrYMmgrzDmyG31pFQ&s",
                }}
                style={{ width: 100, height: 100, borderRadius: 50 }}
              />
            )}
          </TouchableOpacity>

          <Text className="font-bold mb-1" style={{ color: theme.text }}>
            Account Type
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 8,
              backgroundColor: theme.background,
            }}
          >
            <Picker
              selectedValue={accountType}
              onValueChange={(val) => setAccountType(val)}
              dropdownIconColor={theme.text} // changes dropdown arrow color
              style={{
                color: theme.text, // text color
                paddingHorizontal: 8,
              }}
            >
              {accountOptions.map((opt, idx) => (
                <Picker.Item key={idx} label={opt} value={opt} />
              ))}
            </Picker>
          </View>

          {errors.accountType ? (
            <Text className="text-red-500 mb-3">{errors.accountType}</Text>
          ) : null}

          {accountType === "Personal Account" ? (
            <>
              <TextInput
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
                className={`border p-3 mb-1 rounded-lg border-gray-300`}
                style={{ color: theme.text, borderColor: theme.border }}
                placeholderTextColor={theme.text}
              />
              {errors.firstName ? (
                <Text className="text-red-500 mb-2">{errors.firstName}</Text>
              ) : null}

              <TextInput
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
                className={`border p-3 mb-1 rounded-lg border-gray-300`}
                style={{ color: theme.text, borderColor: theme.border }}
                placeholderTextColor={theme.text}
              />
              {errors.lastName ? (
                <Text className="text-red-500 mb-2">{errors.lastName}</Text>
              ) : null}

              <TextInput
                placeholder="Nickname"
                value={nickName}
                onChangeText={setNickName}
                className={`border p-3 mb-1 rounded-lg border-gray-300`}
                style={{ color: theme.text, borderColor: theme.border }}
                placeholderTextColor={theme.text}
              />
              {errors.nickName ? (
                <Text className="text-red-500 mb-2">{errors.nickName}</Text>
              ) : null}
            </>
          ) : (
            <>
              <TextInput
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
                className={`border p-3 mb-1 rounded-lg border-gray-300`}
                style={{ color: theme.text, borderColor: theme.border }}
                placeholderTextColor={theme.text}
              />
              {errors.firstName ? (
                <Text className="text-red-500 mb-2">{errors.firstName}</Text>
              ) : null}

              <TextInput
                placeholder="Organization Nickname eg; @buyers"
                value={nickName}
                onChangeText={setNickName}
                className={`border p-3 mb-1 rounded-lg border-gray-300`}
                style={{ color: theme.text, borderColor: theme.border }}
                placeholderTextColor={theme.text}
              />
              {errors.nickName ? (
                <Text className="text-red-500 mb-2">{errors.nickName}</Text>
              ) : null}
            </>
          )}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="bg-black py-4 rounded-xl items-center mt-4"
            style={{ backgroundColor: theme.primary }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-base">
                Save & Continue
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default NamesScreen;
