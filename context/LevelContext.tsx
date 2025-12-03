import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-expo";

interface LevelContextType {
  currentLevel: { type: string; value: string };
  setCurrentLevel: (level: { type: string; value: string }) => void;
  county?: string;
  setCounty: (county: string) => void;
  constituency?: string;
  setConstituency: (constituency: string) => void;
  ward?: string;
  setWard: (ward: string) => void;
  userDetails?: any;
  refreshUserDetails: () => Promise<void>;
  isLoadingUser: boolean;
}

const LevelContext = createContext<LevelContextType | undefined>(undefined);

export const LevelProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [currentLevel, setCurrentLevel] = useState({
    type: "home",
    value: "home",
  });
  const [county, setCounty] = useState<string>();
  const [constituency, setConstituency] = useState<string>();
  const [ward, setWard] = useState<string>();
  const [userDetails, setUserDetails] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);

  const refreshUserDetails = async () => {
    if (!user) return;
    setIsLoadingUser(true);
    try {
      const token = await getToken();
      const res = await axios.get(
        `http://192.168.100.28:3000/api/users/${user.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data;
      setUserDetails(data);
      setCounty(data.county);
      setConstituency(data.constituency);
      setWard(data.ward);
    } catch (err) {
      console.error("Error fetching user details:", err);
    } finally {
      setIsLoadingUser(false);
    }
  };

  // Auto-fetch when Clerk user changes
  useEffect(() => {
    if (user) refreshUserDetails();
  }, [user]);

  return (
    <LevelContext.Provider
      value={{
        currentLevel,
        setCurrentLevel,
        county,
        setCounty,
        constituency,
        setConstituency,
        ward,
        setWard,
        userDetails,
        refreshUserDetails,
        isLoadingUser,
      }}
    >
      {children}
    </LevelContext.Provider>
  );
};

export const useLevel = () => {
  const context = useContext(LevelContext);
  if (!context) throw new Error("useLevel must be used within a LevelProvider");
  return context;
};
