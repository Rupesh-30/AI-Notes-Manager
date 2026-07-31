export async function askBackendAI(prompt) {
  try {
    const response = await fetch("https://ai-notes-manager-8eu7.onrender.com/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "AI request failed");
    }

    return data.text;
  } catch (error) {
    console.error("Backend AI Error:", error);
    throw error;
  }
}