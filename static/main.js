(() => {

	// collect the form, input, error, and result elements
	const form = document.getElementById("search-form");
	const input = document.getElementById("name-input");
	const errorEl = document.getElementById("error");
	const resultEl = document.getElementById("result");

	// function to display error message, and assign to correct classes
	function showError(message) {
		errorEl.textContent = message;
		errorEl.classList.remove("hidden");
		resultEl.classList.add("hidden");
	}

	// Clears error message by re assigning hidden and empty text
	function clearError() {
		errorEl.classList.add("hidden");
		errorEl.textContent = "";
	}

	function renderResult(data) {

		// from the response, parse all the abilities and types, include default values or possible problems
		// this can empty strings, undefined, or null.
		const abilities = (data.abilities || []).map(a => a.name).join(", ") || "None";
		const types = (data.types || []).join(", ") || "Unknown";

		resultEl.innerHTML = `
			<div class="card">
				<h2>${data.name?.toUpperCase() || "Unknown"}</h2>
				<p><strong>Types:</strong> ${types}</p>
				<p><strong>Abilities:</strong> ${abilities}</p>
			</div>
		`;

		// remove the hidden class, so we can display the results
		resultEl.classList.remove("hidden");
	}


	// Event listener for the form submission
	// e is the event object, important to understand! if unfamiliar, look up the event object.
	form.addEventListener("submit", async (e) => {

		// remove default behavior
		e.preventDefault();
		const name = (input.value || "").trim();
		if (!name) {
			// call the showError function with the given error.
			showError("Please enter a Pokémon name.");
			return;
		}

		// clear the error
		clearError();
		// hide the result again
		resultEl.classList.add("hidden");


		// attempt the API call
		try {
			const res = await fetch(`/api/pokemon/${encodeURIComponent(name)}`);

			// bad path
			if (!res.ok) {
				throw new Error("Not found");
			}
			// store response
			const data = await res.json();
			// analyze result
			renderResult(data);

		} catch (err) {
			// display error if needed
			showError("Pokémon not found or server error.");
		}
	});
})();


