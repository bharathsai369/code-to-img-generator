export interface Theme {
  name: string;
  background: string;
  theme: string; // highlight.js theme name
}

export interface BackgroundStyle {
  id: string;
  name: string;
  style: React.CSSProperties;
}

export interface State {
  code: string;
  language: string;
  theme: string;
  fontFamily: string;
  fontSize: number;
  padding: number;
  showLineNumbers: boolean;
  shadow: string;
  borderRadius: number;
  backgroundStyleId: string;
  showWindowControls: boolean;
  windowTitle: string;
}

declare global {
  interface Window {
    hljs: any;
    htmlToImage: any;
    prettier: any;
    prettierPlugins: any;
  }
}
