import { isMockAuth, mockSignOut } from "../../lib/mock-auth";

const handleSignOut = async () => {
  try {
    if (isMockAuth()) {
      await mockSignOut();
    } else {
      await signOut();
    }
    navigate("/login");
  } catch (error) {
    console.error("Error signing out:", error);
    // Even if sign out fails, redirect to login
    navigate("/login");
  }
};
