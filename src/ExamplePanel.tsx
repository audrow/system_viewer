import {
  MessageEvent,
  PanelExtensionContext,
  RenderState,
  Topic,
} from "@foxglove/studio";
import { Component } from "react";
import ReactDOM from "react-dom";

type StdMsgString = {
  data: string;
};

type Message = {
  event: "create node" | "destroy node" | "register topic";
  [key: string]: string;
};
type NodeListProps = {
  message: string;
};
type NodeListState = {
  nodes: string[];
};

class NodeList extends Component<NodeListProps, NodeListState> {
  constructor(props: NodeListProps) {
    super(props);
    this.state = {
      nodes: [],
    };
  }

  // Documentation for this function is here:
  // https://reactjs.org/docs/react-component.html#static-getderivedstatefromprops
  static getDerivedStateFromProps(props: NodeListProps, state: NodeListState) {
    console.log("getDerivedStateFromProps", props, state);
    const message: Message = JSON.parse(props.message);
    if (message.event === "create node") {
      const nodeName = message.node!;
      if (!state.nodes.includes(nodeName)) {
        state.nodes.push(nodeName);
        console.log("create node", nodeName, state);
      }
    } else if (message.event === "destroy node") {
      const nodeName = message.node!;
      state.nodes = state.nodes.filter((node) => node !== nodeName);
      console.log("destroy node", nodeName, state);
    } else if (message.event === "register topic") {
      // TODO: register topic
    }
    return state;
  }
  render() {
    return (
      <>
        <h1>Node viewer</h1>
        <ul>
          {this.state.nodes.map((node) => <li>{node}</li>)}
        </ul>
      </>
    );
  }
}

type SystemViewerProps = {
  context: PanelExtensionContext;
}

type SystemViewerState = {
  topics?: readonly Topic[];
  messages?: readonly MessageEvent<unknown>[];
  allMessages?: readonly MessageEvent<unknown>[];
  renderDone?: (() => void);
  previewTime?: number;
}

class SystemViewerPanel extends Component<SystemViewerProps, SystemViewerState> {

  constructor(props: any) {
    super(props);
    this.state = {
      topics: [],
      messages: [],
      allMessages: [],
      renderDone: undefined,
      previewTime: undefined,
    };
  }

  componentDidMount() {
    this.props.context.onRender = (renderState: RenderState, done) => {
      const messages = (renderState.currentFrame?.map((messageEvent) =>
        messageEvent.message
      ) ?? []) as String[];
      if (messages.length > 0) {
        this.setState({messages: renderState.currentFrame});
      }
      if (renderState.allFrames && renderState.allFrames.length > 0 && renderState.allFrames !== this.state.allMessages) {
        this.setState({allMessages: renderState.allFrames});
      }
      if (renderState.previewTime !== undefined) {
        this.setState({previewTime: renderState.previewTime});
      }
      this.setState({
        topics: renderState.topics,
        renderDone: done,
      });
    }
    this.props.context.watch("topics");
    this.props.context.watch("currentFrame");
    this.props.context.watch("allFrames");
    this.props.context.watch("previewTime");
    this.props.context.subscribe(["system_events"]);
  }

  componentDidUpdate() {
    this.state.renderDone?.();
  }

  render() {
    return (
      <>
        <h1>My panel</h1>
        <ul>
          {this.state.topics?.map((topic) => (
            <li>
              <code>{topic.name}</code>
            </li>
          ))}
        </ul>
        {this.state.messages?.map((messageEvent) => (
          <>
            <h1>Messages</h1>
            <code>{(messageEvent.message as StdMsgString).data}</code>
            <br />
            <NodeList message={(messageEvent.message as StdMsgString).data} />
          </>
        ))}
        <PreviewTime previewTime={this.state.previewTime} />
      </>
    )
  }
}

function PreviewTime(props: { previewTime?: number  }) {
  return <p>Preview time: {props.previewTime ?? "No preview time yet"} </p>
}

export function initExamplePanel(context: PanelExtensionContext) {
  ReactDOM.render(<SystemViewerPanel context={context} />, context.panelElement);
}
