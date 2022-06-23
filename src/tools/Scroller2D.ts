
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

const clamp = (x: number, min: number, max: number) => {
  return x < min ? min : x > max ? max : x;
}

export type Scroller2DUpdateArg = Partial<{
  deltaTime: number | 'guess'
}>;

/**
 * Usage: 
 * ```js
 * const draggable = new Draggable2D().zero().set({
 *   minX: 0,
 *   maxX: 1000,
 *   marginX: 50,
 * });
 * 
 * onFrame = () => {
 *   draggable.drag(dx, dy);
 *   draggable.update();
 *   
 *   myComponent.x = draggable.x;
 *   myComponent.y = draggable.y;
 * }
 * ```
 */
export class Scroller2D {

  private _time = Date.now();
  private _timeOld = Date.now();
  private _dragged = false;
  private _deltaTime = 0;
  private _x = 0;
  private _y = 0;
  private _xOld = 0;
  private _yOld = 0;
  private _dragDeltaX = 0;
  private _dragDeltaY = 0;
  private _clampedX = 0;
  private _clampedY = 0;
  
  private _minX = -Infinity;
  private _minY = -Infinity;
  private _marginX = 20;
  private _maxX = Infinity;
  private _maxY = Infinity;
  private _marginY = 20;
  private _inertia = 0.001; // reduction by seconds: 0.001 means: only 0.1% velocity is 
  
  set({
    x = this._x,
    y = this._y,
    minX = this._minX,
    minY = this._minY,
    marginX = this._marginX,
    maxX = this._maxX,
    maxY = this._maxY,
    marginY = this._marginY,
    inertia = this._inertia,
  } = {}) {
    this._minX = minX;
    this._minY = minY;
    this._marginX = marginX;
    this._maxX = maxX;
    this._maxY = maxY;
    this._x = clamp(x, minX, maxX);
    this._y = clamp(y, minY, maxY);
    this._marginY = marginY;
    this._inertia = inertia;
    return this;
  }

  /**
   * Reset to zero min, max, margin & position values.  
   * By default there are infinite bounds (min, max).  
   * So one requires to use `set()` after, eg: 
   * ```
   * draggable.zero().set({ maxX: 200 })
   * ```
   */
  zero() {
    this._minX = 0;
    this._maxX = 0;
    this._minY = 0;
    this._maxY = 0;
    this._marginX = 0;
    this._marginY = 0;
    this._x = 0;
    this._y = 0;
    return this;
  }

  update({
    deltaTime = 'guess',
  }: Scroller2DUpdateArg = {}) {

    this._timeOld = this._time;
    this._xOld = this._x;
    this._yOld = this._y;

    if (deltaTime === 'guess') {
      this._time = Date.now() / 1000;
      this._deltaTime = this._time - this._timeOld;
    }
    else {
      this._deltaTime = deltaTime;
      this._time += deltaTime;
    }

    if (this._deltaTime > 0) {
      this._x += this._dragDeltaX;
      this._y += this._dragDeltaY;

      if (this._dragged) {
        this._clampedX = limitedClamp(this._x, this._marginX, this._minX, this._maxX);
        this._clampedY = limitedClamp(this._y, this._marginY, this._minY, this._maxY);
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
        this._dragDeltaX = this._dragDeltaX * di;
        this._dragDeltaY = this._dragDeltaY * di;
      }
    }

    return this;
  }

  startDrag() {
    this._dragged = true;
    this._dragDeltaX = 0;
    this._dragDeltaY = 0;
    return this;
  }

  stopDrag() {
    this._dragged = false;
    return this;
  }

  drag(dragX: number, dragY: number) {
    this._dragDeltaX = dragX;
    this._dragDeltaY = dragY;
    return this;
  }

  // exposition
  get dragged() { return this._dragged; }
  get x() { return this._clampedX; }
  get y() { return this._clampedY; }
  get dx() { return this._x - this._xOld; }
  get dy() { return this._y - this._yOld; }
}
