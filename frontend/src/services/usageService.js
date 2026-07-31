import { doc, setDoc, increment } from "firebase/firestore";
import { db } from "../firebase/config";

export async function trackAIUsage(uid, action) {
  try {
    if (!uid) return;

    const userRef = doc(db, "users", uid);

    // ১. usage অবজেক্টের ভেতর প্রাথমিক কাউন্টার সেট
    const usageData = {
      totalRequests: increment(1),
    };

    // ২. অ্যাকশন অনুযায়ী নির্দিষ্ট ফিল্ড বাড়ান
    switch (action) {
      case "Summarize":
        usageData.summarize = increment(1);
        break;

      case "Grammar":
        usageData.grammar = increment(1);
        break;

      case "Tasks":
        usageData.tasks = increment(1);
        break;

      case "Translate":
        usageData.translate = increment(1);
        break;

      case "Rewrite":
        usageData.rewrite = increment(1);
        break;

      case "Ask AI":
        usageData.askAI = increment(1);
        break;

      default:
        usageData.other = increment(1);
    }

    // ৩. setDoc + merge দিয়ে ফায়ারবেসে সেভ
    await setDoc(
      userRef,
      {
        usage: usageData,
      },
      { merge: true }
    );

    console.log("AI Usage Updated:", action);
  } catch (error) {
    console.error("Usage Tracking Error:", error);
  }
}