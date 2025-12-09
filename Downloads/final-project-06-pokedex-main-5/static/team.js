(() => {
  const form = document.getElementById("team-search-form");
  const input = document.getElementById("team-search-input");
  const errorEl = document.getElementById("team-error");
  const resultEl = document.getElementById("team-result");
  const cardTemplate = document.getElementById("team-card-template");

  const slots = Array.from(document.querySelectorAll(".team-slot"));
  const teamNameInput = document.getElementById("team-name-input");
  const teamStatusEl = document.getElementById("team-status");

  const saveBtn = document.getElementById("save-team-btn");
  const exportBtn = document.getElementById("export-team-btn");
  const clearBtn = document.getElementById("clear-team-btn");

  const STORAGE_KEY = "pocketPokedex-team-current";

  const userLoggedIn = window.userLoggedIn || false;

  const typeBorderColors = {
    normal: "#A8A878",
    fire: "#F08030",
    water: "#6890F0",
    electric: "#F8D030",
    grass: "#78C850",
    ice: "#98D8D8",
    fighting: "#C03028",
    poison: "#A040A0",
    ground: "#E0C068",
    flying: "#A890F0",
    psychic: "#F85888",
    bug: "#A8B820",
    rock: "#B8A038",
    ghost: "#705898",
    dragon: "#7038F8",
    dark: "#705848",
    steel: "#B8B8D0",
    fairy: "#EE99AC",
  };

  let currentTeam = [null, null, null, null, null, null];

  function hexToRgba(hex, alpha) {
    const clean = hex.replace("#", "");
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.remove("hidden");
  }

  function clearError() {
    errorEl.textContent = "";
    errorEl.classList.add("hidden");
  }

  function resetSlots() {
    slots.forEach((slot) => {
      slot.classList.remove("filled");
      slot.style.backgroundColor = "#1e1e1e";
      const slotContent = slot.querySelector(".slot-content");
      slotContent.innerHTML = `<span class="slot-empty">Empty Slot</span>`;
    });
  }

  function renderTeam() {
    resetSlots();
    currentTeam.forEach((pokemon, index) => {
      if (!pokemon) return;

      const slot = slots[index];
      slot.classList.add("filled");

      const mainType = (pokemon.types && pokemon.types[0]) ? pokemon.types[0].toLowerCase() : "normal";
      const colorHex = typeBorderColors[mainType] || "#444444";
      slot.style.backgroundColor = hexToRgba(colorHex, 0.22);

      const imgUrl =
        pokemon.images?.official_artwork ||
        pokemon.images?.front_default ||
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

      const slotContent = slot.querySelector(".slot-content");
      slotContent.innerHTML = "";

      const img = document.createElement("img");
      img.src = imgUrl;
      img.alt = pokemon.name || "Pokemon";

      const nameEl = document.createElement("div");
      nameEl.className = "slot-name";
      const displayName = pokemon.name || "Unknown";
      nameEl.textContent = displayName.charAt(0).toUpperCase() + displayName.slice(1);

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "slot-remove-btn";
      removeBtn.textContent = "Remove";
      removeBtn.addEventListener("click", () => {
        currentTeam[index] = null;
        renderTeam();
        teamStatusEl.textContent = "(unsaved)";
      });

      slotContent.appendChild(img);
      slotContent.appendChild(nameEl);
      slotContent.appendChild(removeBtn);
    });
  }

  function renderPreviewCard(data) {
    resultEl.innerHTML = "";

    const fragment = cardTemplate.content.cloneNode(true);
    const card = fragment.querySelector(".pokemon-card");
    const mainType = data.types?.[0]?.toLowerCase() || "normal";

    card.setAttribute("data-main-type", mainType);
    card.style.borderColor = typeBorderColors[mainType] || "#ffd700";

    // Name
    card.querySelector(".pokemon-name").textContent = data.name || "Unknown";

    // HP
    const hpValue = data.hp || (data.id || 1) * 10;
    card.querySelector(".pokemon-hp").innerHTML = `${hpValue} <span>HP</span>`;

    // ID
    const formattedId = String(data.id || 0).padStart(3, "0");
    card.querySelector(".pokemon-id-badge").textContent = `#${formattedId}`;

    // Image
    const imgEl = card.querySelector(".card-image-container img");
    let imageUrl =
      data.images?.official_artwork ||
      data.images?.front_default ||
      data.sprites?.other?.["official-artwork"]?.front_default ||
      data.sprites?.front_default ||
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`;

    imgEl.src = imageUrl;
    imgEl.alt = data.name || "Pokemon";
    imgEl.onerror = function () {
      this.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`;
    };

    // Types
    const typesContainer = card.querySelector(".pokemon-types");
    typesContainer.innerHTML = "";
    (data.types || []).forEach((typeName) => {
      const span = document.createElement("span");
      span.className = `type ${typeName.toLowerCase()}`;
      span.textContent = typeName.charAt(0).toUpperCase() + typeName.slice(1);
      typesContainer.appendChild(span);
    });

    // Abilities
    const abilitiesContainer = card.querySelector(".ability-list");
    abilitiesContainer.innerHTML = "";
    (data.abilities || []).forEach((ability) => {
      const item = document.createElement("div");
      item.className = "ability-item";
      item.innerHTML = `
                <div class="ability-icon">⭐</div>
                <span class="ability-name">${ability.name}</span>
                ${ability.is_hidden ? '<span class="ability-hidden">Hidden</span>' : ""}
            `;
      abilitiesContainer.appendChild(item);
    });

    // Add-to-team button
    const addBtn = fragment.querySelector(".add-to-team-btn");
    addBtn.addEventListener("click", () => {
      const slotIndex = currentTeam.findIndex((p) => p === null);
      if (slotIndex === -1) {
        showError("Your team is already full (6 Pokémon). Remove one first.");
        return;
      }
      currentTeam[slotIndex] = data;
      renderTeam();
      teamStatusEl.textContent = "(unsaved)";
    });

    resultEl.appendChild(fragment);
  }

  async function searchPokemonByName(name) {
    clearError();
    resultEl.innerHTML = "";

    try {
      const res = await fetch(`/api/pokemon/${encodeURIComponent(name)}`);
      if (!res.ok) {
        throw new Error("Not found");
      }
      const data = await res.json();
      renderPreviewCard(data);
    } catch (err) {
      console.error(err);
      showError("Pokémon not found or server error.");
    }
  }

  async function saveCurrentTeam() {
    console.log("saveCurrentTeam START");
    const name = teamNameInput.value.trim() || "Untitled Team";
    const payload = {
      name,
      members: currentTeam.filter(Boolean),
    };

    if (userLoggedIn) {
      console.log("User logged in");
      try {
        const res = await fetch("/team/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error("Failed to save team");
        const data = await res.json();
        if (data.success) {
          teamStatusEl.textContent = `(${name} saved to account)`;
        }  
      } catch (err) {
        console.error(err);
        teamStatusEl.textContent = "(Failed to save)"
      }
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      teamStatusEl.textContent = `(${name} saved locally)`;
      console.log("User not logged in")
    }
  }

  function exportCurrentTeam() {
    const name = teamNameInput.value.trim() || "Untitled Team";
    const payload = {
      name,
      members: currentTeam.filter(Boolean),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/\s+/g, "_").toLowerCase() || "team"}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function clearTeam() {
    currentTeam = [null, null, null, null, null, null];
    renderTeam();
    resultEl.innerHTML = "";
    teamStatusEl.textContent = "(unsaved)";
  }

  (async function loadSavedTeam() {
    try {
      if (window.userLoggedIn) {
        const res = await fetch("/team/load");
        const data = await res.json();
        if (!data?.members) return;
        teamNameInput.value = data.name || "";
        currentTeam = [null, null, null, null, null, null]; 
        (data.members || []).forEach((p, idx) => {
          if (idx < currentTeam.length) currentTeam[idx] = p;
        });
        renderTeam();
        teamStatusEl.textContent = `(${data.name || "saved"})`;
    } else {
      currentTeam = [null, null, null, null, null, null];
    }
  } catch (e) {
    console.error("Failed to load saved team", e);
  }   
})();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = (input.value || "").trim();
    if (!name) {
      showError("Please enter a Pokémon name.");
      return;
    }
    searchPokemonByName(name);
  });

  saveBtn.addEventListener("click", saveCurrentTeam);
  exportBtn.addEventListener("click", exportCurrentTeam);
  clearBtn.addEventListener("click", clearTeam);

  // initial render
  renderTeam();
})();
