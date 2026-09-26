/* =========================================================
   STYLE SYNTH AI — COMPLETE SCRIPT
   Version: 2.0
   ========================================================= */

"use strict";

/* ---------- APP STATE ---------- */

const state = {
  wardrobe: JSON.parse(localStorage.getItem("styleSynthWardrobe") || "[]"),
  outfits: JSON.parse(localStorage.getItem("styleSynthOutfits") || "[]"),
  currentImage: null,
  currentItem: null,
  editingItemId: null
};


/* ---------- DOM HELPERS ---------- */

function $(selector) {
  return document.querySelector(selector);
}

function $all(selector) {
  return document.querySelectorAll(selector);
}

function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}


/* ---------- INITIALIZE APP ---------- */

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});


function initializeApp() {
  setupUpload();
  setupNavigation();
  setupSearch();
  setupFilters();
  setupWardrobeButtons();
  setupEditControls();
  setupOutfitGenerator();

  renderWardrobe();
  renderOutfits();
  updateStats();

  console.log("Style Synth AI loaded successfully.");
}


/* =========================================================
   IMAGE UPLOAD
   ========================================================= */

function setupUpload() {
  const fileInput =
    $("#imageInput") ||
    $("#fileInput") ||
    document.querySelector('input[type="file"]');

  if (!fileInput) return;

  fileInput.addEventListener("change", handleImageUpload);
}


function handleImageUpload(event) {
  const file = event.target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showMessage("Please select an image file.");
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    showMessage("Please choose an image smaller than 10 MB.");
    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    state.currentImage = reader.result;

    showUploadedImage(reader.result);

    analyzeImage(reader.result, file.name);
  };

  reader.readAsDataURL(file);
}


function showUploadedImage(image) {
  const preview =
    $("#imagePreview") ||
    $("#previewImage") ||
    document.querySelector(".image-preview img");

  if (preview) {
    preview.src = image;
    preview.style.display = "block";
  }

  const previewContainer =
    $("#imagePreviewContainer") ||
    document.querySelector(".image-preview");

  if (previewContainer) {
    previewContainer.classList.add("has-image");
  }
}


/* =========================================================
   BASIC IMAGE ANALYSIS
   ========================================================= */

async function analyzeImage(imageData, fileName = "") {
  showMessage("Analyzing your item...");

  const image = new Image();

  image.onload = function () {
    const color = detectDominantColor(image);

    const category = detectCategory(fileName);

    const item = {
      id: createId(),
      name: createItemName(category),
      category: category,
      color: color.name,
      colorHex: color.hex,
      occasion: suggestOccasion(category),
      image: imageData,
      brand: detectBrand(fileName),
      material: "Unknown",
      season: suggestSeason(category),
      createdAt: new Date().toISOString()
    };

    state.currentItem = item;

    displayAnalysis(item);

    showMessage("Analysis complete.");
  };

  image.src = imageData;
}


/* =========================================================
   CATEGORY DETECTION
   ========================================================= */

function detectCategory(fileName) {
  const name = fileName.toLowerCase();

  if (
    name.includes("shirt") ||
    name.includes("formal") ||
    name.includes("overshirt")
  ) {
    return "Shirt";
  }

  if (
    name.includes("tshirt") ||
    name.includes("t-shirt") ||
    name.includes("tee")
  ) {
    return "T-Shirt";
  }

  if (
    name.includes("pant") ||
    name.includes("trouser") ||
    name.includes("jean") ||
    name.includes("cargo")
  ) {
    return "Pants";
  }

  if (
    name.includes("shoe") ||
    name.includes("sneaker") ||
    name.includes("boot")
  ) {
    return "Shoes";
  }

  if (
    name.includes("watch") ||
    name.includes("belt") ||
    name.includes("bag") ||
    name.includes("cap") ||
    name.includes("hat") ||
    name.includes("glass")
  ) {
    return "Accessory";
  }

  if (name.includes("jacket") || name.includes("coat")) {
    return "Jacket";
  }

  return "Clothing";
}


function createItemName(category) {
  const names = {
    Shirt: "My Shirt",
    "T-Shirt": "My T-Shirt",
    Pants: "My Pants",
    Shoes: "My Shoes",
    Accessory: "My Accessory",
    Jacket: "My Jacket",
    Clothing: "My Clothing"
  };

  return names[category] || "My Clothing";
}


/* =========================================================
   COLOR DETECTION
   ========================================================= */

function detectDominantColor(image) {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", {
      willReadFrequently: true
    });

    const size = 50;

    canvas.width = size;
    canvas.height = size;

    ctx.drawImage(image, 0, 0, size, size);

    const pixels = ctx.getImageData(0, 0, size, size).data;

    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      const red = pixels[i];
      const green = pixels[i + 1];
      const blue = pixels[i + 2];
      const alpha = pixels[i + 3];

      if (alpha < 100) continue;

      // Ignore extremely bright background pixels
      if (red > 245 && green > 245 && blue > 245) {
        continue;
      }

      r += red;
      g += green;
      b += blue;
      count++;
    }

    if (!count) {
      return {
        name: "Unknown",
        hex: "#888888"
      };
    }

    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);

    return {
      name: rgbToColorName(r, g, b),
      hex: rgbToHex(r, g, b)
    };
  } catch (error) {
    console.error("Color detection failed:", error);

    return {
      name: "Unknown",
      hex: "#888888"
    };
  }
}


function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map(value => value.toString(16).padStart(2, "0"))
      .join("")
  );
}


function rgbToColorName(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  if (max < 45) return "Black";

  if (min > 220 && max > 235) {
    return "White";
  }

  if (max - min < 20 && max < 100) {
    return "Dark Gray";
  }

  if (max - min < 25) {
    return "Gray";
  }

  if (r > 150 && g < 100 && b < 100) {
    return "Red";
  }

  if (r > 140 && g > 80 && g < 160 && b < 100) {
    return "Brown";
  }

  if (r > 180 && g > 130 && b < 100) {
    return "Yellow";
  }

  if (r > 180 && g > 100 && b < 120) {
    return "Orange";
  }

  if (r > 150 && g < 120 && b > 130) {
    return "Pink";
  }

  if (r > 100 && g < 100 && b > 120) {
    return "Purple";
  }

  if (b > r * 1.25 && b > g * 1.1) {
    return "Blue";
  }

  if (g > r * 1.2 && g > b * 1.05) {
    return "Green";
  }

  if (r > 120 && g > 100 && b > 70) {
    return "Beige";
  }

  return "Mixed";
}


/* =========================================================
   BRAND DETECTION
   ========================================================= */

function detectBrand(fileName) {
  const name = fileName.toLowerCase();

  const brands = [
    "nike",
    "adidas",
    "puma",
    "zara",
    "h&m",
    "hm",
    "uniqlo",
    "levi",
    "levis",
    "zudio",
    "louis philippe",
    "peter england",
    "roadster",
    "snitch",
    "max",
    "decathlon"
  ];

  for (const brand of brands) {
    if (name.includes(brand)) {
      return brand.toUpperCase();
    }
  }

  return "Unknown";
}


/* =========================================================
   OCCASION
   ========================================================= */

function suggestOccasion(category) {
  switch (category) {
    case "Shirt":
      return "Casual / Formal";

    case "T-Shirt":
      return "Casual";

    case "Pants":
      return "Casual / College";

    case "Shoes":
      return "Casual / Daily";

    case "Jacket":
      return "Casual / Evening";

    case "Accessory":
      return "Daily / Casual";

    default:
      return "Daily";
  }
}


function suggestSeason(category) {
  if (category === "Jacket") {
    return "Winter";
  }

  return "All Season";
}


/* =========================================================
   DISPLAY ANALYSIS
   ========================================================= */

function displayAnalysis(item) {
  const categoryElement =
    $("#detectedCategory") ||
    $("#categoryResult");

  const colorElement =
    $("#detectedColor") ||
    $("#colorResult");

  const brandElement =
    $("#detectedBrand") ||
    $("#brandResult");

  const occasionElement =
    $("#detectedOccasion") ||
    $("#occasionResult");

  if (categoryElement) {
    categoryElement.textContent = item.category;
  }

  if (colorElement) {
    colorElement.textContent = item.color;

    colorElement.style.borderLeft =
      `8px solid ${item.colorHex}`;
  }

  if (brandElement) {
    brandElement.textContent = item.brand;
  }

  if (occasionElement) {
    occasionElement.textContent = item.occasion;
  }

  const resultBox =
    $("#analysisResult") ||
    document.querySelector(".analysis-result");

  if (resultBox) {
    resultBox.style.display = "block";
  }

  setupDynamicAnalysisControls(item);
}


/* =========================================================
   EDIT CONTROLS
   ========================================================= */

function setupEditControls() {
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");

    if (!button) return;

    const action = button.dataset.action;

    if (action === "edit") {
      editItem(button.dataset.id);
    }

    if (action === "delete") {
      deleteItem(button.dataset.id);
    }

    if (action === "save") {
      saveCurrentItem();
    }

    if (action === "cancel") {
      closeEditor();
    }
  });
}


function setupDynamicAnalysisControls(item) {
  const container =
    $("#editControls") ||
    document.querySelector(".edit-controls");

  if (!container) return;

  container.innerHTML = `
    <div class="style-edit-panel">

      <label>
        Item name
        <input
          id="editItemName"
          value="${escapeHTML(item.name)}"
        >
      </label>

      <label>
        Category
        <select id="editCategory">
          ${createOptions(
            [
              "Shirt",
              "T-Shirt",
              "Pants",
              "Shoes",
              "Accessory",
              "Jacket",
              "Clothing"
            ],
            item.category
          )}
        </select>
      </label>

      <label>
        Color
        <input
          id="editColor"
          value="${escapeHTML(item.color)}"
        >
      </label>

      <label>
        Brand
        <input
          id="editBrand"
          value="${escapeHTML(item.brand)}"
        >
      </label>

      <label>
        Occasion
        <select id="editOccasion">
          ${createOptions(
            [
              "Casual",
              "College",
              "Formal",
              "Party",
              "Wedding",
              "Sports",
              "Travel",
              "Daily",
              "Casual / Formal"
            ],
            item.occasion
          )}
        </select>
      </label>

      <button data-action="save-analysis">
        Save Changes
      </button>

    </div>
  `;

  const saveButton = container.querySelector(
    '[data-action="save-analysis"]'
  );

  if (saveButton) {
    saveButton.addEventListener("click", saveAnalysisEdits);
  }
}


function createOptions(options, selected) {
  return options
    .map(option => {
      const isSelected =
        option === selected ? "selected" : "";

      return `
        <option ${isSelected}>
          ${escapeHTML(option)}
        </option>
      `;
    })
    .join("");
}


function saveAnalysisEdits() {
  if (!state.currentItem) return;

  const name = $("#editItemName")?.value.trim();
  const category = $("#editCategory")?.value;
  const color = $("#editColor")?.value.trim();
  const brand = $("#editBrand")?.value.trim();
  const occasion = $("#editOccasion")?.value;

  state.currentItem.name =
    name || "My Clothing";

  state.currentItem.category =
    category || "Clothing";

  state.currentItem.color =
    color || "Unknown";

  state.currentItem.brand =
    brand || "Unknown";

  state.currentItem.occasion =
    occasion || "Daily";

  addToWardrobe(state.currentItem);

  showMessage("Item saved to your wardrobe.");

  renderWardrobe();
  updateStats();
}


/* =========================================================
   WARDROBE
   ========================================================= */

function addToWardrobe(item) {
  const existingIndex =
    state.wardrobe.findIndex(
      saved => saved.id === item.id
    );

  if (existingIndex >= 0) {
    state.wardrobe[existingIndex] = item;
  } else {
    state.wardrobe.push(item);
  }

  saveWardrobe();
}


function saveWardrobe() {
  localStorage.setItem(
    "styleSynthWardrobe",
    JSON.stringify(state.wardrobe)
  );
}


function renderWardrobe(items = state.wardrobe) {
  const container =
    $("#wardrobeGrid") ||
    $("#wardrobeContainer") ||
    document.querySelector(".wardrobe-grid");

  if (!container) return;

  if (!items.length) {
    container.innerHTML = `
      <div class="empty-wardrobe">
        <h3>Your wardrobe is empty</h3>
        <p>Upload your first clothing item to start.</p>
      </div>
    `;

    return;
  }

  container.innerHTML = items
    .map(item => `
      <article
        class="wardrobe-card"
        data-id="${item.id}"
      >

        <div class="wardrobe-image">
          <img
            src="${item.image}"
            alt="${escapeHTML(item.name)}"
          >
        </div>

        <div class="wardrobe-info">

          <h3>
            ${escapeHTML(item.name)}
          </h3>

          <p>
            ${escapeHTML(item.category)}
          </p>

          <p>
            ${escapeHTML(item.color)}
          </p>

          <p>
            ${escapeHTML(item.brand)}
          </p>

          <p>
            ${escapeHTML(item.occasion)}
          </p>

          <div class="wardrobe-actions">

            <button
              data-action="edit"
              data-id="${item.id}"
            >
              Edit
            </button>

            <button
              data-action="delete"
              data-id="${item.id}"
            >
              Delete
            </button>

          </div>

        </div>

      </article>
    `)
    .join("");
}


/* =========================================================
   EDIT EXISTING ITEM
   ========================================================= */

function editItem(id) {
  const item =
    state.wardrobe.find(item => item.id === id);

  if (!item) return;

  state.currentItem = {
    ...item
  };

  displayAnalysis(state.currentItem);

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   DELETE ITEM
   ========================================================= */

function deleteItem(id) {
  const confirmed =
    window.confirm(
      "Delete this item from your wardrobe?"
    );

  if (!confirmed) return;

  state.wardrobe =
    state.wardrobe.filter(
      item => item.id !== id
    );

  saveWardrobe();

  renderWardrobe();

  updateStats();

  showMessage("Item deleted.");
}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {
  const searchInput =
    $("#searchInput") ||
    document.querySelector(
      'input[placeholder*="Search"], input[type="search"]'
    );

  if (!searchInput) return;

  searchInput.addEventListener("input", () => {
    const query =
      searchInput.value.toLowerCase().trim();

    if (!query) {
      renderWardrobe();
      return;
    }

    const filtered =
      state.wardrobe.filter(item =>
        [
          item.name,
          item.category,
          item.color,
          item.brand,
          item.occasion
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
      );

    renderWardrobe(filtered);
  });
}


/* =========================================================
   FILTERS
   ========================================================= */

function setupFilters() {
  document.addEventListener("click", event => {
    const filterButton =
      event.target.closest("[data-filter]");

    if (!filterButton) return;

    const filter =
      filterButton.dataset.filter;

    if (filter === "all") {
      renderWardrobe();
      return;
    }

    const filtered =
      state.wardrobe.filter(item =>
        item.category.toLowerCase() ===
        filter.toLowerCase()
      );

    renderWardrobe(filtered);
  });
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {
  document.addEventListener("click", event => {
    const button =
      event.target.closest("[data-section]");

    if (!button) return;

    const section =
      button.dataset.section;

    showSection(section);
  });
}


function showSection(sectionName) {
  $all("[data-page]").forEach(page => {
    page.style.display =
      page.dataset.page === sectionName
        ? "block"
        : "none";
  });

  $all("[data-section]").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.section === sectionName
    );
  });
}


/* =========================================================
   OUTFIT GENERATOR
   ========================================================= */

function setupOutfitGenerator() {
  const generateButton =
    $("#generateOutfit") ||
    document.querySelector(
      '[data-action="generate-outfit"]'
    );

  if (!generateButton) return;

  generateButton.addEventListener(
    "click",
    generateOutfit
  );
}


function generateOutfit() {
  const shirts =
    state.wardrobe.filter(item =>
      ["Shirt", "T-Shirt"].includes(item.category)
    );

  const pants =
    state.wardrobe.filter(item =>
      item.category === "Pants"
    );

  const shoes =
    state.wardrobe.filter(item =>
      item.category === "Shoes"
    );

  const accessories =
    state.wardrobe.filter(item =>
      item.category === "Accessory"
    );

  if (!shirts.length || !pants.length) {
    showMessage(
      "Add at least one top and one pair of pants first."
    );

    return;
  }

  const top =
    randomItem(shirts);

  const bottom =
    randomItem(pants);

  const shoe =
    shoes.length
      ? randomItem(shoes)
      : null;

  const accessory =
    accessories.length
      ? randomItem(accessories)
      : null;

  const outfit = {
    id: createId(),
    top,
    bottom,
    shoe,
    accessory,
    createdAt: new Date().toISOString()
  };

  state.outfits.unshift(outfit);

  state.outfits =
    state.outfits.slice(0, 20);

  localStorage.setItem(
    "styleSynthOutfits",
    JSON.stringify(state.outfits)
  );

  displayGeneratedOutfit(outfit);
  renderOutfits();
}


function displayGeneratedOutfit(outfit) {
  const container =
    $("#generatedOutfit") ||
    document.querySelector(".generated-outfit");

  if (!container) return;

  container.innerHTML = `
    <div class="outfit-result">

      <h2>Your Outfit</h2>

      ${outfitItemHTML(outfit.top)}

      ${outfitItemHTML(outfit.bottom)}

      ${
        outfit.shoe
          ? outfitItemHTML(outfit.shoe)
          : ""
      }

      ${
        outfit.accessory
          ? outfitItemHTML(outfit.accessory)
          : ""
      }

      <p>
        Style: ${escapeHTML(
          outfitStyleName(outfit)
        )}
      </p>

    </div>
  `;
}


function outfitItemHTML(item) {
  return `
    <div class="outfit-item">

      <img
        src="${item.image}"
        alt="${escapeHTML(item.name)}"
      >

      <div>
        <strong>
          ${escapeHTML(item.name)}
        </strong>

        <span>
          ${escapeHTML(item.color)}
        </span>

        <small>
          ${escapeHTML(item.category)}
        </small>
      </div>

    </div>
  `;
}


function outfitStyleName(outfit) {
  const colors = [
    outfit.top.color,
    outfit.bottom.color,
    outfit.shoe?.color
  ]
    .filter(Boolean)
    .map(c => c.toLowerCase());

  if (
    colors.includes("black") &&
    colors.includes("white")
  ) {
    return "Clean monochrome";
  }

  if (
    colors.includes("blue") &&
    colors.includes("white")
  ) {
    return "Fresh casual";
  }

  return "Smart casual";
}


function renderOutfits() {
  const container =
    $("#outfitHistory") ||
    document.querySelector(".outfit-history");

  if (!container) return;

  if (!state.outfits.length) {
    container.innerHTML = `
      <p>No saved outfits yet.</p>
    `;

    return;
  }

  container.innerHTML =
    state.outfits
      .map(outfit => `
        <div class="saved-outfit">

          <div>
            <img
              src="${outfit.top.image}"
              alt=""
            >
          </div>

          <div>
            <img
              src="${outfit.bottom.image}"
              alt=""
            >
          </div>

          ${
            outfit.shoe
              ? `
                <div>
                  <img
                    src="${outfit.shoe.image}"
                    alt=""
                  >
                </div>
              `
              : ""
          }

          <strong>
            ${escapeHTML(
              outfitStyleName(outfit)
            )}
          </strong>

        </div>
      `)
      .join("");
}


/* =========================================================
   STATISTICS
   ========================================================= */

function updateStats() {
  const total =
    $("#totalItems") ||
    $("#wardrobeCount");

  const tops =
    $("#topCount");

  const bottoms =
    $("#bottomCount");

  const shoes =
    $("#shoeCount");

  if (total) {
    total.textContent =
      state.wardrobe.length;
  }

  if (tops) {
    tops.textContent =
      state.wardrobe.filter(item =>
        ["Shirt", "T-Shirt"].includes(
          item.category
        )
      ).length;
  }

  if (bottoms) {
    bottoms.textContent =
      state.wardrobe.filter(item =>
        item.category === "Pants"
      ).length;
  }

  if (shoes) {
    shoes.textContent =
      state.wardrobe.filter(item =>
        item.category === "Shoes"
      ).length;
  }
}


/* =========================================================
   UTILITIES
   ========================================================= */

function randomItem(array) {
  return array[
    Math.floor(
      Math.random() * array.length
    )
  ];
}


function showMessage(message) {
  let messageBox =
    $("#appMessage");

  if (!messageBox) {
    messageBox =
      document.createElement("div");

    messageBox.id = "appMessage";

    document.body.appendChild(messageBox);
  }

  messageBox.textContent = message;

  messageBox.classList.add("visible");

  clearTimeout(
    showMessage.timeout
  );

  showMessage.timeout =
    setTimeout(() => {
      messageBox.classList.remove(
        "visible"
      );
    }, 2500);
}


function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================================================
   DRAG & DROP
   ========================================================= */

document.addEventListener(
  "dragover",
  event => {
    const dropZone =
      event.target.closest(
        ".upload-area, .drop-zone"
      );

    if (!dropZone) return;

    event.preventDefault();

    dropZone.classList.add(
      "dragging"
    );
  }
);


document.addEventListener(
  "dragleave",
  event => {
    const dropZone =
      event.target.closest(
        ".upload-area, .drop-zone"
      );

    if (!dropZone) return;

    dropZone.classList.remove(
      "dragging"
    );
  }
);


document.addEventListener(
  "drop",
  event => {
    const dropZone =
      event.target.closest(
        ".upload-area, .drop-zone"
      );

    if (!dropZone) return;

    event.preventDefault();

    dropZone.classList.remove(
      "dragging"
    );

    const files =
      event.dataTransfer.files;

    if (!files.length) return;

    const file = files[0];

    if (
      !file.type.startsWith("image/")
    ) {
      showMessage(
        "Please drop an image file."
      );

      return;
    }

    const reader =
      new FileReader();

    reader.onload = function () {
      state.currentImage =
        reader.result;

      showUploadedImage(
        reader.result
      );

      analyzeImage(
        reader.result,
        file.name
      );
    };

    reader.readAsDataURL(file);
  }
);


/* =========================================================
   KEYBOARD ACCESSIBILITY
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {
    if (
      event.key === "Escape"
    ) {
      closeEditor();
    }
  }
);


function closeEditor() {
  const editor =
    $("#editControls");

  if (editor) {
    editor.innerHTML = "";
  }

  state.editingItemId = null;
}


/* =========================================================
   EXPORT WARDROBE
   ========================================================= */

function exportWardrobe() {
  const data =
    JSON.stringify(
      state.wardrobe,
      null,
      2
    );

  const blob =
    new Blob(
      [data],
      {
        type: "application/json"
      }
    );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    "style-synth-wardrobe.json";

  link.click();

  URL.revokeObjectURL(url);
}


/* =========================================================
   IMPORT WARDROBE
   ========================================================= */

function importWardrobe(file) {
  if (!file) return;

  const reader =
    new FileReader();

  reader.onload = function () {
    try {
      const imported =
        JSON.parse(
          reader.result
        );

      if (!Array.isArray(imported)) {
        throw new Error(
          "Invalid wardrobe"
        );
      }

      state.wardrobe =
        imported;

      saveWardrobe();

      renderWardrobe();

      updateStats();

      showMessage(
        "Wardrobe imported successfully."
      );
    } catch (error) {
      showMessage(
        "The wardrobe file is not valid."
      );
    }
  };

  reader.readAsText(file);
}


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.StyleSynth = {
  state,

  addItem: addToWardrobe,

  deleteItem,

  editItem,

  generateOutfit,

  exportWardrobe,

  importWardrobe,

  analyzeImage,

  renderWardrobe
};

console.log(
  "Style Synth AI — Ready."
);
