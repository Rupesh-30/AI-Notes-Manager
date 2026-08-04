import { auth } from "../firebase/config";

export async function askBackendAI(prompt, action = "askAI") {
  try {
    // ==========================================
    // Check Firebase Authentication
    // ==========================================

    const user = auth.currentUser;

    if (!user) {
      throw new Error("Please login first.");
    }

    // ==========================================
    // Get Firebase ID Token
    // ==========================================

    const idToken = await user.getIdToken();

    // ==========================================
    // Send Request to Backend
    // ==========================================

    const response = await fetch(
      "https://ai-notes-manager-8eu7.onrender.com/api/ai",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },

        body: JSON.stringify({
          prompt,
          action,
        }),
      }
    );

    // ==========================================
    // Read Response
    // ==========================================

    const data = await response.json();

    // ==========================================
    // Handle Backend Error
    // ==========================================

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "AI request failed."
      );
    }

    // ==========================================
    // Return AI Response
    // ==========================================

    return data.text;

  } catch (error) {
    console.error("Backend AI Error:", error);
    throw error;
  }
}