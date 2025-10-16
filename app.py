from flask import Flask, jsonify, render_template
import requests


app = Flask(__name__)


# Root route! It will render the index.html template that we've created!
@app.get("/")
def index():

	return render_template("index.html")


# This is the API route! It will return a JSON response from our call. 502 is bad gateway. set the timeout to 15 seconds but can change as needed
@app.get("/api/pokemon/<string:name>")
def get_pokemon(name: str):

	url = f"https://pokeapi.co/api/v2/pokemon/{name.lower()}"
	try:
		# try to get a response
		resp = requests.get(url, timeout=15)
	except requests.RequestException:
		return jsonify({"error": "Upstream request failed"}), 502

	# possible error if bad name or somthing like that, 404 is not found.
	if resp.status_code != 200:
		return jsonify({"error": "Pokémon not found"}), 404

	# store our response as a json object.
	data = resp.json()

	# dictionary to analyze our response returned from the API call.
	result = {
		"id": data.get("id"),
		"name": data.get("name"),
		"abilities": [],
		"types": []
	}
	
	# iterate abilities
	abilities_data = data.get("abilities") or []
	for ability in abilities_data:
		ability_info = {
			"name": (ability.get("ability") or {}).get("name"),
			"is_hidden": ability.get("is_hidden"),
			"slot": ability.get("slot"),
		}
		result["abilities"].append(ability_info)
	
	# iterate types
	types_data = data.get("types") or []
	for type_info in types_data:
		type_name = (type_info.get("type") or {}).get("name")
		result["types"].append(type_name)

	# return the result as a json object.
	return jsonify(result)


if __name__ == "__main__":

	app.run(host="0.0.0.0", port=5000, debug=True)


