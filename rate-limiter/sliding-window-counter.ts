type CounterState = {
  currentCount: number;
  prevCount: number;
  windowStart: number;
};

class SlidingWindowCounterRateLimiter {
  state = new Map<string, CounterState>();
  limit: number;
  expiryMilliseconds: number;

  constructor(limit: number, expiry: number) {
    this.limit = limit;
    this.expiryMilliseconds = expiry;
  }

  consume(key: string) {
    const currentTime = Date.now();
    //  1: If key not found, add it
    if (!this.state.has(key)) {
      this.state.set(key, this._newUser(currentTime));
    }
    const keyInfo: CounterState = this.state.get(key)!;

    //  2: If key outside window, update count
    const windowCount = this._getWindowCount(currentTime, keyInfo.windowStart);
    if (windowCount === 1) {
      keyInfo.prevCount = keyInfo.currentCount;
      keyInfo.currentCount = 0;
      keyInfo.windowStart += this.expiryMilliseconds;
    } else if (windowCount >= 2) {
      keyInfo.prevCount = 0;
      keyInfo.currentCount = 0;
      keyInfo.windowStart = currentTime;
    }

    //  3: Get overlap with previous window
    const prevOverlap = this._getWindowOverlap(
      currentTime,
      keyInfo.windowStart,
    );

    const estimatedCount =
      keyInfo.currentCount + keyInfo.prevCount * prevOverlap;
    if (estimatedCount >= this.limit) {
      return false;
    }

    keyInfo.currentCount += 1;

    return true;
  }

  _getWindowOverlap(currentTime: number, windowStart: number) {
    const elapsedTime = currentTime - windowStart;
    return (this.expiryMilliseconds - elapsedTime) / this.expiryMilliseconds;
  }

  _getWindowCount(currentTime: number, windowStart: number) {
    const elapsedTime = currentTime - windowStart;
    return Math.floor(elapsedTime / this.expiryMilliseconds);
  }

  _newUser(currentTime: number): CounterState {
    return {
      currentCount: 0,
      prevCount: 0,
      windowStart: currentTime,
    };
  }
}
