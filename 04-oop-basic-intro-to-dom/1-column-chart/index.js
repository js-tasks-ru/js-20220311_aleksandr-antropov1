export default class ColumnChart {
  chartHeight = 50;

  constructor(options) {
    this.options = options;

    if (options) {
      const { data = [], label, link, value, formatHeading } = options;

      this.data = this._getColumnProps(data);
      this.label = label;
      this.value = formatHeading ? formatHeading(value) : value;
      this.link = link;
    }

    this.render();
  }

  destroy() {
    this.remove();
  }

  remove() {
    this.element.remove();
  }

  getTemplate() {
    if (!this.options) {
      return `<div class='column-chart_loading'></div>`;
    }

    return `<div class="column-chart" style="--chart-height: 50">
      <div class="column-chart__title">
        Total ${this.label}
        ${
          this.link !== undefined
            ? `<a href="${this.link}" class="column-chart__link">
              View all
            </a>`
            : ""
        }
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${
          this.value
        }</div>
        <div data-element="body" class="column-chart__chart">
          ${
            this.data.length === 0
              ? `<img src='charts-skeleton.svg' alt='No data' />`
              : this.data
                  .map(
                    ({ value, percent }) =>
                      `<div style="--value: ${value}" data-tooltip="${percent}"></div>`
                  )
                  .join("")
          }
        </div>
      </div>`;
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.childNodes[0];
  }

  update(data) {
    this.data = data;

    this.render();
  }

  _getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = 50 / maxValue;

    return data.map((item) => {
      return {
        percent: ((item / maxValue) * 100).toFixed(0) + "%",
        value: String(Math.floor(item * scale)),
      };
    });
  }
}
