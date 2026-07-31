export async function askBackendAI(prompt) {
  try {
    const response = await fetch("http://localhost:5000/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error("AI request failed");
    }

    return data.text;

  } catch (error) {
    console.error("Backend AI Error:", error);
    throw error;
  }
}