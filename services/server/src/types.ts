import {
  AllMiddlewareArgs,
  App,
  EnvelopedEvent,
  KnownEventFromType,
  SayFn,
  StringIndexed,
} from "@slack/bolt";

export type MessageParams<T = KnownEventFromType<"message">> = [
  args: {
    payload: T;
    event: T;
    body: EnvelopedEvent<T>;
  } & {
    message: T;
  } & {
    say: SayFn;
  } & {
    ack?: undefined;
  } & AllMiddlewareArgs<StringIndexed>
];
