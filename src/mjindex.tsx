// React
import React, { useState, useEffect, useCallback } from 'react';

// Foxglove
import Panel from "@foxglove/studio-base/src/components/Panel";
import { SaveConfig } from "@foxglove/studio-base/src/types/panels";

// ReactFlow
import ReactFlow, { ReactFlowProvider, Elements, Background } from 'react-flow-renderer';

// SystemView
import initialElements from './initial-elements';
import { createGraphLayout } from "./layout";
// import { SystemViewToolbar } from "./SystemViewToolbar";
import './layouting.css';

type Props = {
  config: unknown;
  saveConfig: SaveConfig<unknown>;
}

const SystemViewPanel = (props: Props) => {

  // const { config, saveConfig } = props
  const [elements, setElements] = useState<Elements>(initialElements)

  useEffect(() => {
    createGraphLayout(initialElements)
      .then(els => {
        setElements(els)
      })
      .catch(err => console.error(err))
  }, [])

  const onLayout = useCallback(
    (direction: any) => {
      createGraphLayout(elements, direction)
        .then(els => setElements(els))
        .catch(err => console.error(err))
    },
    [elements]
  );

  const toggleOrientation = useCallback((lrOrientation: boolean) => {
    onLayout(lrOrientation ? 'RIGHT' : 'DOWN');
  }, []);

  return (
    <>{!elements ? (
      <p>Loading ...</p>
    ) : (
      <div className="layoutflow">
        <ReactFlowProvider>
          <ReactFlow
            elements={elements}
            snapToGrid={true}
            snapGrid={[15, 15]}
          //{...otherProps}
          >
            <Background color="#aaa" gap={16} />
          </ReactFlow>
          {/* <SystemViewToolbar
            nodes={elements}
            edges={[]}
            lrOrientation={true}
            onToggleOrientation={toggleOrientation}
          /> */}
        </ReactFlowProvider>
      </div>
    )
    }</>
  )
};

SystemViewPanel.displayName = "SystemView";
SystemViewPanel.panelType = "SystemView";
SystemViewPanel.defaultConfig = {};
SystemViewPanel.supportsStrictMode = false;

export default Panel(SystemViewPanel);