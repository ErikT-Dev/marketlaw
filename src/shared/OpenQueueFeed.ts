import type { QueueFeed } from "./QueueFeed";
import type { QueueFeedHandlers } from "./QueueFeedHandlers";

export type OpenQueueFeed = (handlers: QueueFeedHandlers) => QueueFeed;
