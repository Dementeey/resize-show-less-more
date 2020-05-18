const width = {
  empty: 0,
};

export const setWidth = (num) => (width.empty = num);
export const getWidth = () => width.empty;

class Empty {
  _width;

  constructor(width = 0) {
    this._width = width;
  }

  get width() {
    return this._width;
  }

  set width(width) {
    this._width = width;
  }
}

export const empty = new Empty();

class OldWidth {
  _width;

  constructor(width = 0) {
    this._width = width;
  }

  get width() {
    return this._width;
  }

  set width(width) {
    this._width = width;
  }
}

export const oldWidth = new OldWidth();
