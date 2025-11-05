from flask import Flask, render_template
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


app = Flask(__name__)

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
	return render_template("generation.html", pokemon_list=pokemon_data, title="Generation 5 Pokémon", subtitle="All 105 Gen 5 Pokémon")

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
	return render_template("generation.html", pokemon_list=pokemon_data, title="Generation 7 Pokémon", subtitle="All 87 Gen 7 Pokémon")

@app.get("/gen8")
def gen8():
	# Fetch all Gen 8 Pokemon data
	pokemon_data = get_gen8_pokemon_data()
	# Render gen8 template with the pokemon data being passed into it from Flask, please read how Flask is handling this
	return render_template("generation.html", pokemon_list=pokemon_data, title="Generation 8 Pokémon", subtitle="All 189 Gen 8 Pokémon")

@app.get("/gen9")
def gen9():
	# Fetch all Gen 9 Pokemon data
	pokemon_data = get_gen9_pokemon_data()
	# Render gen9 template with the pokemon data being passed into it from Flask, please read how Flask is handling this
	return render_template("generation.html", pokemon_list=pokemon_data, title="Generation 9 Pokémon", subtitle="All 100 Gen 9 Pokémon")

# This is the API route! It will return a JSON response from our call. 502 is bad gateway. set the timeout to 15 seconds but can change as needed
@app.get("/api/pokemon/<string:name>")
def searchPokemon(name):
	pokemonData = get_pokemon(name)
	return pokemonData

if __name__ == "__main__":
	app.run(host="0.0.0.0", port=5001, debug=True)
