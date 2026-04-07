from flask import Flask, render_template


app = Flask(__name__)


@app.route("/")
def home():
    return render_template("home.html", active_page="home")


@app.route("/forge")
def forge():
    return render_template("forge.html", active_page="forge")


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
