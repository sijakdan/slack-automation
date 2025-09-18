import { InteractiveAction, InteractiveMessage } from "@slack/bolt";
import { COMPLETE_EMOJI, NOT_COMPLETE_EMOJI } from "./constants";

const handler = async ({ ack, body, client }) => {
  await ack();

  const action = (body as InteractiveMessage<InteractiveAction>).actions?.[0];
  if (!action) return;

  const payload = JSON.parse((action as { value: string }).value) as {
    index: number;
    text: string;
  };

  const channel = body.channel?.id!;
  const ts = body.message?.ts!;
  let text = body.message?.text!;

  const blocks = body.message?.blocks || [];

  const targetIdx = blocks.findIndex(
    (b: any) => b.block_id === `todo_${payload.index}`
  );
  if (targetIdx >= 0) {
    const old = blocks[targetIdx].text?.text ?? payload.text;
    const newMessage = oppositeAction.newMessage(old);
    blocks[targetIdx].text.text = newMessage;
    text = text.replace(old, newMessage);

    blocks[targetIdx].accessory = {
      type: "button",
      action_id: oppositeAction.id,
      text: { type: "plain_text", text: oppositeAction.text, emoji: true },
      value: JSON.stringify({ index: payload.index, text: payload.text }),
    };
  }

  await client.chat.update({
    channel,
    ts,
    blocks,
    text,
  });
};

const oppositeAction = {
  id: "todo_complete",
  text: "완료",
  newMessage: (text: string) => {
    return text.slice(1, -1).replace(COMPLETE_EMOJI, NOT_COMPLETE_EMOJI);
  },
};

export const cancelTodoHandler = {
  ID: "todo_cancel",
  handler,
};
