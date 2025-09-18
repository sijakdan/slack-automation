import "dotenv/config";
import { App } from "@slack/bolt";
import {
  todayTodoHandler,
  completeTodoHandler,
  cancelTodoHandler,
} from "./handlers/todayTodo";

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.APP_TOKEN,
});

(async () => {
  await app.start();

  console.log("⚡️ Bolt app is running!");

  app.event("message", async (...params) => {
    Promise.all([todayTodoHandler(params)]);
  });

  app.action(completeTodoHandler.ID, completeTodoHandler.handler);
  app.action(cancelTodoHandler.ID, cancelTodoHandler.handler);
})();
