import { MessageParams } from "../../types";
import {
  fetchMessageByTs,
  getToday,
  handleBotMessage,
  handleMessage,
  uniqStr,
  withOneDayCache,
} from "../../utils";
import { NOT_COMPLETE_EMOJI, TODAY_TODOS_URL } from "./constants";

const fetchCacheTodayTodosInfo = withOneDayCache(async () => {
  const response = await fetch(TODAY_TODOS_URL);
  const data = await response.json();
  return data as Array<{
    _id: string;
    title: string;
    command: string;
    url: string;
    disable: boolean;
  }>;
});

const handler = async ([{ event, client }]: MessageParams) => {
  const todayTodos = await fetchCacheTodayTodosInfo();
  const filteredTodayTodos = todayTodos.filter((x) => !x.disable);
  const ts = event.ts;

  for (const todayTodo of filteredTodayTodos) {
    const { title, url } = todayTodo;
    const channel = url.split("/")[4];
    const todoTs = url.split("/")[5].slice(1);

    const todos = await fetchMessageByTs({
      client,
      channel,
      ts: todoTs.slice(0, 10) + "." + todoTs.slice(10),
    });

    if (todos == null || todos === "") {
      client.chat.postMessage({
        channel: event.channel,
        text: `할 일을 못찾았어요..! (${url})`,
        thread_ts: ts,
      });
      return;
    }

    const todoList = todos
      .split("\n")
      .filter((x) => x.startsWith("• "))
      .map((x) => x.replace("• ", `:${NOT_COMPLETE_EMOJI}: `));

    client.chat.postMessage({
      channel: event.channel,
      text: todoList.join("\n"),
      thread_ts: ts,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: title.replace("YYYY-MM-DD", getToday()),
          },
        },
        ...todoList.map((x, i) => ({
          type: "section",
          block_id: `todo_${i}`,
          text: {
            type: "mrkdwn",
            text: x,
          },
          accessory: {
            type: "button",
            action_id: "todo_complete",
            text: { type: "plain_text", text: "완료", emoji: true },
            value: JSON.stringify({ index: i, text: x }),
          },
        })),
      ],
    });
  }
};

export const todayTodoHandler = async (params: MessageParams) => {
  const list = await fetchCacheTodayTodosInfo();

  return Promise.all([
    handleBotMessage(uniqStr(list.map((x) => x.command)), params, handler),
    handleMessage(uniqStr(list.map((x) => x.command)), params, handler),
  ]);
};
