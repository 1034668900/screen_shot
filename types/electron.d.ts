declare interface Window {
  electronAPI: {
    screenShot: () => Promise<string>;
    closeWindow: () => void;
    getCaptureWindowSources: () => Promise<DesktopCapturerSource[]>;
    saveImageToClipboard: (ImageDataURL: string) => Promise<void>;
    saveImage: () => Promise<void>;
  };
}

declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
