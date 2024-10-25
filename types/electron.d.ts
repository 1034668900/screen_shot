declare interface Window {
  electronAPI: {
    screenShot: () => Promise<string>;
    closeWindow: () => void;
    getCaptureWindowSources : () => Promise<DesktopCapturerSource[]>
  };
}

declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
