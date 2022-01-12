import { ExtensionContext } from "@foxglove/studio";
import { initSystemViewerPanel } from "./SystemViewerPanel";

export function activate(extensionContext: ExtensionContext) {
  extensionContext.registerPanel({
    name: "system-viewer",
    initPanel: initSystemViewerPanel,
  });
}
