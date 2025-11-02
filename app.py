from flask import Flask, jsonify, render_template
import requests

app = Flask(__name__)

type_color_map = {
    "normal": [168, 168, 120],
    "fire": [240, 128, 48],
    "water": [104, 144, 240],
    "electric": [248, 208, 48],
    "grass": [120, 200, 80],
    "ice": [152, 216, 216],
    "fighting": [192, 48, 40],
    "poison": [160, 64, 160],
    "ground": [224, 192, 104],
    "flying": [168, 144, 240],
    "psychic": [248, 88, 136],
    "bug": [168, 184, 32],
    "rock": [184, 160, 56],
    "ghost": [112, 88, 152],
    "dragon": [112, 56, 248],
    "dark": [112, 88, 72],
    "steel": [184, 184, 208],
    "fairy": [238, 153, 172],
}


def get_gen1_pokemon_data():
    """Fetch data for the first 151 Pokémon."""
    pokemon_list = []
    base_url = "https://pokeapi.co/api/v2/pokemon"
    for pokemon_id in range(1, 152):
        try:
            url = f"{base_url}/{pokemon_id}"
            response = requests.get(url, timeout=15)
            if response.status_code == 200:
                data = response.json()

                # Abilities
                abilities = [
                    {
                        "name": ability["ability"]["name"],
                        "is_hidden": ability["is_hidden"],
                        "slot": ability["slot"],
                    }
                    for ability in data.get("abilities", [])
                ]

                # Types
                types = [t["type"]["name"] for t in data.get("types", [])]

                # Sprites
                sprites = data.get("sprites", {})
                images = {
                    "official_artwork": sprites.get("other", {})
                    .get("official-artwork", {})
                    .get("front_default"),
                    "front_default": sprites.get("front_default"),
                    "front_shiny": sprites.get("front_shiny"),
                }

                # Stats
                stats = [
                    {
                        "base_stat": s["base_stat"],
                        "stat": {"name": s["stat"]["name"]}
                    }
                    for s in data.get("stats", [])
                ]

                pokemon_data = {
                    "id": data["id"],
                    "name": data["name"].capitalize(),
                    "abilities": abilities,
                    "types": types,
                    "images": images,
                    "height": data["height"],
                    "weight": data["weight"],
                    "base_experience": data["base_experience"],
                    "stats": stats,
                }
                pokemon_list.append(pokemon_data)
                print(f"Fetched {pokemon_data['name']} (ID: {pokemon_id})")
            else:
                print(f"Failed to fetch Pokemon ID {pokemon_id}")
        except requests.RequestException as e:
            print(f"Error fetching Pokemon ID {pokemon_id}: {e}")
            continue
    return pokemon_list


@app.get("/")
def index():
    return render_template("index.html")


@app.get("/gen1")
def gen1():
    pokemon_data = get_gen1_pokemon_data()
    return render_template(
        "gen1.html", pokemon_list=pokemon_data, type_color_map=type_color_map
    )


@app.get("/api/pokemon/<string:name>")
def get_pokemon(name: str):
    url = f"https://pokeapi.co/api/v2/pokemon/{name.lower()}"
    try:
        resp = requests.get(url, timeout=15)
    except requests.RequestException:
        return jsonify({"error": "Upstream request failed"}), 502
    if resp.status_code != 200:
        return jsonify({"error": "Pokémon not found"}), 404

    data = resp.json()

    result = {
        "id": data.get("id"),
        "name": data.get("name"),
        "abilities": [],
        "types": [],
        "stats": [],
        "images": {},
        "height": data.get("height"),
        "weight": data.get("weight"),
        "base_experience": data.get("base_experience"),
    }

    # Abilities
    for ability in data.get("abilities", []):
        result["abilities"].append({
            "name": (ability.get("ability") or {}).get("name"),
            "is_hidden": ability.get("is_hidden"),
            "slot": ability.get("slot"),
        })

    # Types
    for type_info in data.get("types", []):
        result["types"].append((type_info.get("type") or {}).get("name"))

    # Stats
    for stat_info in data.get("stats", []):
        result["stats"].append({
            "base_stat": stat_info.get("base_stat"),
            "stat": {"name": (stat_info.get("stat") or {}).get("name")}
        })

    # Images
    sprites = data.get("sprites", {})
    result["images"] = {
        "official_artwork": sprites.get("other", {})
        .get("official-artwork", {})
        .get("front_default"),
        "front_default": sprites.get("front_default"),
        "front_shiny": sprites.get("front_shiny"),
    }

    return jsonify(result)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
