declare interface Window {
  electronAPI: {
    getWindowSource: () => Promise<string>;
  };
}

declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
