const tableBody = document.querySelector("#product-table-body");
const searchInput = document.querySelector("#product-search");
const tableStatus = document.querySelector("#table-status");

let products = [];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (character === '"' && insideQuotes && nextCharacter === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      insideQuotes = !insideQuotes;
    } else if (character === "," && !insideQuotes) {
      row.push(value);
      value = "";
    } else if ((character === "\n" || character === "\r") && !insideQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }

      row.push(value);

      if (row.some((cell) => cell.trim() !== "")) {
        rows.push(row);
      }

      row = [];
      value = "";
    } else {
      value += character;
    }
  }

  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }

  return rows;
}

function createCell(value) {
  const cell = document.createElement("td");
  cell.textContent = value;
  return cell;
}

function renderProducts(items) {
  tableBody.replaceChildren();

  items.forEach((product) => {
    const row = document.createElement("tr");

    row.append(
      createCell(product.name),
      createCell(product.price),
      createCell(product.description),
      createCell(product.reviews)
    );

    tableBody.append(row);
  });

  tableStatus.textContent = `Showing ${items.length} of ${products.length} products.`;
}

async function loadProducts() {
  try {
    const response = await fetch("laptops.csv");

    if (!response.ok) {
      throw new Error(`Could not load dataset (${response.status}).`);
    }

    const csvText = await response.text();
    const rows = parseCsv(csvText.replace(/^\uFEFF/, ""));

    products = rows.slice(1).map((row) => ({
      name: row[0] ?? "",
      price: row[1] ?? "",
      description: row[2] ?? "",
      reviews: row[3] ?? "",
    }));

    renderProducts(products);
  } catch (error) {
    tableStatus.textContent = error.message;
  }
}

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    return `${product.name} ${product.description}`
      .toLowerCase()
      .includes(query);
  });

  renderProducts(filteredProducts);
});

loadProducts();
