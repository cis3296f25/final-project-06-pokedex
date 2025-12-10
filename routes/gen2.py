import requests
import json
import os

def fetch_gen2_pokemon_from_api():

    # This is the function that is fetching data directly from the PokeAPI, please only call this function if the JSON file doesn't exist or is having problems.
    # Think of this function from here on out as a helper function to the main function that is essentially just grabbing the data.
    # In short we will be using fetch_ from here on out as the helper function and get_ as the main function for retrieving data.

    pokemon_list = []
    base_url = "https://pokeapi.co/api/v2/pokemon"
    
    
    for pokemon_id in range(152, 252):  # Grab Gen 2 Pokemon
        try:
			# construct the url for call
            url = f"{base_url}/{pokemon_id}"
			# make the call, adding a timeout condition
            response = requests.get(url, timeout=15)
            
            # successfull call
            if response.status_code == 200:
                data = response.json()
                
                # Extract abilities
                abilities = []
                for ability in data.get('abilities', []):
                    abilities.append({
                        'name': ability['ability']['name'],
                        'is_hidden': ability['is_hidden'],
                        'slot': ability['slot']
                    })
                
                # Extract types
                types = [type_info['type']['name'] for type_info in data.get('types', [])]
                
                stats = []
                
                for stat in data.get('stats', []):
                    stats.append({
                        'name': stat['stat']['name'],
                        'base_stat': stat['base_stat'],
                        'effort': stat['effort']
                    })
                
                
                
                # Get image URLs
                sprites = data.get('sprites', {})
                images = {
                    'official_artwork': sprites.get('other', {}).get('official-artwork', {}).get('front_default'),
                    'front_default': sprites.get('front_default'),
                    'front_shiny': sprites.get('front_shiny')
                }
                
                # Create Pokemon data struct
                pokemon_data = {
                    'id': data['id'],
                    'name': data['name'].capitalize(), # capitalize the first letter
                    'abilities': abilities,  
                    'types': types,
                    'images': images,
                    'height': data['height'],
                    'weight': data['weight'],
                    'base_experience': data['base_experience'],
                    'stats': stats
                }
                
                # adding struct to the array of pokemon
                pokemon_list.append(pokemon_data)
				
				# print successful capture
                print(f"Fetched {pokemon_data['name']} (ID: {pokemon_id})")
                
            else:
				# debug failure
                print(f"Failed to fetch Pokemon ID {pokemon_id}")
                
        except requests.RequestException as e:
            print(f"Error fetching Pokemon ID {pokemon_id}: {e}")
            continue
    
    return pokemon_list

def get_gen2_pokemon_data(json_filename="pokeJsons/gen2output.json"):

    # Different function for grabbing data locally first, if it doesn't exist yet, it will call the API instead

    pokemon_data = None
    
    # Try to load from local JSON file first
    if os.path.exists(json_filename):
        try:
            # open the file and load data
            with open(json_filename, 'r') as f:
                pokemon_data = json.load(f)
                return pokemon_data
            
        # There is an error reading the JSON for whatever reason, it will call the PokeAPI as originally planned instead.    
        except (json.JSONDecodeError, IOError) as e:
            print(f"Error reading JSON file: {e}. Falling back to API...")
            pokemon_data = fetch_gen2_pokemon_from_api()
            return pokemon_data
    else:
        # JSON file doesn't exist, fetch from API
        print("JSON file not found. Calling PokeAPI")
        pokemon_data = fetch_gen2_pokemon_from_api()
        return pokemon_data
