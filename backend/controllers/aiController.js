const { generateAI } = require("../services/geminiService");
const admin = require("firebase-admin");

// ==========================================
// AI Usage Settings
// ==========================================

const MONTHLY_LIMIT = 100;
const MAX_PROMPT_LENGTH = 6000;

// ==========================================
// Allowed AI Actions
// ==========================================

const VALID_ACTIONS = new Set([
  "summarize",
  "grammar",
  "translate",
  "tasks",
  "rewrite",
  "askAI",
]);

// ==========================================
// Ask AI
// ==========================================

async function askAI(req, res) {
  const { prompt, action } = req.body;

  // verifyAuth middleware থেকে আসবে
  const uid = req.uid;

  // ==========================================
  // Validate Authentication
  // ==========================================

  if (!uid) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  // ==========================================
  // Validate Prompt
  // ==========================================

  if (
    !prompt ||
    typeof prompt !== "string" ||
    !prompt.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Prompt is required",
    });
  }

  // ==========================================
  // Prompt Length Protection
  // ==========================================

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(413).json({
      success: false,
      message: "Prompt exceeds length limit",
    });
  }

  // ==========================================
  // Validate Action
  // ==========================================

  const actionKey = VALID_ACTIONS.has(action)
    ? action
    : "askAI";

  try {
    // ==========================================
    // Firestore
    // ==========================================

    const db = admin.firestore();

    const userRef = db
      .collection("users")
      .doc(uid);

    // ==========================================
    // Atomic Usage Check + Increment
    // ==========================================

    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(userRef);

      const usage = snapshot.exists
        ? snapshot.data()?.usage || {}
        : {};

      const currentUsage = usage.totalRequests || 0;

      // Monthly limit reached
      if (currentUsage >= MONTHLY_LIMIT) {
        throw new Error("LIMIT_REACHED");
      }

      transaction.set(
        userRef,
        {
          usage: {
            totalRequests:
              admin.firestore.FieldValue.increment(1),

            [actionKey]:
              admin.firestore.FieldValue.increment(1),

            lastUsed:
              admin.firestore.FieldValue.serverTimestamp(),
          },
        },
        {
          merge: true,
        }
      );
    });

    // ==========================================
    // Generate AI Response
    // ==========================================

    const text = await generateAI(prompt);

    // ==========================================
    // Success
    // ==========================================

    return res.status(200).json({
      success: true,
      text,
    });

  } catch (error) {

    // ==========================================
    // Monthly Limit
    // ==========================================

    if (error.message === "LIMIT_REACHED") {
      return res.status(429).json({
        success: false,
        message: "Monthly AI limit reached (100 requests).",
      });
    }

    // ==========================================
    // Server Error
    // ==========================================

    console.error("========== AI ERROR ==========");
    console.error(error);
    console.error("==============================");

    return res.status(500).json({
      success: false,
      message: "AI request failed",
    });
  }
}

module.exports = {
  askAI,
};

