import os

from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request
from openai import OpenAI

from all_system_prompts import chat_sys_prompt
from config import CHAT_MODEL


load_dotenv()

app = Flask(__name__)


CHAT_OPEN_TAG = "<chat_response>"
CHAT_CLOSE_TAG = "</chat_response>"
SUMMARY_OPEN_TAG = "<character_summary>"
SUMMARY_CLOSE_TAG = "</character_summary>"


def build_chat_input(history: list[dict[str, str]], latest_message: str, current_summary: str) -> list[dict[str, str]]:
    sanitized_history = []

    for item in history:
        role = item.get("role", "").strip().lower()
        content = item.get("content", "").strip()
        if role not in {"user", "assistant"} or not content:
            continue
        sanitized_history.append({"role": role, "content": content})

    if current_summary.strip():
        sanitized_history.append(
            {
                "role": "system",
                "content": (
                    "Current tavern ledger for continuity. Use it only as a summary of established facts "
                    "and update it if the user changes anything.\n\n"
                    f"{current_summary.strip()}"
                ),
            }
        )

    sanitized_history.append({"role": "user", "content": latest_message.strip()})
    return [{"role": "system", "content": chat_sys_prompt}, *sanitized_history]


def extract_tagged_sections(content: str) -> tuple[str, str]:
    chat_text = extract_section(content, CHAT_OPEN_TAG, CHAT_CLOSE_TAG)
    summary_text = extract_section(content, SUMMARY_OPEN_TAG, SUMMARY_CLOSE_TAG)
    return chat_text, summary_text


def extract_section(content: str, open_tag: str, close_tag: str) -> str:
    start_index = content.find(open_tag)
    end_index = content.find(close_tag)

    if start_index == -1 or end_index == -1 or end_index < start_index:
        return ""

    start_index += len(open_tag)
    return content[start_index:end_index].strip()


def get_response_text(response) -> str:
    direct_text = getattr(response, "output_text", "") or ""
    if direct_text.strip():
        return direct_text

    chunks = []
    for item in getattr(response, "output", []) or []:
        if getattr(item, "type", "") != "message":
            continue
        for content in getattr(item, "content", []) or []:
            if getattr(content, "type", "") == "output_text":
                chunks.append(getattr(content, "text", ""))

    return "".join(chunks).strip()


def summarize_response_for_logs(response) -> dict:
    output_items = []

    for item in getattr(response, "output", []) or []:
        output_items.append(
            {
                "type": getattr(item, "type", None),
                "role": getattr(item, "role", None),
                "content_types": [getattr(content, "type", None) for content in getattr(item, "content", []) or []],
            }
        )

    return {
        "id": getattr(response, "id", None),
        "model": getattr(response, "model", None),
        "status": getattr(response, "status", None),
        "incomplete_details": getattr(response, "incomplete_details", None),
        "output_text_length": len(getattr(response, "output_text", "") or ""),
        "usage": getattr(response, "usage", None),
        "output_items": output_items,
    }


@app.route("/")
def home():
    return render_template("home.html", active_page="home")


@app.route("/forge")
def forge():
    return render_template("forge.html", active_page="forge")


@app.route("/api/tavern/chat", methods=["POST"])
def tavern_chat():
    payload = request.get_json(silent=True) or {}
    message = (payload.get("message") or "").strip()
    history = payload.get("history") or []
    current_summary = payload.get("summary") or ""

    if not message:
        return jsonify({"error": "Message is required."}), 400

    if not os.getenv("OPENAI_API_KEY"):
        return jsonify({"error": "OPENAI_API_KEY is not configured."}), 500

    if not isinstance(history, list):
        return jsonify({"error": "History must be a list."}), 400

    client = OpenAI()
    model_input = build_chat_input(history=history, latest_message=message, current_summary=current_summary)

    try:
        response = client.responses.create(
            model=CHAT_MODEL,
            input=model_input,
            store=False,
            reasoning={"effort": "minimal"},
            max_output_tokens=1200,
        )
        app.logger.info("Tavern OpenAI response summary: %s", summarize_response_for_logs(response))

        content = get_response_text(response)
        chat_text, summary_text = extract_tagged_sections(content)

        if not chat_text:
            if getattr(response, "status", None) == "incomplete":
                app.logger.warning("Tavern response incomplete details: %s", getattr(response, "incomplete_details", None))
                return jsonify(
                    {
                        "error": "The Tavern ran out of output tokens before producing a visible reply. Try again after increasing the token budget or reducing reasoning effort."
                    }
                ), 502
            app.logger.warning("Tavern raw response text without parsed chat section: %r", content)
            return jsonify({"error": "The Tavern returned an empty chat response."}), 502

        return jsonify(
            {
                "message": chat_text,
                "summary": summary_text or current_summary,
            }
        )
    except Exception as exc:
        return jsonify({"error": f"Chat request failed: {exc}"}), 500


@app.route("/backstory")
def backstory():
    return render_template("backstory.html", active_page="backstory")


@app.route("/portrait")
def portrait():
    return render_template("portrait.html", active_page="portrait")


@app.route("/voice")
def voice():
    return render_template("voice.html", active_page="voice")


@app.route("/lore-atlas")
def lore_atlas():
    return render_template("lore_atlas.html", active_page="lore_atlas")


if __name__ == "__main__":
    app.run(debug=True)
