type BucketState = {
  amount: number;
  lastLeak: number;
};

class LeakyBucketRateLimiter {
  state = new Map<string, BucketState>();

  capacity: number;
  leakPerSecond: number;

  constructor(capacity: number, rate: number) {
    this.capacity = capacity;
    this.leakPerSecond = rate;
  }

  consume(key: string) {
    const currentTime = Date.now();

    //  1: Create key if not exists
    let keyState = this.state.get(key);
    if (!keyState) {
      keyState = this._newBucket(currentTime);
      this.state.set(key, keyState);
    }

    //  2: Leak the amount that should have been leaked
    const toLeak =
      ((currentTime - keyState.lastLeak) / 1000) * this.leakPerSecond;
    keyState.amount = Math.max(0, keyState.amount - toLeak);

    //  3: Check if bucket is full
    if (keyState.amount >= this.capacity) {
      return false;
    }

    keyState.amount += 1;

    return true;
  }

  _newBucket(currentTime: number): BucketState {
    return {
      amount: 0,
      lastLeak: currentTime,
    };
  }
}
