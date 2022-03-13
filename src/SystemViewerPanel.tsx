import {PanelExtensionContext, RenderState} from '@foxglove/studio';
import {useEffect, useLayoutEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import {processNewFrames, updateToTime} from './frame-utils';
import type Node from './types/Node';
import type Topic from './types/Topic';

function SystemViewerPanel({context}: {context: PanelExtensionContext}): JSX.Element {
  const [renderDone, setRenderDone] = useState<(() => void) | undefined>();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const nodeEventsTopic = 'system_viewer/node_events';
  const statisticsTopic = 'system_viewer/statistics';

  useLayoutEffect(() => {
    context.onRender = (renderState: RenderState, done) => {
      setRenderDone(done);

      if (renderState.previewTime && context.seekPlayback) {
        context.seekPlayback(renderState.previewTime);
        const {nodes: newNodes, topics: newTopics} = updateToTime({
          time: renderState.previewTime,
          frames: renderState.allFrames,
          nodeEventsTopic,
          topicEventsTopic: statisticsTopic,
        });
        setNodes(newNodes);
        setTopics(newTopics);
      } else if (renderState.currentFrame && renderState.currentFrame.length > 0) {
        const {nodes: newNodes, topics: newTopics} = processNewFrames({
          frames: renderState.currentFrame,
          nodes,
          topics,
          nodeEventsTopic,
          topicEventsTopic: statisticsTopic,
        });
        setNodes(newNodes);
        setTopics(newTopics);
      }
    };

    context.watch('currentFrame');
    context.watch('allFrames');
    context.watch('previewTime');
    context.subscribe([nodeEventsTopic, statisticsTopic]);
  }, []);

  useEffect(() => {
    renderDone?.();
  }, [renderDone]);

  return (
    <>
      <h1>System Viewer</h1>
      <h2>Nodes</h2>
      <ul>
        {nodes.map((node) => (
          <li>{node.name}</li>
        ))}
      </ul>
      <h2>Topics</h2>
      <ul>
        {topics.map((topic) => (
          <li>
            {topic.topic} - data: {JSON.stringify(topic.data) || '<none>'}
          </li>
        ))}
      </ul>
    </>
  );
}

export function initSystemViewerPanel(context: PanelExtensionContext) {
  ReactDOM.render(<SystemViewerPanel context={context} />, context.panelElement);
}
