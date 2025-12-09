import json
from flask import Flask, jsonify, render_template, request, redirect, session
from werkzeug.security import generate_password_hash, check_password_hash
from routes.gen1 import get_gen1_pokemon_data
from routes.index import get_pokemon
from routes.gen2 import get_gen2_pokemon_data 
from routes.gen3 import get_gen3_pokemon_data
from routes.gen4 import get_gen4_pokemon_data
from routes.gen5 import get_gen5_pokemon_data
from routes.gen6 import get_gen6_pokemon_data
from routes.gen7 import get_gen7_pokemon_data
from routes.gen8 import get_gen8_pokemon_data
from routes.gen9 import get_gen9_pokemon_data
import sqlite3


app = Flask(__name__)
app.secret_key = "secret-key-tochange"

# Connects to database
def db():
	return sqlite3.connect("users.db", check_same_thread=False)

# Creates database tables for users and saved-teams
def init_db():
	conn = sqlite3.connect("users.db")
	conn.execute("""
		CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			first_name TEXT,
			last_name TEXT,
			email CHAR UNIQUE,
			password CHAR
		)
	""")
	conn.execute("""
		CREATE TABLE IF NOT EXISTS teams (
			  team_id INTEGER PRIMARY KEY AUTOINCREMENT,
			  user_id INTEGER,
			  name TEXT,
			  members TEXT,
			  FOREIGN KEY (user_id) REFERENCES users(id)
			)
		""")
	conn.commit()
	conn.close()

# Returns users' email if logged into session
def current_user():
	return session.get("email")

# Root route! It will render the index.html template that we've created!
@app.get("/")
def index():
	return render_template("index.html")

# Gen 1 route! It will render the gen1.html template with all 151 Pokemon,
@app.get("/gen1")
def gen1():
	# Fetch all Gen 1 Pokemon data
	pokemon_data = get_gen1_pokemon_data()
	# Render gen1 template with the pokemon data being passed into it from Flask, please read how Flask is handling this
	return render_template("generation.html", pokemon_list=pokemon_data, title="Generation 1 Pokémon", subtitle="All 151 Original Pokémon")

@app.get("/gen2")
def gen2():
	# Fetch all Gen 2 Pokemon data
	pokemon_data = get_gen2_pokemon_data()
	# Render gen2 template with the pokemon data being passed into it from Flask, please read how Flask is handling this
	return render_template("generation.html", pokemon_list=pokemon_data, title="Generation 2 Pokémon", subtitle="All 100 Gen 2 Pokémon")

@app.get("/gen3")
def gen3():
	# Fetch all Gen 3 Pokemon data
	pokemon_data = get_gen3_pokemon_data()
	# Render gen3 template with the pokemon data being passed into it from Flask, please read how Flask is handling this
	return render_template("generation.html", pokemon_list=pokemon_data, title="Generation 3 Pokémon", subtitle="All 135 Gen 3 Pokémon")

@app.get("/gen4")
def gen4():
	# Fetch all Gen 4 Pokemon data
	pokemon_data = get_gen4_pokemon_data()
	# Render gen4 template with the pokemon data being passed into it from Flask, please read how Flask is handling this
	return render_template("generation.html", pokemon_list=pokemon_data, title="Generation 4 Pokémon", subtitle="All 107 Gen 4 Pokémon")

@app.get("/gen5")
def gen5():
	# Fetch all Gen 5 Pokemon data
	pokemon_data = get_gen5_pokemon_data()
	# Render gen5 template with the pokemon data being passed into it from Flask, please read how Flask is handling this
	return render_template("generation.html", pokemon_list=pokemon_data, title="Generation 5 Pokémon", subtitle="All 156 Gen 5 Pokémon")

@app.get("/gen6")
def gen6():
	# Fetch all Gen 6 Pokemon data
	pokemon_data = get_gen6_pokemon_data()
	# Render gen6 template with the pokemon data being passed into it from Flask, please read how Flask is handling this
	return render_template("generation.html", pokemon_list=pokemon_data, title="Generation 6 Pokémon", subtitle="All 72 Gen 6 Pokémon")

@app.get("/gen7")
def gen7():
	# Fetch all Gen 7 Pokemon data
	pokemon_data = get_gen7_pokemon_data()
	# Render gen7 template with the pokemon data being passed into it from Flask, please read how Flask is handling this
	return render_template("generation.html", pokemon_list=pokemon_data, title="Generation 7 Pokémon", subtitle="All 88 Gen 7 Pokémon")

@app.get("/gen8")
def gen8():
	# Fetch all Gen 8 Pokemon data
	pokemon_data = get_gen8_pokemon_data()
	# Render gen8 template with the pokemon data being passed into it from Flask, please read how Flask is handling this
	return render_template("generation.html", pokemon_list=pokemon_data, title="Generation 8 Pokémon", subtitle="All 96 Gen 8 Pokémon")


@app.get("/gen9")
def gen9():
    # Fetch all Gen 9 Pokemon data
    pokemon_data = get_gen9_pokemon_data()
    # Render gen9 template with the pokemon data being passed into it from Flask, please read how Flask is handling this
    return render_template("generation.html", pokemon_list=pokemon_data, title="Generation 9 Pokémon", subtitle="All 120 Gen 9 Pokémon")

# Team Builder page
@app.get("/team")
def team():
    return render_template("team.html", title="Team Builder")

# Account page
@app.get("/account")
def account(): 
	# Redirects to login page if not logged-in
	if "email" not in session:
		return redirect("/login")
	return render_template("account.html", title="Account Information", user=session.get("first_name"), email=session.get("email"), ln = session.get("last_name"))

# Initial Login page
@app.get("/login")
def login_page():
    return render_template("account.html", user=None)

# Login verification
@app.post("/login")
def login():
	email = request.form.get("email")
	password = request.form.get("password")
	conn = db()
	data = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
	conn.close()

	if not data:
		return render_template("account.html", error="Account does not exist.", data=None)
	if not check_password_hash(data[4], password):
		return render_template("account.html", error="Incorrect password", data=None)
	
	session["user_id"] = data[0]
	session["email"] = data[3]
	session["first_name"] = data[1]
	session["last_name"] = data[2]
	return render_template("account.html", user=session["first_name"], email=session["email"])

# Create account page
@app.route("/signup", methods=['GET', 'POST'])
def signup():
	if request.method == "GET":
		return render_template("signup.html")
	
	first_name = request.form.get("first_name")
	last_name = request.form.get("last_name")
	email = request.form.get("email")
	password = request.form.get("password")
	password2 = request.form.get("password2")
	if password != password2:
		return render_template("signup.html", error="Passwords do not match")

	hashed_pw = generate_password_hash(password)

	try:
		conn = db()
		conn.execute("INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)", (first_name, last_name, email, hashed_pw))
		conn.commit()
		conn.close()
	except:
		return render_template("account.html", error="Email already exists.", user=None)
	
	session["email"] = email
	session["first_name"] = first_name
	session["last_name"] = last_name
	return redirect("/account")

# Logout function
@app.get("/logout")
def logout():
	session.clear()
	return redirect("/account")

# Save team to account
@app.post("/team/save")
def save_team():
	if "user_id" not in session:
		return {"error": "Not logged in"}, 401
	
	user_id = session["user_id"]
	data = request.get_json()
	if not data:
		return {"error": "No data provided"}, 400
	name = data.get("name", "Untitled Team")
	members = json.dumps(data.get("members", []))
	conn = db()
	conn.execute("INSERT INTO teams (user_id, name, members) VALUES (?, ?, ?)",(user_id, name, members)
	)
	print("Saved team")
	conn.commit()
	conn.close()
	return jsonify({"success": True})

# Loads previously saved team on teambuilder page
@app.get("/team/load")
def load_team():
	if "user_id" not in session:
		return jsonify({"members": []})
	
	user_id = session["user_id"]
	conn = db()
	team = conn.execute("SELECT name, members FROM teams WHERE user_id = ? ORDER BY team_id DESC LIMIT 1", (user_id,)).fetchone()
	conn.close()

	if not team:
		return jsonify({"members": []})
	return jsonify({
		"name": team[0],
		"members": json.loads(team[1])
	})

# Delivers teams' data to Account page
@app.get("/account/teams")
def account_teams():
	email = session.get("email")
	if not email:
		return jsonify([])
	conn = db()
	data = conn.execute("""
					 SELECT teams.team_id, teams.name, teams.members FROM teams JOIN users ON teams.user_id = users.id WHERE users.email = ? ORDER BY teams.team_id""",(email,)).fetchall()
	conn.close()
	teams = []
	for row in data:
		team_id = row[0]
		team_name = row[1]
		members_raw = row[2]
		try:
			members = json.loads(members_raw or "[]")
		except json.JSONDecodeError:
			members = []
		teams.append({
			"team_id": team_id,
			"name": team_name,
			"members": members
		})
	return jsonify(teams)

# Delete saved team from account
@app.route("/account/teams/<int:team_id>", methods=["DELETE"])
def delete_team(team_id):
	user_id = session["user_id"]
	conn = db()
	cursor = conn.cursor()
	cursor.execute(
		"DELETE FROM teams WHERE team_id = ? AND user_id = ?", (team_id, user_id))
	conn.commit()
	rowcount = cursor.rowcount
	conn.close()
	if rowcount == 0:
		return jsonify({"success": False, "error": "Team not found"}), 404
	return jsonify({"success": True})


# This is the API route! It will return a JSON response from our call. 502 is bad gateway. set the timeout to 15 seconds but can change as needed
@app.get("/api/pokemon/<string:name>")
def searchPokemon(name):
    if name.isdigit():
        name = str(int(name))  # changing integer to a string will remove leading zeroes    
    pokemonData = get_pokemon(name)
    return pokemonData


if __name__ == "__main__":
	init_db()
	app.run(host="0.0.0.0", port=5001, debug=True)