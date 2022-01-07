import {
  MessageEvent,
  PanelExtensionContext,
  RenderState,
  Time,
  Topic,
} from "@foxglove/studio";
import { Component } from "react";
import ReactDOM from "react-dom";

type StdMsgString = {
  data: string;
};

type EventMessage = {
  event: "create node" | "destroy node" | "register topic";
  [key: string]: string;
};

type SystemViewerProps = {
  context: PanelExtensionContext;
};

type SystemViewerState = {
  topics?: readonly Topic[];
  messages?: readonly MessageEvent<unknown>[];
  messagesSoFar?: readonly MessageEvent<unknown>[];
  allMessages?: readonly MessageEvent<unknown>[];
  renderDone?: (() => void);
  previewTime?: number;
  nodes: string[];
};

class SystemViewerPanel
  extends Component<SystemViewerProps, SystemViewerState> {
  constructor(props: any) {
    super(props);
    this.state = {
      topics: [],
      messages: [],
      messagesSoFar: [],
      allMessages: [],
      renderDone: undefined,
      previewTime: undefined,
      nodes: [],
    };
  }

  componentDidMount() {
    this.props.context.onRender = (renderState: RenderState, done) => {
      if (renderState.topics && renderState.topics !== this.state.topics) {
        this.setState({ topics: renderState.topics });
      }
      if (renderState.currentFrame && renderState.currentFrame.length > 0) {
        this.setState({
          messages: renderState.currentFrame,
          messagesSoFar:
            this.state.messagesSoFar?.concat(renderState.currentFrame) ??
              renderState.currentFrame,
        });
        const nodes = this.updateNodesFromMessage(
          renderState.currentFrame,
          this.state.nodes,
        );
        if (nodes !== this.state.nodes) {
          this.setState({ nodes });
        }
      }
      if (
        renderState.allFrames && renderState.allFrames.length > 0 &&
        renderState.allFrames !== this.state.allMessages
      ) {
        this.setState({ allMessages: renderState.allFrames });
      }
      this.setState({ previewTime: renderState.previewTime }, () => {
        if (this.state.previewTime && this.props.context.seekPlayback) {
          this.props.context.seekPlayback(this.state.previewTime);
          const { nodes, messagesSoFar } = this.updateNodesToTime(
            this.state.previewTime,
            this.state.allMessages,
          );
          if (nodes !== this.state.nodes) {
            this.setState({ nodes, messagesSoFar });
          }
        }
      });
      this.setState({ renderDone: done });
    };
    this.props.context.watch("topics");
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
    return { nodes, messagesSoFar: rawMessages };
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
    const messages = this.getMessageData(this.state.messagesSoFar);

    return (
      <>
        <h1>System Viewer</h1>
        <h2>Topics</h2>
        <ul>
          {this.state.topics?.map((topic) => (
            <li>
              <code>{topic.name}</code>
            </li>
          ))}
        </ul>

        <h2>Messages received</h2>
        <ul>
          {messages.map((message) => (
            <li>
              <code>{message}</code>
            </li>
          ))}
        </ul>

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
