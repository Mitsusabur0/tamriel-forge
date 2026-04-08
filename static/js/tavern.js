(function () {
    const stage = document.querySelector(".tavern-stage");
    if (!stage) {
        return;
    }

    const transcript = stage.querySelector("[data-chat-transcript]");
    const summaryContainer = stage.querySelector("[data-character-summary]");
    const statusNode = stage.querySelector("[data-chat-status]");
    const form = stage.querySelector("[data-chat-form]");
    const textarea = stage.querySelector("#tavern-message");
    const sendButton = stage.querySelector("[data-send-button]");
    const resetButton = stage.querySelector("[data-reset-chat]");
    const chatEndpoint = stage.dataset.chatEndpoint;

    const STORAGE_KEYS = {
        history: "tamrielforge:tavern-history",
        summary: "tamrielforge:tavern-summary",
    };

    const defaultSummary = [
        "Name: Unknown",
        "Race: Unknown",
        "Gender: Unknown",
        "Homeland: Unknown",
        "Archetype: Unknown",
        "Combat Style: Unknown",
        "Personality: Unknown",
        "Motivation: Unknown",
        "Core Conflict: Unknown",
        "Faction / Faith: Unknown",
        "Moral Code: Unknown",
        "Visual Notes: Unknown",
        "Relationships: Unknown",
        "Open Questions: Name, race, homeland, motivation, and central conflict.",
    ].join("\n");

    const starterMessage = "The hearth is warm, the ledger is open, and the room is listening. Tell me who has come through the door, and what burden or ambition brought them here.";

    let history = loadHistory();
    let summary = sessionStorage.getItem(STORAGE_KEYS.summary) || defaultSummary;
    let isSending = false;

    sessionStorage.setItem(STORAGE_KEYS.summary, summary);

    renderConversation();
    renderSummary(summary);
    setStatus(history.length ? "Session restored from this browser tab." : "Ready for the first answer.");

    textarea.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            form.requestSubmit();
        }
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (isSending) {
            return;
        }

        const message = textarea.value.trim();
        if (!message) {
            return;
        }

        const userMessage = { role: "user", content: message };
        history.push(userMessage);
        saveHistory();
        appendMessage(userMessage);

        textarea.value = "";
        textarea.style.height = "";

        const assistantMessage = createMessageElement("assistant", "");
        transcript.appendChild(assistantMessage);
        scrollTranscript();

        isSending = true;
        sendButton.disabled = true;
        textarea.disabled = true;
        resetButton.disabled = true;
        setStatus("The innkeeper is thinking...");

        try {
            const response = await fetch(chatEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message,
                    history: history.slice(0, -1),
                    summary,
                }),
            });

            const payload = await safeJson(response);

            if (!response.ok) {
                throw new Error(payload?.error || "The tavern could not answer right now.");
            }

            const fullAssistantText = payload?.message || "";
            const nextSummary = payload?.summary || summary;

            if (!fullAssistantText.trim()) {
                throw new Error("The tavern returned an empty reply.");
            }

            assistantMessage.querySelector(".tavern-message-body").textContent = fullAssistantText;
            summary = nextSummary;
            sessionStorage.setItem(STORAGE_KEYS.summary, summary);
            renderSummary(summary);
            history.push({ role: "assistant", content: fullAssistantText.trim() });
            saveHistory();
            setStatus("Reply received. Continue shaping the character.");
        } catch (error) {
            assistantMessage.classList.add("error");
            assistantMessage.querySelector(".tavern-message-body").textContent =
                error instanceof Error ? error.message : "The tavern could not answer right now.";
            setStatus("There was a problem reaching the tavern.");
        } finally {
            isSending = false;
            sendButton.disabled = false;
            textarea.disabled = false;
            resetButton.disabled = false;
            textarea.focus();
        }
    });

    resetButton.addEventListener("click", () => {
        history = [];
        summary = defaultSummary;
        sessionStorage.removeItem(STORAGE_KEYS.history);
        sessionStorage.setItem(STORAGE_KEYS.summary, summary);
        renderConversation();
        renderSummary(summary);
        setStatus("A fresh page in the ledger is ready.");
        textarea.value = "";
        textarea.focus();
    });

    function renderConversation() {
        transcript.innerHTML = "";
        transcript.appendChild(createMessageElement("assistant", starterMessage, true));
        history.forEach(appendMessage);
        scrollTranscript();
    }

    function appendMessage(message) {
        transcript.appendChild(createMessageElement(message.role, message.content));
        scrollTranscript();
    }

    function createMessageElement(role, content, isStarter = false) {
        const article = document.createElement("article");
        article.className = `tavern-message ${role === "user" ? "user" : "assistant"}`;

        const meta = document.createElement("div");
        meta.className = "tavern-message-meta";
        meta.textContent = role === "user" ? "You" : isStarter ? "Innkeeper" : "Tavern Guide";

        const body = document.createElement("div");
        body.className = "tavern-message-body";
        body.textContent = content;

        article.append(meta, body);
        return article;
    }

    function renderSummary(summaryText) {
        summaryContainer.innerHTML = "";
        const lines = summaryText
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean);

        const columns = document.createElement("div");
        columns.className = "tavern-summary-columns";
        const midpoint = Math.ceil(lines.length / 2);

        [lines.slice(0, midpoint), lines.slice(midpoint)].forEach((group) => {
            const list = document.createElement("dl");
            list.className = "tavern-summary-list";

            group.forEach((line) => {
                const row = document.createElement("div");
                row.className = "tavern-summary-row";

                const separatorIndex = line.indexOf(":");
                const label = separatorIndex === -1 ? "Note" : line.slice(0, separatorIndex).trim();
                const value = separatorIndex === -1 ? line : line.slice(separatorIndex + 1).trim();

                const term = document.createElement("dt");
                term.textContent = label;

                const description = document.createElement("dd");
                description.textContent = value || "Unknown";

                row.append(term, description);
                list.appendChild(row);
            });

            columns.appendChild(list);
        });

        summaryContainer.appendChild(columns);
    }

    function loadHistory() {
        try {
            const raw = sessionStorage.getItem(STORAGE_KEYS.history);
            if (!raw) {
                return [];
            }

            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) {
                return [];
            }

            return parsed.filter((item) => item && typeof item.content === "string" && typeof item.role === "string");
        } catch {
            return [];
        }
    }

    function saveHistory() {
        sessionStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
    }

    async function safeJson(response) {
        try {
            return await response.json();
        } catch {
            return null;
        }
    }

    function setStatus(text) {
        statusNode.textContent = text;
    }

    function scrollTranscript() {
        transcript.scrollTop = transcript.scrollHeight;
    }
})();
