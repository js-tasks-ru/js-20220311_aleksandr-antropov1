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
        ? `<span data-element="arrow" class="sortable-table__sort-arrow"> <span class="sort-arrow"></span> </span>`
        : "";

      return `
      <div class="sortable-table__cell" data-id="${column.id}" data-sortable="${column.sortable}" ${dataOrder}>
        <span>${column.title}</span>
        ${sortArrow}
      </div>`;
    });

    return result.join("");
  }

  get body() {
    let body = "";

    for (const row of this.sortedData) {
      const result = this.headerConfig.map((column) => {
        const renderFn = column.template;

        if (typeof renderFn === "function") {
          return renderFn(row[column.id]);
        } else {
          return `<div class='sortable-table__cell'>${row[column.id]}</div>`;
        }
      });

      body += `
        <div class="sortable-table__row">
          ${result.join("")}
        </div>`;
    }

    return body;
  }

  get template() {
    return `
    <div class="sortable-table">
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

    return (a, b) => {
      let result = 0;

      if (sortType === "number" || sortType === "date") {
        result = a[this.sortField] - b[this.sortField];
      } else if (sortType === "string") {
        result = a[this.sortField].localeCompare(
          b[this.sortField],
          ["ru", "en"],
          {
            caseFirst: "upper",
          }
        );
      }

      return result * (this.sortDirection === "asc" ? 1 : -1);
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
