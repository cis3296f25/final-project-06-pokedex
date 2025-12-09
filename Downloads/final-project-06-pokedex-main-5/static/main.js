(() => {
	const form = document.getElementById("search-form");
	const input = document.getElementById("name-input");
	const errorEl = document.getElementById("error");
	const resultEl = document.getElementById("result");
	const cardTemplate = document.getElementById("card-template");

	const typeBorderColors = {
		normal: '#A8A878',
		fire: '#F08030',
		water: '#6890F0',
		electric: '#F8D030',
		grass: '#78C850',
		ice: '#98D8D8',
		fighting: '#C03028',
		poison: '#A040A0',
		ground: '#E0C068',
		flying: '#A890F0',
		psychic: '#F85888',
		bug: '#A8B820',
		rock: '#B8A038',
		ghost: '#705898',
		dragon: '#7038F8',
		dark: '#705848',
		steel: '#B8B8D0',
		fairy: '#EE99AC'
	};

	function showError(message) {
		errorEl.textContent = message;
		errorEl.classList.remove("hidden");
		resultEl.classList.add("hidden");
	}

	function clearError() {
		errorEl.classList.add("hidden");
		errorEl.textContent = "";
	}

	function renderResult(data) {
		const cardClone = cardTemplate.content.cloneNode(true);
		const card = cardClone.querySelector('.pokemon-card');
		const mainType = data.types?.[0]?.toLowerCase() || 'normal';
		card.setAttribute('data-main-type', mainType);
		card.style.borderColor = typeBorderColors[mainType] || '#ffd700';

		card.querySelector('.pokemon-name').textContent = data.name || "Unknown";
		const hp = data.hp || (data.id || 1) * 10;
		card.querySelector('.pokemon-hp').innerHTML = `${hp} <span>HP</span>`;
		const formattedId = String(data.id || 0).padStart(3, '0');
		card.querySelector('.pokemon-id-badge').textContent = `#${formattedId}`;

		const imgEl = card.querySelector('.card-image-container img');
		let imageUrl = data.images?.official_artwork ||
			data.images?.front_default ||
			data.sprites?.other?.['official-artwork']?.front_default ||
			data.sprites?.front_default ||
			`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`;
		imgEl.src = imageUrl;
		imgEl.alt = data.name || "Pokemon";
		imgEl.onerror = function () {
			this.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`;
		};

		const typesContainer = card.querySelector('.pokemon-types');
		typesContainer.innerHTML = '';
		data.types?.forEach(type => {
			const typeSpan = document.createElement('span');
			typeSpan.className = `type ${type.toLowerCase()}`;
			typeSpan.textContent = type.charAt(0).toUpperCase() + type.slice(1);
			typesContainer.appendChild(typeSpan);
		});

		const abilitiesContainer = card.querySelector('.ability-list');
		abilitiesContainer.innerHTML = '';
		data.abilities?.forEach(ability => {
			const abilityItem = document.createElement('div');
			abilityItem.className = 'ability-item';
			abilityItem.innerHTML = `
				<div class="ability-icon">⭐</div>
				<span class="ability-name">${ability.name}</span>
				${ability.is_hidden ? '<span class="ability-hidden">Hidden</span>' : ''}
			`;
			abilitiesContainer.appendChild(abilityItem);
		});

		// Make the card clickable
		card.classList.add('clickable-pokemon');
		card.setAttribute('data-pokemon-id', data.id);
		card.style.cursor = 'pointer';
		card.addEventListener('click', function() {
			showPokemonModal(data.id);
		});

		resultEl.innerHTML = '';
		resultEl.appendChild(cardClone);
		resultEl.classList.remove("hidden");
	}

	// Modal functionality
	const modal = document.getElementById('pokemon-modal-overlay');
	const closeBtn = document.getElementById('modal-close');
	const viewMoreBtn = document.getElementById('btn-view-more');
	
	if (modal && closeBtn && viewMoreBtn) {
		closeBtn.addEventListener('click', closePokemonModal);
		viewMoreBtn.addEventListener('click', closePokemonModal);
		modal.addEventListener('click', function(e) {
			if (e.target === modal) {
				closePokemonModal();
			}
		});
	}

	function showPokemonModal(pokemonId) {
		modal.classList.add('active');
		document.body.style.overflow = 'hidden';
		
		// Fetch Pokemon details
		fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}/`)
			.then(response => response.json())
			.then(pokemon => {
				populateModal(pokemon);
				
				// Fetch species data for description
				return fetch(pokemon.species.url);
			})
			.then(response => response.json())
			.then(species => {
				updateModalDescription(species);
			})
			.catch(error => {
				console.error('Error fetching Pokemon data:', error);
				document.getElementById('modal-pokedex-entry').textContent = 'Failed to load Pokemon information.';
			});
	}

	function closePokemonModal() {
		modal.classList.remove('active');
		document.body.style.overflow = '';
	}

	function populateModal(pokemon) {
		// Basic info
		document.getElementById('modal-poke-id').textContent = `#${String(pokemon.id).padStart(3, '0')}`;
		document.getElementById('modal-poke-name').textContent = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
		
		// Image
		const image = document.getElementById('modal-pokemon-image');
		image.src = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
		image.alt = pokemon.name + ' artwork';
		
		// Types
		const typeBadges = document.getElementById('modal-type-badges');
		typeBadges.innerHTML = '';
		pokemon.types.forEach(typeInfo => {
			const span = document.createElement('span');
			span.className = `type ${typeInfo.type.name}`;
			span.textContent = typeInfo.type.name;
			typeBadges.appendChild(span);
		});
		
		// Meta info
		document.getElementById('modal-height').textContent = `Height: ${pokemon.height / 10} m`;
		document.getElementById('modal-weight').textContent = `Weight: ${pokemon.weight / 10} kg`;
		
		// Abilities
		const abilities = document.getElementById('modal-abilities');
		abilities.innerHTML = '';
		pokemon.abilities.forEach(abilityInfo => {
			const span = document.createElement('span');
			span.className = 'ability';
			span.textContent = abilityInfo.ability.name.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
			if (abilityInfo.is_hidden) {
				span.textContent += ' (Hidden)';
			}
			abilities.appendChild(span);
		});
		
		// Stats
		const statsGrid = document.getElementById('modal-stats-grid');
		statsGrid.innerHTML = '';
		const statNames = {
			'hp': 'HP',
			'attack': 'Attack',
			'defense': 'Defense',
			'special-attack': 'Sp. Atk',
			'special-defense': 'Sp. Def',
			'speed': 'Speed'
		};
		const statClasses = {
			'hp': 'hp',
			'attack': 'atk',
			'defense': 'def',
			'special-attack': 'spatk',
			'special-defense': 'spdef',
			'speed': 'spd'
		};
		
		pokemon.stats.forEach(statInfo => {
			const statDiv = document.createElement('div');
			statDiv.className = 'stat';
			
			const labelDiv = document.createElement('div');
			labelDiv.className = 'stat-label';
			labelDiv.innerHTML = `<span>${statNames[statInfo.stat.name]}</span><span>${statInfo.base_stat}</span>`;
			
			const progressOuter = document.createElement('div');
			progressOuter.className = 'progress-outer';
			
			const progressInner = document.createElement('div');
			progressInner.className = `progress-inner ${statClasses[statInfo.stat.name]}`;
			progressInner.style.width = `${Math.min((statInfo.base_stat / 255) * 100, 100)}%`;
			progressInner.setAttribute('role', 'progressbar');
			progressInner.setAttribute('aria-valuemin', '0');
			progressInner.setAttribute('aria-valuemax', '255');
			progressInner.setAttribute('aria-valuenow', statInfo.base_stat);
			
			progressOuter.appendChild(progressInner);
			statDiv.appendChild(labelDiv);
			statDiv.appendChild(progressOuter);
			statsGrid.appendChild(statDiv);
		});
	}

	function updateModalDescription(species) {
		// Find English flavor text
		const flavorTexts = species.flavor_text_entries.filter(entry => entry.language.name === 'en');
		if (flavorTexts.length > 0) {
			document.getElementById('modal-pokedex-entry').textContent = flavorTexts[0].flavor_text.replace(/\f/g, ' ');
		}
		
		// Update species info
		if (species.genera) {
			const englishGenus = species.genera.find(genus => genus.language.name === 'en');
			if (englishGenus) {
				document.getElementById('modal-species').textContent = `Species: ${englishGenus.genus}`;
			}
		}
		
		// Basic type effectiveness (simplified)
		document.getElementById('modal-weaknesses').textContent = 'Type effectiveness varies based on opponent.';
	}

	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		const submitBtn = form.querySelector('button[type="submit"]');
    	submitBtn.classList.add('clicked');
    	setTimeout(() => submitBtn.classList.remove('clicked'), 400);
		const name = (input.value || "").trim();
		if (!name) {
			showError("Please enter a Pokémon name.");
			return;
		}
		clearError();
		resultEl.classList.add("hidden");
		resultEl.innerHTML = "";
		try {
			const res = await fetch(`/api/pokemon/${encodeURIComponent(name)}`);
			if (!res.ok) throw new Error("Not found");
			const data = await res.json();
			renderResult(data);
		} catch (err) {
			showError("Pokémon not found or server error.");
		}
	});
})();
