const QUEUE_NAME = "ranked-queue";

export function queueOf(env: Env) {
  return env.QUEUE.get(env.QUEUE.idFromName(QUEUE_NAME));
}
