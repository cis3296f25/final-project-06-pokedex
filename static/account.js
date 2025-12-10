(async () => {
  const container = document.getElementById("saved_teams_container");
  if (!container) return;
  const PLACEHOLDER = "/static/placeholder.png";

  const typeBorderColors = {
    normal: "#A8A878", fire: "#F08030", water: "#6890F0", electric: "#F8D030",
    grass: "#78C850", ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0",
    ground: "#E0C068", flying: "#A890F0", psychic: "#F85888", bug: "#A8B820",
    rock: "#B8A038", ghost: "#705898", dragon: "#7038F8", dark: "#705848",
    steel: "#B8B8D0", fairy: "#EE99AC"
  };

  // Loads team data
  async function loadTeams() {
    try {
      const res = await fetch("/account/teams", { cache: "no-store" });
      const teams = await res.json();
      container.innerHTML = "";
      if (!teams || teams.length === 0) {
        container.innerHTML = "<p>No saved teams yet.</p>";
        return;
      }
      teams.forEach(team => {
        const row = displayTeam(team);
        container.appendChild(row);
      });
    } catch (err) {
      console.error("Failed to load saved teams:", err);
      container.innerHTML = "<p>Error loading teams.</p>";
    }
  }

  //Renders pokemon into team slot
  function fillCard(pokemon) {
  const name = pokemon.name || "Unknown";
  const id = pokemon.id || 0;
  const formattedId = String(id).padStart(3, "0");
  const imgUrl = pokemon.id? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`: PLACEHOLDER;
  const mainType = pokemon.types?.[0]?.toLowerCase() || "normal";
  let hp = null;
  if (pokemon.stats) {
    const hpStat = pokemon.stats.find(s => s.name === "hp");
    hp = hpStat ? hpStat.base_stat : id * 10;
  } else {
    hp = id * 10;
  }
  const card = document.createElement("div");
  card.className = "pokemon-card";
  card.classList.add("card");
  card.dataset.pokemonName = name.toLowerCase();
  card.setAttribute("data-main-type", mainType);
  card.style.borderColor = typeBorderColors[mainType] || "#ffd700";
  card.innerHTML = `
    <div class="card-header">
      <h3 class="pokemon-name">${name}</h3>
      <div class="pokemon-hp">
        ${hp}
        <span>HP</span>
      </div>
    </div>

    <div class="card-image-container">
      <div class="pokemon-id-badge">#${formattedId}</div>
      <img src="${imgUrl}" alt="${name}" onerror="this.src='${PLACEHOLDER}'">
    </div>

    <div class="type-section">
      <div class="type-label">Type</div>
      <div class="pokemon-types">
        ${pokemon.types
          .map(t => `<span class="type ${t.toLowerCase()}">${t}</span>`)
          .join("")}
      </div>
    </div>

    <div class="abilities-section">
      <h4>Abilities</h4>
      <div class="ability-list">
        ${pokemon.abilities
          .map(a => `
            <div class="ability-item">
              <div class="ability-icon">⭐</div>
              <span class="ability-name">${a.name.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
              ${a.is_hidden ? `<span class="ability-hidden">Hidden</span>` : ""}
            </div>
          `)
          .join("")}
      </div>
    </div>

    <div class="card-footer">
      <span>© Pokémon</span>
    </div>
  `;
  return card;
}

  // Displays loaded teams on Accounts page
  function displayTeam(team) {
    const row = document.createElement("div");
    row.className = "team-section";
    row.dataset.teamId = team.team_id;

    const headerRow = document.createElement("div");
    headerRow.className = "team-header-row";

    const tname = document.createElement("h1");
    tname.textContent = team.name;
    headerRow.appendChild(tname);

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete Team";
    delBtn.className = "btn-danger";
    delBtn.addEventListener("click", async () => {
        try {
            console.log("Deleting team ID:", team.team_id);
            const res = await fetch(`/account/teams/${team.team_id}`, {method: "DELETE"});
            const data = await res.json();
            if (data.success) {
                row.remove();
            } else {
                alert("Failed to delete team: " + data.error); 
            }
        } catch (err) {
            console.error(err);
            alert("Error deleting team");
        }
    });
    headerRow.appendChild(delBtn);
    row.appendChild(headerRow);

    const wrapper = document.createElement("div");
    wrapper.className = "team-slots2 team-scale";
    team.members.forEach(pokemonObj => {
        const card = fillCard(pokemonObj);
        wrapper.appendChild(card);
    });

    row.appendChild(wrapper);
    return row;
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadTeams);
  } else {
    loadTeams();
  }
})();
