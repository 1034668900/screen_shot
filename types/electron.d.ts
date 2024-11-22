// 解决Vue代码中使用 electronAPI 时 TS 校验问题
declare interface Window {
  electronAPI: {
    startScreenShot: () => Promise<string>;
  };
}

declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
