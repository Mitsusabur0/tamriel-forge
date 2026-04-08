const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("Missing OPENAI_API_KEY in environment.");
  process.exit(1);
}

const model = process.env.CHAT_MODEL || "gpt-5-nano";

const prompt = `You must reply with exactly two sections and nothing else.
<chat_response>Hello from the Tavern.</chat_response>
<character_summary>Name: Unknown
Race: Unknown</character_summary>`;

const response = await fetch("https://api.openai.com/v1/responses", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model,
    input: [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: "Reply with the required Tavern format.",
      },
    ],
    max_output_tokens: 200,
    store: false,
  }),
});

const data = await response.json();
const outputText =
  data.output_text ||
  (data.output || [])
    .flatMap((item) => item.content || [])
    .filter((item) => item.type === "output_text")
    .map((item) => item.text || "")
    .join("");

const getSection = (text, openTag, closeTag) => {
  const start = text.indexOf(openTag);
  const end = text.indexOf(closeTag);
  if (start === -1 || end === -1 || end < start) {
    return "";
  }
  return text.slice(start + openTag.length, end).trim();
};

console.log("HTTP status:", response.status);
console.log("Response summary:", {
  id: data.id,
  model: data.model,
  status: data.status,
  outputItems: (data.output || []).map((item) => ({
    type: item.type,
    role: item.role,
    contentTypes: (item.content || []).map((content) => content.type),
  })),
});
console.log("Raw output text:");
console.log(outputText || "<empty>");
console.log("Parsed chat_response:");
console.log(getSection(outputText, "<chat_response>", "</chat_response>") || "<missing>");
console.log("Parsed character_summary:");
console.log(getSection(outputText, "<character_summary>", "</character_summary>") || "<missing>");
