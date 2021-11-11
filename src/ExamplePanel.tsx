import {
  MessageEvent,
  PanelExtensionContext,
  RenderState,
  Topic,
} from "@foxglove/studio";
import { Component, useEffect, useLayoutEffect, useState } from "react";
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

function ExamplePanel(
  { context }: { context: PanelExtensionContext },
): JSX.Element {
  const [topics, setTopics] = useState<readonly Topic[] | undefined>();
  const [_messages, setMessages] = useState<
    readonly MessageEvent<unknown>[] | undefined
  >();

  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();

  useLayoutEffect(() => {
    context.onRender = (renderState: RenderState, done) => {
      const messages = (renderState.currentFrame?.map((messageEvent) =>
        messageEvent.message
      ) ?? []) as String[];
      setRenderDone(done);
      setTopics(renderState.topics);
      if (messages.length > 0) {
        setMessages(renderState.currentFrame);
      }
    };
    context.watch("topics");
    context.watch("currentFrame");
    context.subscribe(["system_events"]);
  }, []);

  // invoke the done callback once the render is complete
  useEffect(() => {
    renderDone?.();
  }, [renderDone]);

  return (
    <>
      <p>
        <h1>Topics</h1>
        <ul>
          {topics?.map((topic) => (
            <li>
              <code>{topic.name}</code>
            </li>
          ))}
        </ul>
        {_messages?.map((messageEvent) => (
          <>
            <h1>Messages</h1>
            <code>{(messageEvent.message as StdMsgString).data}</code>
            <br />
            <NodeList message={(messageEvent.message as StdMsgString).data} />
          </>
        ))}
      </p>
    </>
  );
}

export function initExamplePanel(context: PanelExtensionContext) {
  ReactDOM.render(<ExamplePanel context={context} />, context.panelElement);
}
