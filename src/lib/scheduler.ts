import type { Job } from "./jobs-store";
import { PRIORITY_RANK } from "./jobs-store";

/**
 * A generic array-based binary min-heap.
 *
 * Standard heap operations, all O(log n) except peek (O(1)):
 * - push:  insert, then sift the new item UP until the heap property holds
 * - pop:   remove the root, move the last item to the root, sift it DOWN
 *
 * The "smallest" element is whatever `compare(a, b) < 0` says is smallest —
 * for us, that's the highest-priority, earliest-arrived print job.
 */
export class MinHeap<T> {
  private items: T[] = [];

  constructor(private readonly compare: (a: T, b: T) => number) {}

  get size(): number {
    return this.items.length;
  }

  peek(): T | undefined {
    return this.items[0];
  }

  push(item: T): void {
    this.items.push(item);
    this.siftUp(this.items.length - 1);
  }

  pop(): T | undefined {
    if (this.items.length === 0) return undefined;
    const top = this.items[0]!;
    const last = this.items.pop()!;
    if (this.items.length > 0) {
      this.items[0] = last;
      this.siftDown(0);
    }
    return top;
  }

  /** Non-destructive: drains a clone, so the real heap is untouched. Used for display. */
  toSortedArray(): T[] {
    const clone = new MinHeap<T>(this.compare);
    clone.items = [...this.items];
    const out: T[] = [];
    let item = clone.pop();
    while (item !== undefined) {
      out.push(item);
      item = clone.pop();
    }
    return out;
  }

  private siftUp(index: number): void {
    let i = index;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.compare(this.items[i]!, this.items[parent]!) < 0) {
        [this.items[i], this.items[parent]] = [this.items[parent]!, this.items[i]!];
        i = parent;
      } else {
        break;
      }
    }
  }

  private siftDown(index: number): void {
    let i = index;
    const n = this.items.length;
    for (;;) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      let smallest = i;
      if (left < n && this.compare(this.items[left]!, this.items[smallest]!) < 0) smallest = left;
      if (right < n && this.compare(this.items[right]!, this.items[smallest]!) < 0) smallest = right;
      if (smallest === i) break;
      [this.items[i], this.items[smallest]] = [this.items[smallest]!, this.items[i]!];
      i = smallest;
    }
  }
}

/**
 * Ordering rule for the printer queue: lower priority number wins (Urgent
 * beats Normal beats Low); ties broken by sequence_number, so jobs of the
 * same priority stay first-in-first-out.
 */
function compareJobs(a: Job, b: Job): number {
  const priorityDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  if (priorityDiff !== 0) return priorityDiff;
  return a.sequenceNumber - b.sequenceNumber;
}

/**
 * PriorityScheduler = MinHeap + hashmap, the classic combination behind
 * real print/process schedulers.
 *
 * - The heap gives O(log n) insert and O(log n) "get the next job to run".
 * - The hashmap gives O(1) lookup of any job by id.
 * - Cancelling a job is O(1): it just flags the id as cancelled. Heaps
 *   can't efficiently delete an arbitrary middle element (that would be
 *   O(n) to find it), so instead of touching the heap at all, cancelled
 *   ids are tracked separately and silently skipped whenever the heap
 *   is popped. This is "lazy deletion".
 */
export class PriorityScheduler {
  private heap = new MinHeap<Job>(compareJobs);
  private jobsById = new Map<string, Job>();
  private cancelled = new Set<string>();

  constructor(queuedJobs: Job[]) {
    for (const job of queuedJobs) {
      this.heap.push(job);
      this.jobsById.set(job.id, job);
    }
  }

  /** O(1) hashmap lookup. */
  getById(id: string): Job | undefined {
    return this.jobsById.get(id);
  }

  /** O(1) lazy delete: flag it, don't touch the heap. */
  cancel(id: string): void {
    this.cancelled.add(id);
  }

  /**
   * O(log n) amortized "extract-min": pops until it finds a job that
   * hasn't been lazily cancelled. That job is the one the printer
   * should process next.
   */
  extractNext(): Job | undefined {
    let next = this.heap.pop();
    while (next !== undefined && this.cancelled.has(next.id)) {
      next = this.heap.pop();
    }
    return next;
  }

  /** Non-destructive: the whole queue in priority order, cancelled jobs excluded. */
  peekOrderedQueue(): Job[] {
    return this.heap.toSortedArray().filter((job) => !this.cancelled.has(job.id));
  }
}