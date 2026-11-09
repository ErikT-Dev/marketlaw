export class ObservableState<State> {
  protected state: State;
  private listeners: ReadonlyArray<() => void> = [];

  constructor(initial: State) {
    this.state = initial;
  }

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners = [...this.listeners, listener];
    return () => {
      this.listeners = this.listeners.filter((known) => known !== listener);
    };
  };

  readonly getSnapshot = (): State => this.state;

  protected change(changes: Partial<State>): void {
    this.state = { ...this.state, ...changes };
    this.listeners.forEach((listener) => {
      listener();
    });
  }
}
