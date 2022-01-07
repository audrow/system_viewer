import { ExtensionContext } from "@foxglove/studio";
import { initExamplePanel } from "./SystemViewerPanel";

export function activate(extensionContext: ExtensionContext) {
  extensionContext.registerPanel({
    name: "system-viewer",
    initPanel: initExamplePanel,
  });
}

import _Panel from "./mjindex";