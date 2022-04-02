class Tooltip {
  offset = {
    x: 5,
    y: 5,
  };

  static instance = null;

  constructor() {
    if (Tooltip.instance) return Tooltip.instance;

    Tooltip.instance = this;
  }

  initialize() {
    let textWithTooltip;

    document.addEventListener("pointerover", (event) => {
      textWithTooltip = event.target.closest("[data-tooltip]");

      if (textWithTooltip) {
        this.render(textWithTooltip.dataset.tooltip);

        this.element.style.position = "absolute";

        textWithTooltip.onpointermove = (event) => {
          this.element.style.left = event.clientX + this.offset.x + "px";
          this.element.style.top = event.clientY + this.offset.y + "px";
        };
      }
    });

    document.addEventListener("pointerout", () => {
      if (textWithTooltip) {
        textWithTooltip.onpointermove = null;
        textWithTooltip = null;

        this.remove();
      }
    });
  }

  render(text = "") {
    const wrapper = document.createElement("div");

    wrapper.innerHTML = `<div class="tooltip">${text}</div>`;
    this.element = wrapper.firstElementChild;

    document.body.append(this.element);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    Tooltip.instance = null;
  }
}

export default Tooltip;
