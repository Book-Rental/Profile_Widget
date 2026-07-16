import React from "react";
import { createRoot, Root as ReactRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

export interface WidgetOptions {
  containerElementId?: string;
  name?: string;
  view?: "profile" | "address";
}

declare global {
  interface Window {
    renderReactWidget: (config: string) => void;
    unmountReactWidget: (id: string) => void;
    HOST_USER_INFO: any;
  }
}

const widgetRoots: Record<string, ReactRoot> = {};

const getOptionsFromDataAttributes = (
  el: HTMLElement
): Partial<WidgetOptions> => {
  return {
    name: el.getAttribute("data-name") || "",
    view:
      (el.getAttribute("data-view") as "profile" | "address") || "profile",
  };
};

window.renderReactWidget = (config: string) => {
  let parsedOptions: Partial<WidgetOptions> = {};

  try {
    parsedOptions = JSON.parse(config);
  } catch {
    console.warn("Invalid JSON config. Falling back to data attributes.");
  }

  const containerId = parsedOptions.containerElementId || config;

  const container = document.getElementById(containerId);

  if (!container) {
    console.error(`Container "${containerId}" not found.`);
    return;
  }

  const dataOptions = getOptionsFromDataAttributes(container);

  const finalOptions: WidgetOptions = {
    containerElementId: containerId,
    name: parsedOptions.name || dataOptions.name || "",
    view: parsedOptions.view || dataOptions.view || "profile",
  };

  if (!finalOptions.name) {
    console.error("Missing required field: name");
    return;
  }

  if (widgetRoots[containerId]) {
    widgetRoots[containerId].unmount();
  }

  const root = createRoot(container);

  root.render(
    <React.StrictMode>
      <App options={finalOptions} />
    </React.StrictMode>
  );

  widgetRoots[containerId] = root;
};

window.unmountReactWidget = (containerElementId: string) => {
  const root = widgetRoots[containerElementId];

  if (root) {
    root.unmount();
    delete widgetRoots[containerElementId];
  }
};