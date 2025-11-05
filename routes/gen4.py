import requests
import json
import os

def fetch_gen4_pokemon_from_api():
    
    # This is the function that is fetching data directly from the PokeAPI, please only call this function if the JSON file doesn't exist or is having problems.
    # Think of this function from here on out as a helper function to the main function that is essentially just grabbing the data.
    # In short we will be using fetch_ from here on out as the helper function and get_ as the main function for retrieving data.
    
    pokemon_list = []
    base_url = "https://pokeapi.co/api/v2/pokemon"

    for pokemon_id in range(387, 494):  # Gen 4 IDs
        try:
            url = f"{base_url}/{pokemon_id}"
            response = requests.get(url, timeout=15)

            if response.status_code == 200:
                data = response.json()

                # Extract abilities
                abilities = [
                    {
                        'name': ability['ability']['name'],
                        'is_hidden': ability['is_hidden'],
                        'slot': ability['slot']
                    }
                    for ability in data.get('abilities', [])
                ]

                # Extract types
                types = [type_info['type']['name'] for type_info in data.get('types', [])]

                # Extract HP stat
                hp = 50  # Default fallback
                for stat in data.get('stats', []):
                    if stat['stat']['name'] == 'hp':
                        hp = stat['base_stat']
                        break

                # Get image URLs
                sprites = data.get('sprites', {})
                images = {
                    'official_artwork': sprites.get('other', {}).get('official-artwork', {}).get('front_default'),
                    'front_default': sprites.get('front_default'),
                    'front_shiny': sprites.get('front_shiny')
                }

                # Build Pokémon data
                pokemon_data = {
                    'id': data['id'],
                    'name': data['name'].capitalize(),
                    'abilities': abilities,
                    'types': types,
                    'images': images,
                    'height': data['height'],
                    'weight': data['weight'],
                    'base_experience': data['base_experience'],
                    'hp': hp
                }

                pokemon_list.append(pokemon_data)
                print(f"Fetched {pokemon_data['name']} (ID: {pokemon_id}) - HP: {hp}")
            else:
                print(f"Failed to fetch Pokémon ID {pokemon_id}")
        except requests.RequestException as e:
            print(f"Error fetching Pokémon ID {pokemon_id}: {e}")
            continue

    return pokemon_list


def save_to_json(pokemon_data, json_filename="pokeJsons/gen4output.json"):
    """Save Pokémon data to JSON file."""
    os.makedirs(os.path.dirname(json_filename), exist_ok=True)
    with open(json_filename, 'w') as f:
        json.dump(pokemon_data, f, indent=2)
    print(f"Saved {len(pokemon_data)} Pokémon to {json_filename}")


def get_gen4_pokemon_data(json_filename="pokeJsons/gen4output.json"):
    """Load Gen 4 Pokémon data from JSON, or fetch from API if needed."""
    if os.path.exists(json_filename):
        try:
            with open(json_filename, 'r') as f:
                pokemon_data = json.load(f)
                print(f"Loaded {len(pokemon_data)} Pokémon from {json_filename}")
                return pokemon_data
        except (json.JSONDecodeError, IOError) as e:
            print(f"Error reading JSON file: {e}. Falling back to API...")
            pokemon_data = fetch_gen4_pokemon_from_api()
            save_to_json(pokemon_data, json_filename)
            return pokemon_data
    else:
        print("JSON file not found. Fetching from PokeAPI...")
        pokemon_data = fetch_gen4_pokemon_from_api()
        save_to_json(pokemon_data, json_filename)
        return pokemon_data


def regenerate_json_file(json_filename="pokeJsons/gen4output.json"):
    """Force regenerate the JSON file with fresh data from PokeAPI."""
    print("Regenerating JSON file with fresh data from PokeAPI...")
    pokemon_data = fetch_gen4_pokemon_from_api()
    save_to_json(pokemon_data, json_filename)
    return pokemon_data


if __name__ == "__main__":
    regenerate_json_file()
