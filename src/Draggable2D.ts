
export type Draggable2DUpdateArg = Partial<{
  deltaTime: number | 'guess'
}>;

const limited = (x: number, limit: number) => (x * limit) / (x + limit);

const limitedClamp = (x: number, limit: number, min: number, max: number) => {
  if (x < min) {
    return min - limited(min - x, limit);
  }
  if (x > max) {
    return max + limited(x - max, limit);
  }
  return x;
}

export class Draggable2D {

  private _time = Date.now();
  private _timeOld = Date.now();
  private _deltaTime = 0;
  private _x = 0;;
  private _y = 0;
  private _clampedX = 0;
  private _clampedY = 0;
  private _margin = 20;
  private _minX = -Infinity;
  private _minY = -Infinity;
  private _maxX = Infinity;
  private _maxY = Infinity;
  private _dx = 0;
  private _dy = 0;
  private _dragged = false;
  private _inertia = .001;

  update({
    deltaTime = 'guess',
  }: Draggable2DUpdateArg = {}) {

    this._timeOld = this._time;

    if (deltaTime === 'guess') {
      this._time = Date.now() / 1000;
      this._deltaTime = this._time - this._timeOld;
    }
    else {
      this._deltaTime = deltaTime;
      this._time += deltaTime;
    }

    if (this._deltaTime > 0) {
      this._x += this._dx;
      this._y += this._dy;

      if (this._dragged) {
        this._clampedX = limitedClamp(this._x, this._margin, this._minX, this._maxX);
        this._clampedY = limitedClamp(this._y, this._margin, this._minY, this._maxY);
      } 
      else {
        if (this._clampedX < this._minX) {
          this._clampedX += (this._minX - this._clampedX) * .2;
          this._x = this._clampedX;
        }
        else if (this._clampedX > this._maxX) {
          this._clampedX += (this._maxX - this._clampedX) * .2;
          this._x = this._clampedX;
        }
        else {
          this._clampedX = this._x;
        }

        if (this._clampedY < this._minY) {
          this._clampedY += (this._minY - this._clampedY) * .2;
          this._y = this._clampedY;
        }
        else if (this._clampedY > this._maxY) {
          this._clampedY += (this._maxY - this._clampedY) * .2;
          this._y = this._clampedY;
        }
        else {
          this._clampedY = this._y;
        }
      }

      if (this._dragged === false) {
        const di = this._inertia ** this._deltaTime;
        this._dx = this._dx * di;
        this._dy = this._dy * di;
      }
    }
  }

  setMin(minX: number, minY: number) {
    this._minX = minX;
    this._minY = minY;
    return this;
  }

  setMax(maxX: number, maxY: number) {
    this._maxX = maxX;
    this._maxY = maxY;
    return this;
  }

  setMinMax(minX: number, minY: number, maxX: number, maxY: number) {
    return this.setMin(minX, minY).setMax(maxX, maxY);
  }

  startDrag() {
    this._dragged = true;
    this._dx = 0;
    this._dy = 0;
  }

  stopDrag() {
    this._dragged = false;
  }

  drag(dx: number, dy: number) {
    this._dx = dx;
    this._dy = dy;
  }

  // exposition
  get dragged() { return this._dragged; }
  get x() { return this._clampedX; }
  get y() { return this._clampedY; }
}
