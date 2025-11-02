(() => {
	const form = document.getElementById("search-form");
	const input = document.getElementById("name-input");
	const errorEl = document.getElementById("error");
	const resultEl = document.getElementById("result");

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
		const abilities = (data.abilities || []).map(a => a.name).join(", ") || "None";
		const card = document.createElement('div');
		card.classList.add('pokemon-card');
		card.innerHTML = `
            <div class="pokemon-image">
                <img src="${data.sprites?.front_default || ''}" alt="${data.name}" />
            </div>
            <div class="pokemon-info">
                <h3 class="pokemon-name">${data.name?.toUpperCase() || "Unknown"}</h3>
                <div class="pokemon-types">
                    ${(data.types || []).map(type => `<span class="type ${type.toLowerCase()}">${type}</span>`).join('')}
                </div>
                <div class="pokemon-abilities">
                    <strong>Abilities:</strong> ${abilities}
                </div>
            </div>
        `;
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
