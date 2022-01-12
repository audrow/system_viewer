import {
  MessageEvent,
  PanelExtensionContext,
  RenderState,
  Time,
} from "@foxglove/studio";
import { useEffect, useLayoutEffect, useState } from "react";
import ReactDOM from "react-dom";

import { StdMsgString } from "./types/StdMsgString";
// import { Event } from "./types/events";

type EventMessage = {
  event: "create node" | "destroy node" | "register topic";
  [key: string]: string;
};

function SystemViewerPanel({ context }: { context: PanelExtensionContext }): JSX.Element {

  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();

  const [nodes, setNodes] = useState<string[]>([]);

  useLayoutEffect(() => {
    context.onRender = (renderState: RenderState, done) => {
      setRenderDone(done);
      if (renderState.currentFrame && renderState.currentFrame.length > 0) {
        setNodes(
          updateNodesFromMessage(renderState.currentFrame, nodes))
      }
      if (renderState.previewTime && context.seekPlayback) {
        context.seekPlayback(renderState.previewTime);
        setNodes(
          updateNodesToTime(
            renderState.previewTime,
            renderState.allFrames
          ));
      }
    };
    context.watch("currentFrame");
    context.watch("allFrames");
    context.watch("previewTime");
    context.subscribe(["system_events"]);
  }, []);

  useEffect(() => {
    renderDone?.();
  }, [renderDone])

  return (
    <>
      <h1>System Viewer</h1>
      <h2>Nodes</h2>
      <ul>
        {nodes.map((node) => <li>{node}</li>)}
      </ul>
    </>
  )
}

function updateNodesFromMessage(
  rawMessages: readonly MessageEvent<unknown>[] | undefined,
  nodes: string[],
) {
  const messages = getMessageData(rawMessages);
  if (!messages) {
    return nodes;
  }
  messages.forEach((message) => {
    const parsedMessage: EventMessage = JSON.parse(message);
    console.log("parsedMessage", parsedMessage);
    if (
      parsedMessage.event === "create node" &&
      !nodes.includes(parsedMessage.node!)
    ) {
      nodes.push(parsedMessage.node!);
    } else if (parsedMessage.event === "destroy node") {
      nodes = nodes.filter((node) => node !== parsedMessage.node!);
    } else if (parsedMessage.event === "register topic") {
      // TODO: register topic
    }
  });
  console.log("nodes", nodes);
  return [...nodes];
}

function getMessageData(
  messages: readonly MessageEvent<unknown>[] | undefined,
): string[] {
  return messages?.map((message) => (message.message as StdMsgString).data) ??
    [];
}

function updateNodesToTime(
  time: number,
  allMessages: readonly MessageEvent<unknown>[] | undefined,
) {
  const timeObject = getTimeFromNumber(time);
  const rawMessages = getAllMessagesBeforeTime(allMessages, timeObject);
  return updateNodesFromMessage(rawMessages, []);
}

function getTimeFromNumber(num: number): Time {
  const seconds = Math.floor(num);
  const nanoseconds = Math.floor((num - seconds) * 1_000_000_000);
  return { sec: seconds, nsec: nanoseconds } as Time;
}

function getAllMessagesBeforeTime(
  allMessages: readonly MessageEvent<unknown>[] | undefined,
  time: Time,
) {
  const messages =
    allMessages?.filter((message) =>
      compareTime(message.receiveTime, time) !== 1
    ) ?? [];
  return messages as MessageEvent<unknown>[];
}

function compareTime(time1: Time, time2: Time) {
  if (time1.sec < time2.sec) {
    return -1;
  } else if (time1.sec > time2.sec) {
    return 1;
  } else {
    if (time1.nsec < time2.nsec) {
      return -1;
    } else if (time1.nsec > time2.nsec) {
      return 1;
    } else {
      return 0;
    }
  }
}

export function initSystemViewerPanel(context: PanelExtensionContext) {
  ReactDOM.render(
    <SystemViewerPanel context={context} />,
    context.panelElement,
  );
}
