export default class SortableTable {
  sortField = "";
  sortDirection = "";
  subElements = {};

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.sortedData = [...data];

    this.render();
  }

  get header() {
    const result = this.headerConfig.map((column) => {
      const dataOrder =
        this.sortField === column.id
          ? `data-order="${this.sortDirection}"`
          : "";

      const sortArrow = dataOrder
        ? `<span data-element="arrow" class="sortable-table__sort-arrow"><span class="sort-arrow"></span></span>`
        : "";

      return `<div class="sortable-table__cell" data-id="${column.id}" data-sortable="${column.sortable}" ${dataOrder}>
        <span>${column.title}</span>
        ${sortArrow}
      </div>`;
    });

    return result.join("");
  }

  get body() {
    const rows = this.sortedData.map((row) => this.getBodyRow(row));

    return rows.join("");
  }

  getBodyRow(row) {
    const columns = this.headerConfig.map((column) => {
      const value = row[column.id];
      const renderFn =
        column.template ??
        ((value) => `<div class='sortable-table__cell'>${value}</div>`);
      return renderFn(value);
    });

    return `<div class="sortable-table__row">
      ${columns.join("")}
    </div>`;
  }

  get template() {
    return `<div class="sortable-table">
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.header}
      </div>

      <div data-element="body" class="sortable-table__body">
        ${this.body}
      </div>
    </div>`;
  }

  get sortFn() {
    const colConfig = this.headerConfig.find(
      (col) => col.id === this.sortField
    );

    const sortType = colConfig?.sortType;

    const directions = {
      asc: 1,
      desc: -1,
    };

    const direction = directions[this.sortDirection];

    return (a, b) => {
      switch (sortType) {
        case "string":
          return (
            direction *
            a[this.sortField].localeCompare(b[this.sortField], ["ru", "en"], {
              caseFirst: "upper",
            })
          );
        default:
          return direction * (a[this.sortField] - b[this.sortField]);
      }
    };
  }

  sort(field = "", direction = "") {
    if (!field || !direction) return;

    this.sortField = field;
    this.sortDirection = direction;

    this.sortedData.sort(this.sortFn);

    this.subElements.header.innerHTML = this.header;
    this.subElements.body.innerHTML = this.body;
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();
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
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
    this.data = [];
    this.headerConfig = [];
  }
}
