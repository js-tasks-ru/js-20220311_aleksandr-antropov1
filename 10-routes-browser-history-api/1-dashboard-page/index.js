import RangePicker from "./components/range-picker/src/index.js";
import SortableTable from "./components/sortable-table/src/index.js";
import ColumnChart from "./components/column-chart/src/index.js";
import header from "./bestsellers-header.js";

import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru/";

export default class Page {
  subElements = {};

  constructor() {
    const monthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1));
    const today = new Date();

    this.createComponents(monthAgo, today);
  }

  getTemplate() {
    return `
    <div class="dashboard full-height flex-column">
      <div class="content__top-panel">
        <h2 class="page-title">Панель управления</h2>
        <div data-element='rangePicker'></div>
      </div>
      <div class="dashboard__charts">
        <div data-element='ordersChart'></div>
        <div data-element='salesChart'></div>
        <div data-element='customersChart'></div>
      </div>
      <h3 class="block-title">Лидеры продаж</h3>
        <div data-element='sortableTable'></div>
    </div>
    `;
  }

  render() {
    const wrapper = document.createElement("div");

    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);
    this.appendComponents(this.subElements);
    this.initEventListeners(this.rangePicker.element);

    return this.element;
  }

  createComponents(from, to) {
    this.rangePicker = new RangePicker({ from, to });

    this.ordersChart = new ColumnChart({
      label: "Заказы",
      link: "sales",
      url: "api/dashboard/orders",
      range: { from, to },
    });
    this.ordersChart.element.classList.add("dashboard__chart_orders");

    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
    this.salesChart = new ColumnChart({
      label: "Продажи",
      formatHeading: (data) => formatter.format(data),
      url: "api/dashboard/sales",
      range: { from, to },
    });
    this.salesChart.element.classList.add("dashboard__chart_sales");

    this.customersChart = new ColumnChart({
      label: "Клиенты",
      url: "api/dashboard/customers",
      range: { from, to },
    });
    this.customersChart.element.classList.add("dashboard__chart_customers");

    this.sortableTable = new SortableTable(header, {
      url: "api/dashboard/bestsellers",
      isSortLocally: true,
    });
  }

  appendComponents(subElements) {
    subElements.rangePicker.append(this.rangePicker.element);
    subElements.ordersChart.append(this.ordersChart.element);
    subElements.salesChart.append(this.salesChart.element);
    subElements.customersChart.append(this.customersChart.element);
    subElements.sortableTable.append(this.sortableTable.element);
  }

  initEventListeners(rangePickerElement) {
    rangePickerElement.addEventListener("date-select", async (event) => {
      const { from, to } = event.detail;

      this.ordersChart.update(from, to);
      this.salesChart.update(from, to);
      this.customersChart.update(from, to);
      this.updateTable(from, to);
    });
  }

  // Собственный метод для обновления таблицы
  async updateTable(from, to) {
    this.sortableTable.url.searchParams.set("from", from.toISOString());
    this.sortableTable.url.searchParams.set("to", to.toISOString());

    const data = await this.sortableTable.loadData(
      this.sortableTable.sorted.id,
      this.sortableTable.sorted.order
    );
    this.sortableTable.renderRows(data);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll("[data-element]");

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
