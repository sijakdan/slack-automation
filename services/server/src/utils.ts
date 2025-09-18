import { MessageParams } from "./types";

export const handleBotMessage = async (
  messages: string[],
  params: MessageParams,
  callback: (params: MessageParams) => Promise<void>
) => {
  const { event } = params[0];

  if (event.type !== "message") {
    return;
  }
  if (event.subtype !== "bot_message") {
    return;
  }

  if (!messages.some((message) => event.text.includes(message))) {
    return;
  }

  await callback(params);
};

export const handleMessage = async (
  messages: string[],
  params: MessageParams,
  callback: (params: MessageParams) => Promise<void>
) => {
  const { event } = params[0];

  if (event.type !== "message") {
    return;
  }

  if (!("user" in event)) {
    return;
  }

  if (!messages.some((message) => event?.text?.includes(message))) {
    return;
  }

  event;

  await callback(params);
};

export const fetchMessageByTs = async ({
  client,
  channel,
  ts,
}: {
  client: any;
  channel: string;
  ts: string;
}) => {
  const { messages } = await client.conversations.replies({
    channel: channel,
    ts,
    inclusive: true,
    limit: 10,
  });
  const message = messages?.[0];

  return message?.text;
};

export const uniqStr = (array: string[]): string[] => {
  return [...new Set(array)];
};

export const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const monthStr = month.toString().padStart(2, "0");
  const dayStr = day.toString().padStart(2, "0");
  return `${year}-${monthStr}-${dayStr}`;
};

export const withOneDayCache = <T>(fn: () => Promise<T>) => {
  const cache = new Map<string, T>();

  return async () => {
    const now = new Date();
    const cacheKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    if (cache.has(cacheKey)) {
      console.log("cache hit");
      return cache.get(cacheKey)!;
    }

    const data = await fn();
    console.log("cache miss");
    cache.clear();
    cache.set(cacheKey, data);
    return data;
  };
};
