(() => {
  const $ = (id) => document.getElementById(id);
  const STORE = "aov-state-v1";

  const RANDOM_INTROS = [
    "Le destin a parlé…",
    "Pas de chance 😈",
    "Ça va être drôle !",
    "Courage, on croit en toi !",
    "Interdit de se défiler !",
    "Le public attend…",
  ];

  let state = { players: [], current: 0, usedA: [], usedV: [] };
  try {
    const saved = JSON.parse(localStorage.getItem(STORE));
    if (saved && Array.isArray(saved.players)) state = Object.assign(state, saved);
  } catch (e) {}

  const save = () => {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {}
  };

  // Tire une carte au hasard parmi celles pas encore sorties
  function draw(type) {
    const list = type === "action" ? ACTIONS : VERITES;
    const key = type === "action" ? "usedA" : "usedV";
    if (state[key].length >= list.length) state[key] = [];
    let i;
    do { i = Math.floor(Math.random() * list.length); } while (state[key].includes(i));
    state[key].push(i);
    save();
    return list[i];
  }

  function currentName() {
    return state.players.length ? state.players[state.current % state.players.length] : null;
  }

  function renderPlayers() {
    const ul = $("playerList");
    ul.innerHTML = "";
    state.players.forEach((name, i) => {
      const li = document.createElement("li");
      if (i === state.current % state.players.length) li.className = "current";
      li.textContent = name;
      const del = document.createElement("button");
      del.textContent = "×";
      del.setAttribute("aria-label", "Retirer " + name);
      del.onclick = () => {
        state.players.splice(i, 1);
        if (state.current >= state.players.length) state.current = 0;
        save();
        render();
      };
      li.appendChild(del);
      ul.appendChild(li);
    });
  }

  function renderTurn() {
    const name = currentName();
    $("turnText").innerHTML = name
      ? `C'est au tour de <strong></strong> ! Action ou vérité ?`
      : "Ajoute des joueurs, ou joue directement !";
    if (name) $("turnText").querySelector("strong").textContent = name;
  }

  function renderCounter() {
    const left = (ACTIONS.length - state.usedA.length) + (VERITES.length - state.usedV.length);
    $("counter").textContent = `${ACTIONS.length - state.usedA.length} actions et ${VERITES.length - state.usedV.length} vérités pas encore jouées`;
    $("btnReset").style.display = left === ACTIONS.length + VERITES.length ? "none" : "";
  }

  function render() {
    renderPlayers();
    renderTurn();
    renderCounter();
  }

  function show(type, intro) {
    const card = $("card");
    const text = draw(type);
    const name = currentName();
    card.className = "card " + (type === "action" ? "action" : "verite");
    $("cardType").textContent = (intro ? intro + " " : "") + (type === "action" ? "🔥 Action" : "🤫 Vérité") + (name ? " pour " + name : "");
    $("cardText").textContent = text;
    // relance l'animation
    void card.offsetWidth;
    card.style.animation = "none";
    void card.offsetWidth;
    card.style.animation = "";
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    renderCounter();
  }

  function confetti() {
    const box = $("confetti");
    const emojis = ["💖", "🌸", "✨", "🎀", "💕", "🍬", "🦄"];
    for (let i = 0; i < 24; i++) {
      const c = document.createElement("i");
      c.textContent = emojis[i % emojis.length];
      c.style.left = Math.random() * 100 + "vw";
      c.style.animationDelay = Math.random() * 0.4 + "s";
      c.style.fontSize = 16 + Math.random() * 18 + "px";
      box.appendChild(c);
      setTimeout(() => c.remove(), 2200);
    }
  }

  function nextPlayer() {
    if (state.players.length) state.current = (state.current + 1) % state.players.length;
    save();
    $("card").classList.add("hidden");
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  $("addForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("nameInput").value.trim();
    if (!name) return;
    state.players.push(name);
    $("nameInput").value = "";
    save();
    render();
  });

  $("btnAction").onclick = () => show("action");
  $("btnVerite").onclick = () => show("verite");
  $("btnRandom").onclick = () => {
    const intro = RANDOM_INTROS[Math.floor(Math.random() * RANDOM_INTROS.length)];
    show(Math.random() < 0.5 ? "action" : "verite", intro);
  };
  $("btnNext").onclick = () => { confetti(); nextPlayer(); };
  $("btnPass").onclick = () => {
    const card = $("card");
    card.classList.remove("shake");
    void card.offsetWidth;
    card.classList.add("shake");
    const type = card.classList.contains("action") ? "action" : "verite";
    setTimeout(() => show(type, "Joker utilisé ! Allez, celle-là :"), 450);
  };
  $("btnReset").onclick = () => {
    state.usedA = [];
    state.usedV = [];
    save();
    renderCounter();
  };

  render();
})();
