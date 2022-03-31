export default class SortableTable {
  subElements = {};

  constructor(headerConfig, { data = [], sorted = {} } = {}) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.sortedData = [...data];
    this.sorted = sorted;

    this.render();
  }

  getHeaderRow() {
    const result = this.headerConfig.map((column) => {
      return `<div class="sortable-table__cell" data-id="${column.id}" data-sortable="${column.sortable}">
        <span>${column.title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>`;
    });

    return result.join("");
  }

  getTableRows() {
    const rows = this.sortedData.map(
      (row) =>
        `<a href='/products/${
          row.id
        }' class='sortable-table__row'>${this.getTableRow(row)}</a>`
    );

    return rows.join("");
  }

  getTableRow(row) {
    const columns = this.headerConfig.map((column) => {
      const value = row[column.id];
      const renderFn =
        column.template ??
        ((value) => `<div class='sortable-table__cell'>${value}</div>`);

      return renderFn(value);
    });

    return columns.join("");
  }

  get template() {
    return `<div class="sortable-table">
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.getHeaderRow()}
      </div>

      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows()}
      </div>
    </div>`;
  }

  get sortFn() {
    const colConfig = this.headerConfig.find(
      (col) => col.id === this.sorted.id
    );
    const sortType = colConfig?.sortType;
    const directions = {
      asc: 1,
      desc: -1,
    };
    const direction = directions[this.sorted.order];

    return (a, b) => {
      switch (sortType) {
        case "string":
          return (
            direction *
            a[this.sorted.id].localeCompare(b[this.sorted.id], ["ru", "en"], {
              caseFirst: "upper",
            })
          );
        default:
          return direction * (a[this.sorted.id] - b[this.sorted.id]);
      }
    };
  }

  sort(field, order) {
    this.sorted.id = field;
    this.sorted.order = order;

    this.sortedData.sort(this.sortFn);

    for (const child of this.subElements.header.children) {
      delete child.dataset.order;

      if (child.dataset.id === this.sorted.id) {
        child.dataset.order = this.sorted.order;
      }
    }

    this.subElements.body.innerHTML = this.getTableRows();
  }

  render() {
    const wrapper = document.createElement("div");

    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();

    this.sort(this.sorted.id, this.sorted.order);

    this.attachEvents();
  }

  attachEvents() {
    this.subElements.header.addEventListener("pointerdown", (event) => {
      const cell = event.target.closest(".sortable-table__cell");
      const { id, order, sortable } = cell.dataset;

      if (sortable === "false") return;

      const newOrder = this.getNewSortOrder(order);

      this.sort(id, newOrder);
    });
  }

  getNewSortOrder(prevOrder) {
    return prevOrder === "desc" ? "asc" : "desc";
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const elem of elements) {
      const name = elem.dataset.element;
      result[name] = elem;
    }

    return result;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.data = [];
    this.headerConfig = [];
  }
}
