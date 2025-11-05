(() => {
	const form = document.getElementById("search-form");
	const input = document.getElementById("name-input");
	const errorEl = document.getElementById("error");
	const resultEl = document.getElementById("result");

	// Define border colors for each Pokémon type
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

	// Function to apply border color based on Pokémon type
	function applyBorderColor(cardElement, mainType) {
		const borderColor = typeBorderColors[mainType] || '#ffd700';
		cardElement.style.borderColor = borderColor;
	}

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
		const card = document.createElement('div');
		card.classList.add('pokemon-card');
		
		// Use the actual HP from the API response, fallback to calculation if not available
		const hp = data.hp || (data.id || 1) * 10;
		
		// Format ID with leading zeros
		const formattedId = String(data.id || 0).padStart(3, '0');
		
		// Get the main type for border coloring
		const mainType = data.types && data.types.length > 0 ? data.types[0].toLowerCase() : 'normal';
		
		// Get image URL
		let imageUrl = '';
		if (data.images && data.images.official_artwork) {
			imageUrl = data.images.official_artwork;
		} else if (data.images && data.images.front_default) {
			imageUrl = data.images.front_default;
		} else if (data.sprites && data.sprites.other && data.sprites.other['official-artwork'] && data.sprites.other['official-artwork'].front_default) {
			imageUrl = data.sprites.other['official-artwork'].front_default;
		} else if (data.sprites && data.sprites.front_default) {
			imageUrl = data.sprites.front_default;
		} else {
			// Fallback to generic URL
			imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`;
		}
		
		card.innerHTML = `
			<div class="card-header">
				<h2 class="pokemon-name">${data.name || "Unknown"}</h2>
				<div class="pokemon-hp">${hp} <span>HP</span></div>
			</div>
			
			<div class="card-image-container">
				<div class="pokemon-id-badge">#${formattedId}</div>
				<img src="${imageUrl}" alt="${data.name}" 
					onerror="this.onerror=null; this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png';" />
			</div>
			
			<div class="type-section">
				<div class="type-label">Type</div>
				<div class="pokemon-types">
					${(data.types || []).map(type => `<span class="type ${type.toLowerCase()}">${type}</span>`).join('')}
				</div>
			</div>
			
			<div class="abilities-section">
				<h4>Abilities</h4>
				<div class="ability-list">
					${(data.abilities || []).map(ability => `
						<div class="ability-item">
							<div class="ability-icon">⭐</div>
							<span class="ability-name">${ability.name}</span>
							${ability.is_hidden ? '<span class="ability-hidden">Hidden</span>' : ''}
						</div>
					`).join('')}
				</div>
			</div>
			
			<div class="card-footer">
				<span>© Pokémon</span>
			</div>
		`;
		
		// Apply the border color based on the Pokémon's type
		applyBorderColor(card, mainType);
		
		resultEl.classList.remove('hidden');
		resultEl.appendChild(card);
	}

	form.addEventListener("submit", async (e) => {
		e.preventDefault();
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