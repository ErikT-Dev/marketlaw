export const AWAKE_MS_PER_EVENT = 50;

export class AwakeTally {
  awakeMs = 0;

  event(): void {
    this.awakeMs += AWAKE_MS_PER_EVENT;
  }
}
