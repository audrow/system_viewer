import {
  MessageEvent,
  PanelExtensionContext,
  RenderState,
  Time,
} from "@foxglove/studio";
import { Component } from "react";
import ReactDOM from "react-dom";

import { StdMsgString } from "./types/StdMsgString";
// import { Event } from "./types/events";

type EventMessage = {
  event: "create node" | "destroy node" | "register topic";
  [key: string]: string;
};

type SystemViewerProps = {
  context: PanelExtensionContext;
};

type SystemViewerState = {
  renderDone?: (() => void);
  previewTime?: number;
  nodes: string[];
};

class SystemViewerPanel
  extends Component<SystemViewerProps, SystemViewerState> {
  constructor(props: any) {
    super(props);
    this.state = {
      renderDone: undefined,
      previewTime: undefined,
      nodes: [],
    };
  }

  componentDidMount() {
    this.props.context.onRender = (renderState: RenderState, done) => {
      // on a new message try to update the current nodes
      if (renderState.currentFrame && renderState.currentFrame.length > 0) {
        // Try updating nodes with current frame
        const nodes = this.updateNodesFromMessage(
          renderState.currentFrame,
          this.state.nodes,
        );
        // Update nodes only if there is a change
        if (nodes !== this.state.nodes) {
          this.setState({ nodes });
        }
      }
      // handle when the user picks a time with the time slider
      this.setState({ previewTime: renderState.previewTime }, () => {
        if (this.state.previewTime && this.props.context.seekPlayback) {
          this.props.context.seekPlayback(this.state.previewTime);
          const nodes = this.updateNodesToTime(
            this.state.previewTime,
            renderState.allFrames,
          );
          if (nodes !== this.state.nodes) {
            this.setState({ nodes });
          }
        }
      });
      // necessary to call done() to finish rendering
      this.setState({ renderDone: done });
    };

    // the things that we want access to in the render state object
    this.props.context.watch("currentFrame");
    this.props.context.watch("allFrames");
    this.props.context.watch("previewTime");
    this.props.context.subscribe(["system_events"]);
  }

  private updateNodesToTime(
    time: number,
    allMessages: readonly MessageEvent<unknown>[] | undefined,
  ) {
    const timeObject = this.getTimeFromNumber(time);
    const rawMessages = this.getAllMessagesBeforeTime(allMessages, timeObject);
    const nodes = this.updateNodesFromMessage(rawMessages, []);
    return nodes
  }

  componentDidUpdate() {
    this.state.renderDone?.();
  }

  getTimeFromNumber(num: number): Time {
    const seconds = Math.floor(num);
    const nanoseconds = Math.floor((num - seconds) * 1_000_000_000);
    return { sec: seconds, nsec: nanoseconds } as Time;
  }

  getMessageData(
    messages: readonly MessageEvent<unknown>[] | undefined,
  ): string[] {
    return messages?.map((message) => (message.message as StdMsgString).data) ??
      [];
  }

  getAllMessagesBeforeTime(
    allMessages: readonly MessageEvent<unknown>[] | undefined,
    time: Time,
  ) {
    const messages =
      allMessages?.filter((message) =>
        this.compareTime(message.receiveTime, time) !== 1
      ) ?? [];
    return messages as MessageEvent<unknown>[];
  }

  compareTime(time1: Time, time2: Time) {
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

  updateNodesFromMessage(
    rawMessages: readonly MessageEvent<unknown>[] | undefined,
    nodes: string[],
  ) {
    const messages = this.getMessageData(rawMessages);
    if (!messages) {
      return nodes;
    }
    messages.forEach((message) => {
      const parsedMessage: EventMessage = JSON.parse(message);
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
    return nodes;
  }

  render() {
    return (
      <>
        <h1>System Viewer</h1>
        <h2>Messages received</h2>

        <h2>Nodes</h2>
        <ul>
          {this.state.nodes.map((node) => <li>{node}</li>)}
        </ul>

        <PreviewTime previewTime={this.state.previewTime} />
      </>
    );
  }
}

function PreviewTime(props: { previewTime?: number }) {
  return <p>Preview time: {props.previewTime ?? "No preview time yet"}</p>;
}

export function initExamplePanel(context: PanelExtensionContext) {
  ReactDOM.render(
    <SystemViewerPanel context={context} />,
    context.panelElement,
  );
}
