import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker"; // 👈 category dropdown
import { useUser } from "@clerk/clerk-expo";
import { ActivityIndicator } from "react-native-paper";
import { useTheme } from "@/context/ThemeContext";

const SellFormScreen = () => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [media, setMedia] = useState<
    { uri: string; type: "image" | "video" }[]
  >([]);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(""); // 👈 new state
  const [loading, setLoading] = useState(false);

  const categories = [
    "Electronics",
    "Mobile Phones",
    "Computers & Laptops",
    "Accessories",
    "Home Appliances",
    "Fashion",
    "Clothing",
    "Shoes",
    "Bags",
    "Jewelry & Watches",
    "Health & Beauty",
    "Sports & Fitness",
    "Toys & Games",
    "Baby & Kids",
    "Furniture",
    "Home & Garden",
    "Kitchen & Dining",
    "Pets & Animals",
    "Books",
    "Music & Instruments",
    "Art & Collectibles",
    "Vehicles",
    "Cars",
    "Motorcycles",
    "Trucks & Trailers",
    "Agriculture",
    "Industrial Equipment",
    "Real Estate",
    "Services",
  ];

  const [titleError, setTitleError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [imagesError, setImagesError] = useState("");
  const [categoryError, setCategoryError] = useState(""); // 👈 new error
  const { user } = useUser();

  const navigation = useNavigation();

  // 🔹 Image pickers remain same...

  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const assets = result.assets.map((asset) => ({
        uri: asset.uri,
        type: asset.type as "image" | "video",
      }));
      setMedia((prev) => [...prev, ...assets]);
      setImagesError(""); // keep if you want error state
    }
  };

  // Take photo/video
  const takePhotoOrVideo = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      mediaTypes: ["images", "videos"],
      quality: 1,
    });

    if (!result.canceled) {
      setMedia((prev) => [
        ...prev,
        {
          uri: result.assets[0].uri,
          type: result.assets[0].type as "image" | "video",
        },
      ]);
      setImagesError("");
    }
  };

  //   // Remove single media
  const removeMedia = (uri: string) => {
    setMedia((prev) => prev.filter((item) => item.uri !== uri));
  };

  const uploadToCloudinary = async (uri: string, type: "image" | "video") => {
    const data = new FormData();
    data.append("file", {
      uri,
      type: type === "video" ? "video/mp4" : "image/jpeg",
      name: type === "video" ? "upload.mp4" : "upload.jpg",
    } as any);

    data.append("upload_preset", "MediaCast");
    data.append("cloud_name", "ds25oyyqo");

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/ds25oyyqo/${type}/upload`,
        { method: "POST", body: data }
      );
      const result = await res.json();
      return result.secure_url;
    } catch (err) {
      console.error("❌ Cloudinary Upload Error:", err);
      return null;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setTitleError("");
    setPriceError("");
    setDescriptionError("");
    setImagesError("");
    setCategoryError("");

    try {
      // 1️⃣ Validation
      let hasError = false;

      if (!title.trim()) {
        setTitleError("Product name is required");
        hasError = true;
      }
      if (!price.trim()) {
        setPriceError("Price is required");
        hasError = true;
      }
      if (!description.trim()) {
        setDescriptionError("Description is required");
        hasError = true;
      }
      if (!category.trim()) {
        setCategoryError("Please select a category");
        hasError = true;
      }
      if (media.length === 0) {
        setImagesError("At least one image is required");
        hasError = true;
      }

      if (hasError) return; // ⚠️ Add finally block later to reset loading

      if (!user) {
        alert("You must be signed in to post a product.");
        return;
      }

      // 2️⃣ Upload media to Cloudinary
      const uploadedUrls: string[] = [];
      for (const item of media) {
        const url = await uploadToCloudinary(item.uri, item.type);
        if (url) uploadedUrls.push(url);
      }

      if (uploadedUrls.length === 0) {
        alert("Failed to upload media. Try again.");
        return;
      }

      // 3️⃣ Send product to backend
      const newProduct = {
        title: title.trim(),
        price: price.trim(),
        description: description.trim(),
        category: category,
        images: uploadedUrls,
        userId: user.id, // ✅ Use Clerk ID directly
      };

      const res = await fetch(`http://192.168.100.4:3000/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Failed to save product to DB");
      }

      const data = await res.json();
      console.log("✅ Product saved:", data);

      // 4️⃣ Reset form
      setTitle("");
      setPrice("");
      setDescription("");
      setCategory("");
      setMedia([]);

      // alert("✅ Your product has been listed!");
      navigation.goBack();
    } catch (err: any) {
      console.error("❌ Error submitting product:", err.message);
      alert("Something went wrong while posting.");
    } finally {
      // ✅ Turn off loading in every case
      setLoading(false);
    }
  };

  const { theme, isDark } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? "light-content" : "dark-content"}
      />

      <ScrollView contentContainerStyle={styles.form}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ width: 40 }} />
          <Text style={[styles.headerText, { color: theme.text }]}>
            Sell Your Product
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ padding: 8 }}
          >
            <Ionicons name="close" size={28} color={theme.subtext} />
          </TouchableOpacity>
        </View>

        {/* Product Name */}
        <Text style={[styles.label, { color: theme.text }]}>Product Name</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          placeholder="Enter product name"
          value={title}
          onChangeText={setTitle}
          placeholderTextColor={theme.subtext}
        />
        {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}

        {/* Price */}
        <Text style={[styles.label, { color: theme.text }]}>Price (KES)</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          placeholder="Enter price"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
          placeholderTextColor={theme.subtext}
        />
        {priceError ? <Text style={styles.errorText}>{priceError}</Text> : null}

        {/* Description */}
        <Text style={[styles.label, { color: theme.text }]}>Description</Text>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            {
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          placeholder="Enter product description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          placeholderTextColor={theme.subtext}
        />
        {descriptionError ? (
          <Text style={styles.errorText}>{descriptionError}</Text>
        ) : null}

        {/* Category */}
        <Text style={[styles.label, { color: theme.text }]}>Category</Text>
        <View
          style={[
            styles.pickerWrapper,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Picker
            selectedValue={category}
            onValueChange={(value) => setCategory(value)}
            dropdownIconColor={theme.subtext}
          >
            <Picker.Item
              label="-- Select Category --"
              value=""
              color={theme.subtext}
            />
            {categories.map((cat, index) => (
              <Picker.Item
                key={index}
                label={cat}
                value={cat}
                color={theme.text}
              />
            ))}
          </Picker>
        </View>
        {categoryError ? (
          <Text style={styles.errorText}>{categoryError}</Text>
        ) : null}

        {/* Images */}
        <Text style={[styles.label, { color: theme.text }]}>
          Product Images
        </Text>
        {media.length > 0 ? (
          media.length === 1 ? (
            <View style={{ marginVertical: 10 }}>
              <Image
                source={{ uri: media[0].uri }}
                style={styles.fullWidthImage}
              />
              <TouchableOpacity
                style={styles.removeBtnSingle}
                onPress={() => removeMedia(media[0].uri)}
              >
                <Ionicons name="close-circle" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginVertical: 10 }}
            >
              {media.map((item, index) => (
                <View
                  key={index}
                  style={{ marginRight: 10, position: "relative" }}
                >
                  <Image
                    source={{ uri: item.uri }}
                    style={styles.imagePreview}
                  />
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeMedia(item.uri)}
                  >
                    <Ionicons name="close-circle" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )
        ) : (
          <TouchableOpacity
            style={[styles.imageUpload, { borderColor: theme.border }]}
            onPress={pickMedia}
          >
            <Ionicons name="camera" size={28} color="#666" />
            <Text style={{ color: "#666", marginTop: 4 }}>
              Click here to upload Images
            </Text>
          </TouchableOpacity>
        )}
        {imagesError ? (
          <Text style={styles.errorText}>{imagesError}</Text>
        ) : null}

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={takePhotoOrVideo}>
            <Ionicons name="camera" size={24} color="gray" />
            <Text style={{ color: "gray" }}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={pickMedia}>
            <Ionicons name="image" size={24} color="gray" />
            <Text style={{ color: "gray" }}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {/* Submit */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <View style={styles.submitContent}>
            {loading && (
              <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
            )}
            <Text style={styles.submitText}>Sell Product</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SellFormScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", paddingBottom: 40 },
  form: { padding: 16, marginBottom: 30 },
  label: { fontSize: 14, fontWeight: "600", marginTop: 12, marginBottom: 6 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#fff",
  },
  textArea: { height: 100, textAlignVertical: "top" },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 16,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  pickerWrapper: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  errorText: { color: "red", fontSize: 12, marginTop: 4 },
  submitButton: {
    backgroundColor: "#4caf50",
    padding: 14,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  submitContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  imagePreview: { width: 120, height: 120, borderRadius: 10 },
  fullWidthImage: { width: "100%", height: 300, borderRadius: 12 },
  removeBtn: { position: "absolute", top: 5, right: 5 },
  removeBtnSingle: { position: "absolute", top: 10, right: 10 },
  imageUpload: {
    height: 150,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
});
