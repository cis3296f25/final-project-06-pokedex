import requests
import json
import os

def fetch_gen6_pokemon_from_api():

    # This is the function that is fetching data directly from the PokeAPI, please only call this function if the JSON file doesn't exist or is having problems.
    # Think of this function from here on out as a helper function to the main function that is essentially just grabbing the data.
    # In short we will be using fetch_ from here on out as the helper function and get_ as the main function for retrieving data.
    
    pokemon_list = []
    base_url = "https://pokeapi.co/api/v2/pokemon"

    for pokemon_id in range(650, 722):  # Gen 6 IDs
        try:
            url = f"{base_url}/{pokemon_id}"
            response = requests.get(url, timeout=15)

            if response.status_code == 200:
                data = response.json()
                abilities = [{'name': ab['ability']['name'], 'is_hidden': ab['is_hidden'], 'slot': ab['slot']} for ab in data.get('abilities', [])]
                types = [t['type']['name'] for t in data.get('types', [])]

                hp = 50
                for stat in data.get('stats', []):
                    if stat['stat']['name'] == 'hp':
                        hp = stat['base_stat']
                        break

                sprites = data.get('sprites', {})
                images = {
                    'official_artwork': sprites.get('other', {}).get('official-artwork', {}).get('front_default'),
                    'front_default': sprites.get('front_default'),
                    'front_shiny': sprites.get('front_shiny')
                }

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


def save_to_json(pokemon_data, json_filename="pokeJsons/gen6output.json"):
    os.makedirs(os.path.dirname(json_filename), exist_ok=True)
    with open(json_filename, 'w') as f:
        json.dump(pokemon_data, f, indent=2)
    print(f"Saved {len(pokemon_data)} Pokémon to {json_filename}")


def get_gen6_pokemon_data(json_filename="pokeJsons/gen6output.json"):
    if os.path.exists(json_filename):
        try:
            with open(json_filename, 'r') as f:
                data = json.load(f)
                print(f"Loaded {len(data)} Pokémon from {json_filename}")
                return data
        except (json.JSONDecodeError, IOError) as e:
            print(f"Error reading JSON file: {e}. Fetching from API...")
            data = fetch_gen6_pokemon_from_api()
            save_to_json(data, json_filename)
            return data
    else:
        print("JSON file not found. Fetching from PokeAPI...")
        data = fetch_gen6_pokemon_from_api()
        save_to_json(data, json_filename)
        return data


def regenerate_json_file(json_filename="pokeJsons/gen6output.json"):
    print("Regenerating JSON file with fresh data from PokeAPI...")
    data = fetch_gen6_pokemon_from_api()
    save_to_json(data, json_filename)
    return data


if __name__ == "__main__":
    regenerate_json_file()
