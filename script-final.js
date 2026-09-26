"use strict";

document.addEventListener("DOMContentLoaded", function () {

  // =========================
  // APP STATE
  // =========================

  let wardrobe = JSON.parse(
    localStorage.getItem("styleSynthWardrobe") || "[]"
  );

  let outfits = JSON.parse(
    localStorage.getItem("styleSynthOutfits") || "[]"
  );

  let currentImage = null;
  let currentItem = null;
  let currentFilter = "all";


  // =========================
  // ELEMENTS
  // =========================

  const imageInput = document.getElementById("imageInput");
  const imagePreview = document.getElementById("imagePreview");
  const imagePreviewContainer =
    document.getElementById("imagePreviewContainer");

  const uploadArea = document.getElementById("uploadArea");
  const analyzeButton = document.getElementById("analyzeButton");
  const removeImage = document.getElementById("removeImage");

  const analysisCard = document.getElementById("analysisCard");

  const detectedCategory =
    document.getElementById("detectedCategory");

  const detectedColor =
    document.getElementById("detectedColor");

  const detectedBrand =
    document.getElementById("detectedBrand");

  const detectedOccasion =
    document.getElementById("detectedOccasion");

  const editControls =
    document.getElementById("editControls");

  const editItem =
    document.getElementById("editItem");

  const addToWardrobe =
    document.getElementById("addToWardrobe");

  const saveEdit =
    document.getElementById("saveEdit");

  const cancelEdit =
    document.getElementById("cancelEdit");

  const editCategory =
    document.getElementById("editCategory");

  const editColor =
    document.getElementById("editColor");

  const editBrand =
    document.getElementById("editBrand");

  const editOccasion =
    document.getElementById("editOccasion");

  const wardrobeGrid =
    document.getElementById("wardrobeGrid");

  const wardrobeEmpty =
    document.getElementById("wardrobeEmpty");

  const searchInput =
    document.getElementById("searchInput");

  const generateOutfit =
    document.getElementById("generateOutfit");

  const generatedOutfit =
    document.getElementById("generatedOutfit");

  const outfitHistory =
    document.getElementById("outfitHistory");

  const totalItems =
    document.getElementById("totalItems");

  const topCount =
    document.getElementById("topCount");

  const bottomCount =
    document.getElementById("bottomCount");

  const shoeCount =
    document.getElementById("shoeCount");

  const appMessage =
    document.getElementById("appMessage");


  // =========================
  // MESSAGE
  // =========================

  function showMessage(message) {

    if (!appMessage) return;

    appMessage.textContent = message;
    appMessage.classList.add("show");

    setTimeout(function () {
      appMessage.classList.remove("show");
    }, 2500);
  }


  // =========================
  // SAVE DATA
  // =========================

  function saveWardrobe() {

    localStorage.setItem(
      "styleSynthWardrobe",
      JSON.stringify(wardrobe)
    );

  }


  function saveOutfits() {

    localStorage.setItem(
      "styleSynthOutfits",
      JSON.stringify(outfits)
    );

  }


  // =========================
  // NAVIGATION
  // =========================

  function showSection(sectionName) {

    const sections =
      document.querySelectorAll(".page-section");

    sections.forEach(function (section) {

      section.classList.remove("active-section");

    });


    const selectedSection =
      document.getElementById(sectionName);

    if (selectedSection) {

      selectedSection.classList.add(
        "active-section"
      );

    }


    const navButtons =
      document.querySelectorAll(".nav-button");

    navButtons.forEach(function (button) {

      button.classList.remove("active");

      if (
        button.dataset.section === sectionName
      ) {

        button.classList.add("active");

      }

    });


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });


    if (sectionName === "wardrobe") {
      renderWardrobe();
    }

    if (sectionName === "outfits") {
      renderOutfitHistory();
    }

  }


  document
    .querySelectorAll(".nav-button")
    .forEach(function (button) {

      button.addEventListener(
        "click",
        function () {

          showSection(
            button.dataset.section
          );

        }
      );

    });


  // =========================
  // QUICK ACTIONS
  // =========================

  document
    .querySelectorAll("[data-action]")
    .forEach(function (button) {

      button.addEventListener(
        "click",
        function () {

          const action =
            button.dataset.action;

          if (action === "upload") {

            if (imageInput) {
              imageInput.click();
            }

          }

          if (action === "wardrobe") {

            showSection("wardrobe");

          }

          if (action === "outfits") {

            showSection("outfits");

          }

        }
      );

    });


  // =========================
  // IMAGE UPLOAD
  // =========================

  if (imageInput) {

    imageInput.addEventListener(
      "change",
      function (event) {

        const file =
          event.target.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {

          showMessage(
            "Please select an image."
          );

          return;

        }

        const reader =
          new FileReader();

        reader.onload = function (e) {

          currentImage =
            e.target.result;

          if (imagePreview) {

            imagePreview.src =
              currentImage;

          }

          if (imagePreviewContainer) {

            imagePreviewContainer.hidden =
              false;

          }

          if (analysisCard) {

            analysisCard.hidden =
              true;

          }

          showMessage(
            "Photo selected successfully."
          );

        };

        reader.readAsDataURL(file);

      }
    );

  }


  // =========================
  // REMOVE IMAGE
  // =========================

  if (removeImage) {

    removeImage.addEventListener(
      "click",
      function () {

        currentImage = null;
        currentItem = null;

        if (imageInput) {
          imageInput.value = "";
        }

        if (imagePreview) {
          imagePreview.src = "";
        }

        if (imagePreviewContainer) {
          imagePreviewContainer.hidden = true;
        }

        if (analysisCard) {
          analysisCard.hidden = true;
        }

      }
    );

  }


  // =========================
  // COLOR DETECTION
  // =========================

  function detectColor(imageSrc) {

    return new Promise(function (resolve) {

      const img = new Image();

      img.onload = function () {

        const canvas =
          document.createElement("canvas");

        const ctx =
          canvas.getContext("2d");

        canvas.width = 1;
        canvas.height = 1;

        ctx.drawImage(
          img,
          0,
          0,
          1,
          1
        );

        const pixel =
          ctx.getImageData(
            0,
            0,
            1,
            1
          ).data;

        const r = pixel[0];
        const g = pixel[1];
        const b = pixel[2];

        const brightness =
          (r + g + b) / 3;

        let color = "Mixed";

        if (
          brightness < 45
        ) {

          color = "Black";

        } else if (
          brightness > 220 &&
          Math.abs(r - g) < 15 &&
          Math.abs(g - b) < 15
        ) {

          color = "White";

        } else if (
          r > g * 1.4 &&
          r > b * 1.3
        ) {

          color = "Red";

        } else if (
          g > r * 1.25 &&
          g > b * 1.15
        ) {

          color = "Green";

        } else if (
          b > r * 1.25 &&
          b > g * 1.05
        ) {

          color = "Blue";

        } else if (
          r > 150 &&
          g > 100 &&
          b < 100
        ) {

          color = "Yellow";

        } else if (
          r > 100 &&
          g > 70 &&
          b < 80
        ) {

          color = "Brown";

        } else if (
          r > 100 &&
          b > 100 &&
          g < 100
        ) {

          color = "Purple";

        } else if (
          brightness < 130
        ) {

          color = "Dark";

        } else {

          color = "Neutral";

        }

        resolve(color);

      };


      img.onerror = function () {

        resolve("Unknown");

      };


      img.src = imageSrc;

    });

  }


  // =========================
  // CATEGORY DETECTION
  // =========================

  function detectCategory(filename) {

    const name =
      filename.toLowerCase();

    if (
      name.includes("shoe") ||
      name.includes("sneaker") ||
      name.includes("boot")
    ) {

      return "shoes";

    }

    if (
      name.includes("pant") ||
      name.includes("jean") ||
      name.includes("trouser") ||
      name.includes("cargo")
    ) {

      return "bottom";

    }

    if (
      name.includes("jacket") ||
      name.includes("coat") ||
      name.includes("hoodie")
    ) {

      return "outerwear";

    }

    if (
      name.includes("watch") ||
      name.includes("belt") ||
      name.includes("bag") ||
      name.includes("cap") ||
      name.includes("hat") ||
      name.includes("glass")
    ) {

      return "accessory";

    }

    if (
      name.includes("dress")
    ) {

      return "dress";

    }

    return "top";

  }


  // =========================
  // BRAND DETECTION
  // =========================

  function detectBrand(filename) {

    const name =
      filename.toLowerCase();

    const brands = [
      "nike",
      "adidas",
      "puma",
      "zara",
      "h&m",
      "hm",
      "uniqlo",
      "levis",
      "levi",
      "gucci",
      "prada",
      "tommy",
      "louis",
      "zudio",
      "hrx",
      "roadster",
      "max",
      "gap",
      "reebok",
      "fila"
    ];


    for (
      let i = 0;
      i < brands.length;
      i++
    ) {

      if (name.includes(brands[i])) {

        return brands[i]
          .toUpperCase();

      }

    }


    return "Unknown";

  }


  // =========================
  // OCCASION
  // =========================

  function suggestOccasion(category) {

    if (category === "shoes") {

      return "Casual";

    }

    if (category === "outerwear") {

      return "Casual";

    }

    if (category === "accessory") {

      return "Everyday";

    }

    if (category === "bottom") {

      return "College";

    }

    return "Casual";

  }


  // =========================
  // ANALYZE
  // =========================

  if (analyzeButton) {

    analyzeButton.addEventListener(
      "click",
      async function () {

        if (!currentImage) {

          showMessage(
            "Please select an image first."
          );

          return;

        }


        analyzeButton.disabled = true;

        analyzeButton.textContent =
          "Analyzing...";


        const file =
          imageInput.files[0];

        const filename =
          file ? file.name : "clothing";


        const category =
          detectCategory(filename);

        const brand =
          detectBrand(filename);

        const color =
          await detectColor(currentImage);

        const occasion =
          suggestOccasion(category);


        currentItem = {

          id: Date.now(),

          image: currentImage,

          category: category,

          color: color,

          brand: brand,

          occasion: occasion,

          createdAt:
            new Date().toISOString()

        };


        if (detectedCategory) {

          detectedCategory.textContent =
            formatCategory(category);

        }

        if (detectedColor) {

          detectedColor.textContent =
            color;

        }

        if (detectedBrand) {

          detectedBrand.textContent =
            brand;

        }

        if (detectedOccasion) {

          detectedOccasion.textContent =
            occasion;

        }

        if (analysisCard) {

          analysisCard.hidden = false;

        }


        analyzeButton.disabled = false;

        analyzeButton.textContent =
          "✨ Analyze Item";


        showMessage(
          "Analysis complete."
        );

      }
    );

  }


  // =========================
  // FORMAT CATEGORY
  // =========================

  function formatCategory(category) {

    const names = {

      top: "Shirt / Top",

      bottom: "Pants / Bottom",

      shoes: "Shoes",

      accessory: "Accessory",

      outerwear: "Outerwear",

      dress: "Dress",

      other: "Other"

    };

    return names[category] ||
      "Shirt / Top";

  }


  // =========================
  // EDIT
  // =========================

  if (editItem) {

    editItem.addEventListener(
      "click",
      function () {

        if (!currentItem) {

          showMessage(
            "Analyze an item first."
          );

          return;

        }


        editCategory.value =
          currentItem.category;

        editColor.value =
          currentItem.color;

        editBrand.value =
          currentItem.brand;

        editOccasion.value =
          currentItem.occasion;


        editControls.hidden =
          false;

      }
    );

  }


  // =========================
  // SAVE EDIT
  // =========================

  if (saveEdit) {

    saveEdit.addEventListener(
      "click",
      function () {

        if (!currentItem) return;


        currentItem.category =
          editCategory.value;

        currentItem.color =
          editColor.value ||
          "Unknown";

        currentItem.brand =
          editBrand.value ||
          "Unknown";

        currentItem.occasion =
          editOccasion.value;


        detectedCategory.textContent =
          formatCategory(
            currentItem.category
          );

        detectedColor.textContent =
          currentItem.color;

        detectedBrand.textContent =
          currentItem.brand;

        detectedOccasion.textContent =
          currentItem.occasion;


        editControls.hidden =
          true;


        showMessage(
          "Changes saved."
        );

      }
    );

  }


  // =========================
  // CANCEL EDIT
  // =========================

  if (cancelEdit) {

    cancelEdit.addEventListener(
      "click",
      function () {

        editControls.hidden =
          true;

      }
    );

  }


  // =========================
  // ADD TO WARDROBE
  // =========================

  if (addToWardrobe) {

    addToWardrobe.addEventListener(
      "click",
      function () {

        if (!currentItem) {

          showMessage(
            "Analyze an item first."
          );

          return;

        }


        const item = {
          ...currentItem
        };


        wardrobe.push(item);

        saveWardrobe();

        updateStats();

        renderWardrobe();


        showMessage(
          "Item added to your wardrobe!"
        );

      }
    );

  }


  // =========================
  // RENDER WARDROBE
  // =========================

  function renderWardrobe() {

    if (!wardrobeGrid) return;


    const searchTerm =
      searchInput
        ? searchInput.value
            .toLowerCase()
            .trim()
        : "";


    let items =
      wardrobe.filter(function (item) {

        const matchesFilter =
          currentFilter === "all" ||
          item.category === currentFilter;


        const text =
          (
            item.category +
            " " +
            item.color +
            " " +
            item.brand +
            " " +
            item.occasion
          ).toLowerCase();


        const matchesSearch =
          !searchTerm ||
          text.includes(searchTerm);


        return (
          matchesFilter &&
          matchesSearch
        );

      });


    wardrobeGrid.innerHTML = "";


    if (
      wardrobeEmpty
    ) {

      wardrobeEmpty.style.display =
        items.length === 0
          ? "block"
          : "none";

    }


    items.forEach(function (item) {

      const card =
        document.createElement("div");

      card.className =
        "wardrobe-item";


      card.innerHTML = `

        <div class="wardrobe-image-wrapper">

          <img
            src="${item.image}"
            alt="${formatCategory(item.category)}"
            class="wardrobe-image"
          >

        </div>

        <div class="wardrobe-item-info">

          <span class="item-category">
            ${formatCategory(item.category)}
          </span>

          <h4>
            ${item.color}
          </h4>

          <p>
            ${item.brand}
          </p>

          <small>
            ${item.occasion}
          </small>

        </div>

        <button
          class="delete-item"
          data-id="${item.id}"
          type="button"
        >
          🗑️
        </button>

      `;


      wardrobeGrid.appendChild(card);

    });


    document
      .querySelectorAll(".delete-item")
      .forEach(function (button) {

        button.addEventListener(
          "click",
          function () {

            const id =
              Number(button.dataset.id);

            wardrobe =
              wardrobe.filter(
                function (item) {
                  return item.id !== id;
                }
              );

            saveWardrobe();

            updateStats();

            renderWardrobe();

            showMessage(
              "Item removed."
            );

          }
        );

      });

  }


  // =========================
  // SEARCH
  // =========================

  if (searchInput) {

    searchInput.addEventListener(
      "input",
      function () {

        renderWardrobe();

      }
    );

  }


  // =========================
  // FILTERS
  // =========================

  document
    .querySelectorAll(".filter-button")
    .forEach(function (button) {

      button.addEventListener(
        "click",
        function () {

          document
            .querySelectorAll(
              ".filter-button"
            )
            .forEach(function (btn) {

              btn.classList.remove(
                "active"
              );

            });


          button.classList.add("active");


          currentFilter =
            button.dataset.filter;


          renderWardrobe();

        }
      );

    });


  // =========================
  // STATS
  // =========================

  function updateStats() {

    if (totalItems) {

      totalItems.textContent =
        wardrobe.length;

    }


    if (topCount) {

      topCount.textContent =
        wardrobe.filter(
          function (item) {
            return item.category === "top";
          }
        ).length;

    }


    if (bottomCount) {

      bottomCount.textContent =
        wardrobe.filter(
          function (item) {
            return item.category === "bottom";
          }
        ).length;

    }


    if (shoeCount) {

      shoeCount.textContent =
        wardrobe.filter(
          function (item) {
            return item.category === "shoes";
          }
        ).length;

    }

  }


  // =========================
  // GENERATE OUTFIT
  // =========================

  if (generateOutfit) {

    generateOutfit.addEventListener(
      "click",
      function () {

        if (wardrobe.length < 2) {

          showMessage(
            "Add at least 2 clothing items first."
          );

          return;

        }


        const tops =
          wardrobe.filter(
            item =>
              item.category === "top"
          );


        const bottoms =
          wardrobe.filter(
            item =>
              item.category === "bottom"
          );


        const shoes =
          wardrobe.filter(
            item =>
              item.category === "shoes"
          );


        const outfit = [];


        if (tops.length) {

          outfit.push(
            randomItem(tops)
          );

        }


        if (bottoms.length) {

          outfit.push(
            randomItem(bottoms)
          );

        }


        if (shoes.length) {

          outfit.push(
            randomItem(shoes)
          );

        }


        if (outfit.length < 2) {

          showMessage(
            "Add a top and bottom to generate a full outfit."
          );

          return;

        }


        const newOutfit = {

          id: Date.now(),

          items: outfit,

          createdAt:
            new Date().toISOString()

        };


        outfits.unshift(
          newOutfit
        );

        saveOutfits();

        displayGeneratedOutfit(
          newOutfit
        );

        renderOutfitHistory();


        showMessage(
          "Outfit generated!"
        );

      }
    );

  }


  // =========================
  // RANDOM ITEM
  // =========================

  function randomItem(items) {

    return items[
      Math.floor(
        Math.random() *
        items.length
      )
    ];

  }


  // =========================
  // DISPLAY OUTFIT
  // =========================

  function displayGeneratedOutfit(
    outfit
  ) {

    if (!generatedOutfit) return;


    generatedOutfit.innerHTML = `

      <div class="card">

        <div class="card-header">

          <div>

            <span class="section-label">
              YOUR LOOK
            </span>

            <h3>
              Generated Outfit
            </h3>

          </div>

        </div>


        <div class="generated-items">

          ${outfit.items
            .map(
              item => `

                <div class="generated-item">

                  <img
                    src="${item.image}"
                    alt="${formatCategory(item.category)}"
                  >

                  <strong>
                    ${item.color}
                  </strong>

                  <span>
                    ${formatCategory(item.category)}
                  </span>

                </div>

              `
            )
            .join("")}

        </div>

      </div>

    `;

  }


  // =========================
  // OUTFIT HISTORY
  // =========================

  function renderOutfitHistory() {

    if (!outfitHistory) return;


    outfitHistory.innerHTML = "";


    if (!outfits.length) {

      outfitHistory.innerHTML = `

        <div class="empty-state">

          <div class="empty-icon">
            ✨
          </div>

          <h3>
            No outfits yet
          </h3>

          <p>
            Generate your first outfit above.
          </p>

        </div>

      `;

      return;

    }


    outfits.forEach(function (outfit) {

      const card =
        document.createElement("div");

      card.className =
        "history-outfit";


      card.innerHTML = `

        <div class="history-items">

          ${outfit.items
            .map(
              item => `

                <img
                  src="${item.image}"
                  alt="${formatCategory(item.category)}"
                >

              `
            )
            .join("")}

        </div>

        <div>

          <strong>
            Outfit
          </strong>

          <p>
            ${outfit.items.length} items
          </p>

        </div>

      `;


      outfitHistory.appendChild(card);

    });

  }


  // =========================
  // INITIALIZE
  // =========================

  updateStats();

  renderWardrobe();

  renderOutfitHistory();

  showSection("home");


  console.log(
    "Style Synth AI loaded successfully."
  );

});
