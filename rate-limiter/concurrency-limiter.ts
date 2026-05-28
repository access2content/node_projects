class ConcurrencyRateLimiter {
  state = new Map<string, number>();
  capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
  }

  acquire(key: string) {
    //  1: Ensure key exists
    let keyState = this.state.get(key);
    if (keyState === undefined) {
      keyState = 0;
      this.state.set(key, keyState);
    }

    //  2: Ensure within capacity
    if (keyState >= this.capacity) {
      return false;
    }

    //  3: Consume a unit
    this.state.set(key, keyState + 1);
    return true;
  }

  release(key: string) {
    //  1: Ensure key exists
    let keyState = this.state.get(key);
    if (keyState === undefined) {
      return false;
    }

    if (keyState === 0) {
      return false;
    }

    if (keyState === 1) {
      this.state.delete(key);
    } else {
      this.state.set(key, keyState - 1);
    }

    return true;
  }
}
