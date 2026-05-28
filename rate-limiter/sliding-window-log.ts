class SlidingWindowLogRateLimiter {
  state = new Map<string, number[]>();

  limit: number;
  expiryMilliSeconds: number;

  constructor(limit: number, expiryWindow: number) {
    this.limit = limit;
    this.expiryMilliSeconds = expiryWindow;
  }

  consume(key: string) {
    //  1: If key does not exist, create an entry
    if (!this.state.has(key)) {
      this.state.set(key, []);
    }

    //  2: Remove expired timestamps
    const timestamps: number[] = this.state.get(key) || [];
    const windowStart = Date.now() - this.expiryMilliSeconds;
    while (timestamps.length > 0 && timestamps[0] <= windowStart) {
      timestamps.shift();
    }

    //  3: Remaining requests should be within the limit
    if (timestamps.length >= this.limit) {
      return false;
    }

    //  4: Add the request to the queue
    timestamps.push(Date.now());

    return true;
  }
}
