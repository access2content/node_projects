type CounterState = {
  remaining: number;
  windowStart: number;
};

class FixedWindowRateLimiter {
  state: Map<string, CounterState> = new Map();

  limit: number;
  expiryMilliseconds: number;

  constructor(limit: number, windowDuration: number) {
    this.limit = limit;
    this.expiryMilliseconds = windowDuration;
  }

  consume(key: string): boolean {
    let keyState = this.state.get(key);

    //  1: If key does not exist, create it
    if (!keyState) {
      keyState = this._resetTokens();
      this.state.set(key, keyState);
    }

    //  2: If outside window, reset limit
    if (this._isOutsideWindow(keyState)) {
      keyState = this._resetTokens();
      this.state.set(key, keyState);
    }

    //  3: If no limit remaining, reject it
    if (keyState.remaining <= 0) {
      return false;
    }

    //  4: Consume one inventory
    keyState.remaining -= 1;

    return true;
  }

  _isOutsideWindow(state: CounterState) {
    const currentTime = Date.now();
    return state.windowStart + this.expiryMilliseconds <= currentTime;
  }

  _resetTokens() {
    return {
      remaining: this.limit,
      windowStart: Date.now(),
    };
  }
}
