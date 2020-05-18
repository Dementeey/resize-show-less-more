// optimizedResize with requestAnimationFrame + customEvent
// Support EI 11 (MDN example)

export const registerCustomEvents = () => {
  const throttle = (type, name, obj = window) => {
    let running = false;
    const func = () => {
      if (running) {
        return;
      }
      running = true;

      requestAnimationFrame(() => {
        obj.dispatchEvent(new CustomEvent(name));
        running = false;
      });
    };
    obj.addEventListener(type, func);
  };

  /* init - you can init any event */
  throttle("resize", "optimizedResize");
};
