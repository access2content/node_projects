type TokenState = {
  tokens: number;
  lastRefill: number;
};

class TokenBucketRateLimiter {
  state = new Map<string, TokenState>();
  refillPerSecond: number;
  capacity: number;

  constructor(capacity: number, refill: number) {
    this.capacity = capacity;
    this.refillPerSecond = refill;
  }

  consume(key: string) {
    const currentTime = Date.now();

    //  1: If key not found, set it
    let keyInfo = this.state.get(key);
    if (!keyInfo) {
      keyInfo = this._newKey(currentTime);
      this.state.set(key, keyInfo);
    }

    //  2: Refill the bucket
    const refillCount =
      ((currentTime - keyInfo.lastRefill) / 1000) * this.refillPerSecond;
    keyInfo.tokens = Math.min(this.capacity, keyInfo.tokens + refillCount);
    keyInfo.lastRefill = Date.now();

    //  3: Check if within limits
    if (keyInfo.tokens < 1) {
      return false;
    }

    //  4: Consume token
    keyInfo.tokens -= 1;

    return true;
  }

  _newKey(currentTime: number): TokenState {
    return {
      tokens: this.capacity,
      lastRefill: currentTime,
    };
  }
}
