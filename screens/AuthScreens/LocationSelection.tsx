import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Picker } from "@react-native-picker/picker";
import iebc from "@/assets/data/iebc.json";
import { SafeAreaView } from "react-native-safe-area-context";
import TypeWriter from "react-native-typewriter";
import { useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/types/navigation";
import { useTheme } from "@/context/ThemeContext";

const LocationSelection = () => {
  const [selectedCounty, setSelectedCounty] = useState("");
  const [selectedConstituency, setSelectedConstituency] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState<string | null>(null);
  const { theme, isDark } = useTheme();

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { user } = useUser();

  useEffect(() => {
    if (user) {
      const type =
        (user.unsafeMetadata?.accountType as string) || "Personal Account";
      setAccountType(type);
    }
  }, [user]);

  const county = iebc.counties.find((c) => c.name === selectedCounty) || null;
  const constituencies = county ? county.constituencies : [];
  const constituency =
    constituencies.find((c) => c.name === selectedConstituency) || null;
  const wards = constituency ? constituency.wards : [];

  const saveLocation = async () => {
    if (!user) return;
    setLoading(true);

    const payload: any = {
      clerkId: user.id,
      county: selectedCounty || "N/A",
    };

    if (accountType === "Personal Account") {
      payload.constituency = selectedConstituency;
      payload.ward = selectedWard;
    }

    try {
      await axios.post(
        "http://192.168.100.28:3000/api/users/update-location",
        payload
      );

      await user.update({
        unsafeMetadata: {
          ...user.unsafeMetadata,
          hasLocation: true,
          onboarded: true,
        },
      });

      navigation.replace("Drawer");
    } catch (err) {
      console.error("❌ Error saving location:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.background,
        justifyContent: "center",
        paddingHorizontal: 20,
      }}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      <View style={{ height: 120 }}>
        <TypeWriter
          typing={1}
          style={{
            margin: 20,
            fontSize: 20,
            fontWeight: "bold",
            textAlign: "center",
            color: theme.text,
          }}
          numberOfLines={2}
        >
          Welcome to BroadCast, In pursuit of a perfect nation.
        </TypeWriter>
      </View>

      {/* County Picker */}
      <Text style={{ fontWeight: "bold", fontSize: 20, color: theme.text }}>
        County
      </Text>
      <Picker
        selectedValue={selectedCounty}
        onValueChange={(val) => {
          setSelectedCounty(val);
          setSelectedConstituency("");
          setSelectedWard("");
        }}
        style={{ color: theme.text }}
        dropdownIconColor={theme.subtext}
      >
        <Picker.Item label="Select County" value="" />
        {iebc.counties.map((c, idx) => (
          <Picker.Item key={idx} label={c.name} value={c.name} />
        ))}
      </Picker>

      {accountType === "Personal Account" && selectedCounty && (
        <>
          <Text style={{ fontWeight: "bold", fontSize: 20, color: theme.text }}>
            Constituency
          </Text>
          <Picker
            selectedValue={selectedConstituency}
            onValueChange={(val) => {
              setSelectedConstituency(val);
              setSelectedWard("");
            }}
            style={{ color: theme.text }}
            dropdownIconColor={theme.subtext}
          >
            <Picker.Item label="Select Constituency" value="" />
            {constituencies.map((c, idx) => (
              <Picker.Item key={idx} label={c.name} value={c.name} />
            ))}
          </Picker>

          {selectedConstituency && (
            <>
              <Text
                style={{ fontWeight: "bold", fontSize: 20, color: theme.text }}
              >
                Ward
              </Text>
              <Picker
                selectedValue={selectedWard}
                onValueChange={(val) => setSelectedWard(val)}
                style={{ color: theme.text }}
                dropdownIconColor={theme.subtext}
              >
                <Picker.Item label="Select Ward" value="" />
                {wards.map((w, idx) => (
                  <Picker.Item key={idx} label={w.name} value={w.name} />
                ))}
              </Picker>
            </>
          )}
        </>
      )}

      {/* Show Selection */}
      <Text
        style={{
          marginTop: 20,
          fontWeight: "bold",
          color: theme.subtext,
        }}
      >
        ✅ Selected: {selectedCounty}
        {accountType === "Personal Account" &&
          selectedConstituency &&
          ` → ${selectedConstituency}`}
        {accountType === "Personal Account" &&
          selectedWard &&
          ` → ${selectedWard}`}
      </Text>

      {/* Continue Button */}
      {(accountType !== "Personal Account" ||
        (selectedCounty && selectedConstituency && selectedWard)) && (
        <Pressable
          onPress={saveLocation}
          style={{
            backgroundColor: theme.primary,
            paddingVertical: 16,
            borderRadius: 12,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 40,
          }}
        >
          {loading && (
            <ActivityIndicator
              size="small"
              color={theme.text}
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            style={{
              color: theme.text,
              textAlign: "center",
              fontWeight: "bold",
              fontSize: 16,
            }}
          >
            Continue
          </Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
};

export default LocationSelection;
