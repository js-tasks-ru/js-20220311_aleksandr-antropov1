export default class ColumnChart {
  subElements = {};
  chartHeight = 50;

  constructor({
    data = [],
    label = "",
    link = "",
    value = 0,
    formatHeading = (arg) => arg,
  } = {}) {
    this.data = data;
    this.label = label;
    this.value = formatHeading ? formatHeading(value) : value;
    this.link = link;
    console.log("c");
    this.render();
  }

  destroy() {
    this.element.remove();
    this.element = null;
    this.subElements = {};
  }

  remove() {
    this.element.remove();
  }

  get template() {
    return `<div class="column-chart column-chart_loading" style="--chart-height: ${
      this.chartHeight
    }">
      <div class="column-chart__title">
        Total ${this.label}
        ${this.getLink()}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${
          this.value
        }</div>
        <div data-element="body" class="column-chart__chart">
          ${this.getData()}
        </div>
      </div>`;
  }

  getLink() {
    if (!this.link) return "";

    return `<a href="${this.link}" class="column-chart__link">
      View all
    </a>`;
  }

  getData() {
    return this.getColumnProps(this.data)
      .map(
        ({ value, percent }) =>
          `<div style="--value: ${value}" data-tooltip="${percent}"></div>`
      )
      .join("");
  }

  render() {
    const wrapper = document.createElement("div");

    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;

    if (this.data.length > 0) {
      this.element.classList.remove("column-chart_loading");
    }

    this.subElements = this.getSubElements();
  }

  getSubElements() {
    const result = {};

    const subElements = this.element.querySelectorAll("[data-element]");

    for (let element of subElements) {
      const name = element.dataset.element;
      result[name] = element;
    }

    return result;
  }

  update(data) {
    this.data = data;

    this.subElements.body.innerHTML = this.getData();
  }

  getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;

    return data.map((item) => {
      return {
        percent: ((item / maxValue) * 100).toFixed(0) + "%",
        value: String(Math.floor(item * scale)),
      };
    });
  }
}
