import { supabase } from "./supabase";
// import { mockUser } from "./mock-auth"; // Unused

interface QuestionnaireDataToSave {
  user_id: string;
  data: Record<string, unknown>; // Changed from any
  // Define other properties if known, e.g., id, created_at, etc.
}

/**
 * Save questionnaire data to the database
 * @param data The questionnaire data to save
 * @param userId The user ID to associate the data with
 * @returns The saved data or null if there was an error
 */
export async function saveQuestionnaireData(data: QuestionnaireDataToSave, userId?: string) {
  try {
    if (!userId) {
      console.error("No user ID provided for saving questionnaire data");
      return null;
    }

    const { data: savedData, error } = await supabase
      .from("questionnaire_data")
      .upsert({
        user_id: userId,
        data: data,
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error("Error saving questionnaire data:", error);
      return null;
    }

    return savedData;
  } catch (error) {
    console.error("Error in saveQuestionnaireData:", error);
    return null;
  }
}

/**
 * Get questionnaire data for a user
 * @param userId The user ID to get data for
 * @returns The questionnaire data or null if there was an error
 */
export async function getQuestionnaireData(userId: string) {
  try {
    const { data, error } = await supabase
      .from("questionnaire_data")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching questionnaire data:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getQuestionnaireData:", error);
    return null;
  }
}

/**
 * Mock function to provide default user data when no user is available
 * This helps prevent errors in storyboards and testing environments
 * @returns A mock user object with default values
 */
export function getMockUser() {
  return {
    id: "mock-user-id",
    email: "user@example.com",
    firstName: "Test",
    lastName: "User",
    role: "user",
    organization: {
      id: "mock-org-id",
      name: "Test Organization",
    },
  };
}
