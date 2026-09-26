/* =====================================================
   STYLE SYNTH AI
   Personal Wardrobe
   Vanilla JavaScript
===================================================== */


/* =========================
   STORAGE
========================= */

const STORAGE_KEY = "styleSynthWardrobeV2";
const OUTFIT_KEY = "styleSynthOutfitCount";

let wardrobe = JSON.parse(
  localStorage.getItem(STORAGE_KEY) || "[]"
);

let outfitCount = Number(
  localStorage.getItem(OUTFIT_KEY) || 0
);

let currentFilter = "all";
let currentOccasion = "casual";
let selectedImage = null;


/* =========================
   ELEMENTS
========================= */

const wardrobeGrid =
  document.getElementById("wardrobeGrid");

const emptyState =
  document.getElementById("emptyState");

const totalItems =
  document.getElementById("totalItems");

const favoriteItems =
  document.getElementById("favoriteItems");

const outfitCountEl =
  document.getElementById("outfitCount");

const searchInput =
  document.getElementById("searchInput");

const addModal =
  document.getElementById("addModal");

const stylistModal =
  document.getElementById("stylistModal");

const imageInput =
  document.getElementById("imageInput");

const uploadPreview =
  document.getElementById("uploadPreview");

const itemName =
  document.getElementById("itemName");

const itemCategory =
  document.getElementById("itemCategory");

const itemColor =
  document.getElementById("itemColor");

const itemSeason =
  document.getElementById("itemSeason");

const outfitResult =
  document.getElementById("outfitResult");

const outfitGrid =
  document.getElementById("outfitGrid");

const outfitTitle =
  document.getElementById("outfitTitle");

const styleNote =
  document.getElementById("styleNote");

const toast =
  document.getElementById("toast");

const toastText =
  document.getElementById("toastText");


/* =========================
   INITIALIZE
========================= */

document.addEventListener("DOMContentLoaded", () => {

  renderWardrobe();
  updateStats();

});


/* =========================
   SAVE
========================= */

function saveWardrobe() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(wardrobe)
  );

}


/* =========================
   STATS
========================= */

function updateStats() {

  totalItems.textContent =
    wardrobe.length;

  favoriteItems.textContent =
    wardrobe.filter(item => item.favorite).length;

  outfitCountEl.textContent =
    outfitCount;

}


/* =========================
   MODALS
========================= */

function openAddModal() {

  addModal.classList.remove("hidden");

  document.body.style.overflow = "hidden";

}

function closeAddModal() {

  addModal.classList.add("hidden");

  document.body.style.overflow = "";

}

function openStylistModal() {

  stylistModal.classList.remove("hidden");

  document.body.style.overflow = "hidden";

}

function closeStylistModal() {

  stylistModal.classList.add("hidden");

  document.body.style.overflow = "";

}


/* =========================
   ADD ITEM BUTTONS
========================= */

document
  .getElementById("addItemBtn")
  .addEventListener("click", openAddModal);

document
  .getElementById("emptyAddBtn")
  .addEventListener("click", openAddModal);

document
  .getElementById("navAdd")
  .addEventListener("click", openAddModal);

document
  .getElementById("closeModal")
  .addEventListener("click", closeAddModal);

document
  .getElementById("modalOverlay")
  .addEventListener("click", closeAddModal);


/* =========================
   STYLIST
========================= */

document
  .getElementById("stylistBtn")
  .addEventListener("click", openStylistModal);

document
  .getElementById("closeStylist")
  .addEventListener("click", closeStylistModal);

document
  .getElementById("stylistOverlay")
  .addEventListener("click", closeStylistModal);


/* =========================
   IMAGE UPLOAD
========================= */

imageInput.addEventListener("change", function () {

  const file = this.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {

    showToast("Please select an image");

    return;

  }

  const reader = new FileReader();

  reader.onload = function (event) {

    selectedImage = event.target.result;

    uploadPreview.innerHTML = `
      <img
        src="${selectedImage}"
        style="
          width:100%;
          height:180px;
          object-fit:cover;
          display:block;
        "
      >
    `;

  };

  reader.readAsDataURL(file);

});


/* =========================
   SAVE ITEM
========================= */

document
  .getElementById("saveItemBtn")
  .addEventListener("click", saveNewItem);


function saveNewItem() {

  const name =
    itemName.value.trim();

  if (!name) {

    showToast("Enter an item name");

    itemName.focus();

    return;

  }

  if (!selectedImage) {

    showToast("Upload a clothing photo");

    return;

  }


  const item = {

    id: Date.now(),

    name,

    category:
      itemCategory.value,

    color:
      itemColor.value,

    season:
      itemSeason.value,

    image:
      selectedImage,

    favorite:
      false,

    created:
      new Date().toISOString()

  };


  wardrobe.unshift(item);

  saveWardrobe();

  renderWardrobe();

  updateStats();

  resetAddForm();

  closeAddModal();

  showToast("Added to your wardrobe");

}


/* =========================
   RESET FORM
========================= */

function resetAddForm() {

  selectedImage = null;

  imageInput.value = "";

  itemName.value = "";

  itemCategory.value = "top";

  itemColor.value = "black";

  itemSeason.value = "all";


  uploadPreview.innerHTML = `
    <span class="upload-icon">＋</span>

    <strong>Upload clothing photo</strong>

    <small>Choose an image from your phone</small>
  `;

}


/* =========================
   RENDER WARDROBE
========================= */

function renderWardrobe() {

  const query =
    searchInput.value
      .trim()
      .toLowerCase();


  const filtered =
    wardrobe.filter(item => {

      const matchesFilter =
        currentFilter === "all" ||
        item.category === currentFilter;


      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.color.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);


      return matchesFilter && matchesSearch;

    });


  wardrobeGrid.innerHTML = "";


  if (filtered.length === 0) {

    if (wardrobe.length === 0) {

      wardrobeGrid.appendChild(
        createEmptyState()
      );

    } else {

      wardrobeGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⌕</div>
          <h3>No matching items</h3>
          <p>
            Try another search or category.
          </p>
        </div>
      `;

    }

    return;

  }


  filtered.forEach(item => {

    const card =
      document.createElement("div");

    card.className =
      "clothing-card";


    card.innerHTML = `

      <img
        class="clothing-image"
        src="${item.image}"
        alt="${escapeHTML(item.name)}"
      >

      <button
        class="favorite-btn ${item.favorite ? "active" : ""}"
        data-action="favorite"
        data-id="${item.id}"
      >
        ${item.favorite ? "♥" : "♡"}
      </button>

      <button
        class="delete-btn"
        data-action="delete"
        data-id="${item.id}"
      >
        ×
      </button>

      <div class="clothing-info">

        <div class="clothing-name">
          ${escapeHTML(item.name)}
        </div>

        <div class="clothing-meta">
          ${capitalize(item.color)}
          ·
          ${capitalize(item.category)}
        </div>

      </div>
    `;


    wardrobeGrid.appendChild(card);

  });

}


/* =========================
   EMPTY STATE
========================= */

function createEmptyState() {

  const div =
    document.createElement("div");

  div.className =
    "empty-state";

  div.innerHTML = `

    <div class="empty-icon">👕</div>

    <h3>Your wardrobe is empty</h3>

    <p>
      Add your first clothing item to start
      building outfits.
    </p>

    <button class="primary-btn">
      Add first item
    </button>

  `;


  div
    .querySelector("button")
    .addEventListener(
      "click",
      openAddModal
    );


  return div;

}


/* =========================
   CARD ACTIONS
========================= */

wardrobeGrid.addEventListener(
  "click",
  function(event) {

    const button =
      event.target.closest("button");

    if (!button) return;

    const id =
      Number(button.dataset.id);

    const action =
      button.dataset.action;


    if (action === "favorite") {

      toggleFavorite(id);

    }


    if (action === "delete") {

      deleteItem(id);

    }

  }
);


/* =========================
   FAVORITE
========================= */

function toggleFavorite(id) {

  wardrobe =
    wardrobe.map(item => {

      if (item.id === id) {

        return {
          ...item,
          favorite: !item.favorite
        };

      }

      return item;

    });


  saveWardrobe();

  renderWardrobe();

  updateStats();

}


/* =========================
   DELETE
========================= */

function deleteItem(id) {

  const item =
    wardrobe.find(
      item => item.id === id
    );

  if (!item) return;


  const confirmed =
    confirm(
      `Remove "${item.name}" from your wardrobe?`
    );


  if (!confirmed) return;


  wardrobe =
    wardrobe.filter(
      item => item.id !== id
    );


  saveWardrobe();

  renderWardrobe();

  updateStats();

  showToast("Item removed");

}


/* =========================
   SEARCH
========================= */

searchInput.addEventListener(
  "input",
  renderWardrobe
);


/* =========================
   FILTER
========================= */

document
  .querySelectorAll(".filter")
  .forEach(button => {

    button.addEventListener(
      "click",
      function() {

        document
          .querySelectorAll(".filter")
          .forEach(btn =>
            btn.classList.remove("active")
          );

        this.classList.add("active");

        currentFilter =
          this.dataset.filter;

        renderWardrobe();

      }
    );

  });


/* =========================
   OCCASIONS
========================= */

document
  .querySelectorAll(".occasion")
  .forEach(button => {

    button.addEventListener(
      "click",
      function() {

        document
          .querySelectorAll(".occasion")
          .forEach(btn =>
            btn.classList.remove("active")
          );

        this.classList.add("active");

        currentOccasion =
          this.dataset.occasion;

      }
    );

  });


/* =========================
   OUTFIT GENERATOR
========================= */

document
  .getElementById("generateBtn")
  .addEventListener(
    "click",
    generateOutfit
  );

document
  .getElementById("generateHeroBtn")
  .addEventListener(
    "click",
    () => {

      document
        .querySelector(".generator-card")
        .scrollIntoView({
          behavior: "smooth"
        });

    }
  );


document
  .getElementById("navGenerate")
  .addEventListener(
    "click",
    () => {

      document
        .querySelector(".generator-card")
        .scrollIntoView({
          behavior: "smooth"
        });

    }
  );


function generateOutfit() {

  if (wardrobe.length === 0) {

    showToast(
      "Add some clothes first"
    );

    openAddModal();

    return;

  }


  const top =
    findRandom("top");

  const bottom =
    findRandom("bottom");

  const shoes =
    findRandom("shoes");

  const accessory =
    findRandom("accessory");


  const outfit = [
    top,
    bottom,
    shoes,
    accessory
  ].filter(Boolean);


  if (outfit.length === 0) {

    showToast(
      "Add tops, bottoms or shoes"
    );

    return;

  }


  outfitCount++;

  localStorage.setItem(
    OUTFIT_KEY,
    outfitCount
  );


  updateStats();

  renderOutfit(outfit);

}


/* =========================
   FIND RANDOM ITEM
========================= */

function findRandom(category) {

  const items =
    wardrobe.filter(
      item => item.category === category
    );


  if (!items.length) return null;


  return items[
    Math.floor(
      Math.random() * items.length
    )
  ];

}


/* =========================
   RENDER OUTFIT
========================= */

function renderOutfit(items) {

  outfitGrid.innerHTML = "";


  items.forEach(item => {

    const div =
      document.createElement("div");

    div.className =
      "outfit-item";


    div.innerHTML = `

      <img
        src="${item.image}"
        alt="${escapeHTML(item.name)}"
      >

      <p>
        ${escapeHTML(item.name)}
      </p>

    `;


    outfitGrid.appendChild(div);

  });


  outfitTitle.textContent =
    getOutfitTitle(currentOccasion);


  styleNote.textContent =
    getStyleNote(currentOccasion, items);


  outfitResult.classList.remove(
    "hidden"
  );


  outfitResult.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });


  showToast("Outfit generated ✦");

}


/* =========================
   OUTFIT TITLES
========================= */

function getOutfitTitle(occasion) {

  const titles = {

    casual:
      "Relaxed everyday look",

    college:
      "Clean college look",

    party:
      "Night-out look",

    formal:
      "Sharp formal look"

  };


  return titles[occasion] ||
    "Your generated look";

}


/* =========================
   STYLE NOTES
========================= */

function getStyleNote(
  occasion,
  items
) {

  const notes = {

    casual:
      "Keep the look relaxed and balanced. Let one piece stand out and keep the rest simple.",

    college:
      "A clean, comfortable combination works well for college. Keep your footwear simple and practical.",

    party:
      "For a stronger evening look, use one statement piece and keep the rest of the outfit balanced.",

    formal:
      "Keep the silhouette clean and coordinated. Neutral colors usually make the combination easier to style."

  };


  return (
    notes[occasion] ||
    "Your wardrobe pieces have been combined into a complete look."
  );

}


/* =========================
   AI STYLE OPTIONS
========================= */

document
  .querySelectorAll(".ai-options button")
  .forEach(button => {

    button.addEventListener(
      "click",
      function() {

        const occasion =
          this.dataset.ai;


        closeStylistModal();


        if (
          [
            "college",
            "casual",
            "party",
            "formal"
          ].includes(occasion)
        ) {

          currentOccasion =
            occasion;


          document
            .querySelectorAll(".occasion")
            .forEach(btn => {

              btn.classList.toggle(
                "active",
                btn.dataset.occasion ===
                  occasion
              );

            });

        }


        document
          .querySelector(".generator-card")
          .scrollIntoView({
            behavior: "smooth"
          });


        setTimeout(
          generateOutfit,
          600
        );

      }
    );

  });


/* =========================
   CLOSE OUTFIT
========================= */

document
  .getElementById("closeOutfit")
  .addEventListener(
    "click",
    () => {

      outfitResult.classList.add(
        "hidden"
      );

    }
  );


/* =========================
   BOTTOM NAV
========================= */

document
  .querySelectorAll(".nav-item")
  .forEach(button => {

    button.addEventListener(
      "click",
      function() {

        const target =
          this.dataset.scroll;


        if (target === "top") {

          window.scrollTo({
            top: 0,
            behavior: "smooth"
          });

        }


        if (target === "wardrobe") {

          document
            .querySelector(".wardrobe-grid")
            .scrollIntoView({
              behavior: "smooth"
            });

        }


        if (target === "outfit") {

          document
            .querySelector(".generator-card")
            .scrollIntoView({
              behavior: "smooth"
            });

        }

      }
    );

  });


/* =========================
   SETTINGS
========================= */

document
  .getElementById("settingsBtn")
  .addEventListener(
    "click",
    () => {

      showToast(
        "Style Synth v2.0 • Local mode"
      );

    }
  );


/* =========================
   TOAST
========================= */

let toastTimer;

function showToast(message) {

  toastText.textContent =
    message;

  toast.classList.add("show");


  clearTimeout(toastTimer);


  toastTimer =
    setTimeout(() => {

      toast.classList.remove(
        "show"
      );

    }, 2400);

}


/* =========================
   HELPERS
========================= */

function capitalize(value) {

  if (!value) return "";

  return value.charAt(0).toUpperCase() +
    value.slice(1);

}


function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================
   KEYBOARD / ESCAPE
========================= */

document.addEventListener(
  "keydown",
  event => {

    if (event.key !== "Escape") return;

    closeAddModal();

    closeStylistModal();

  }
);
