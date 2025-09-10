import { Theme, BackgroundStyle, State } from '@/types';

export const LANGUAGES = {
  javascript: "JavaScript",
  python: "Python",
  jsx: "React (JSX)",
  tsx: "React (TSX)",
  typescript: "TypeScript",
  html: "HTML",
  css: "CSS",
  json: "JSON",
  sql: "SQL",
  markdown: "Markdown",
  go: "Go",
  rust: "Rust",
  cpp: "C++",
  java: "Java",
  php: "PHP",
};

export const FONT_FAMILIES: string[] = [
  "Fira Code", "JetBrains Mono", "Source Code Pro", "IBM Plex Mono",
  "Roboto Mono", "Menlo", "Consolas", "Courier New",
];

export const PRESET_THEMES: Record<string, Theme> = {
  githubDark: { name: "GitHub Dark", background: "#0d1117", theme: "github-dark" },
  oneLight: { name: "One Light", background: "#fafafa", theme: "atom-one-light" },
  dracula: { name: "Dracula", background: "#282a36", theme: "dracula" },
  nord: { name: "Nord", background: "#2e3440", theme: "nord" },
  monokai: { name: "Monokai", background: "#272822", theme: "monokai" },
  nightOwl: { name: "Night Owl", background: "#011627", theme: "night-owl" },
  solarizedLight: { name: "Solarized Light", background: "#fdf6e3", theme: "solarized-light"},
  vsCode: { name: "VS Code Dark", background: "#1e1e1e", theme: "vs2015" },
};

export const SHADOW_PRESETS = {
  none: "None",
  sm: "Small",
  md: "Medium",
  lg: "Large",
  xl: "X-Large",
};

export const BACKGROUND_STYLES: BackgroundStyle[] = [
  { id: 'solid', name: 'Solid', style: { background: 'transparent' } },
  { id: 'subtle-sky', name: 'Sky', style: { background: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)' } },
  { id: 'lush', name: 'Lush', style: { background: 'linear-gradient(120deg, #56ab2f 0%, #a8e063 100%)' } },
  { id: 'sunset', name: 'Sunset', style: { background: 'linear-gradient(to right, #ff7e5f, #feb47b)' } },
  { id: 'ocean', name: 'Ocean', style: { background: 'linear-gradient(to right, #2b5876, #4e4376)' } },
  { id: 'nebula', name: 'Nebula', style: { background: 'linear-gradient(to right, #8e2de2, #4a00e0)' } },
];

export const DEFAULT_STATE: State = {
  code: `function HelloWorld({ greeting = "Hello" }) {
  const [name, setName] = useState("World");
  return (
    <div className="container">
      <h1>{greeting}, {name}!</h1>
      <input 
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </div>
  );
}`,
  language: "jsx",
  theme: "githubDark",
  fontFamily: "JetBrains Mono",
  fontSize: 14,
  padding: 48,
  showLineNumbers: true,
  shadow: "lg",
  borderRadius: 12,
  backgroundStyleId: 'subtle-sky',
  showWindowControls: true,
  windowTitle: "hello-world.jsx",
};

export const PRETTIER_SUPPORTED_LANGUAGES = ['javascript', 'jsx', 'tsx', 'typescript', 'html', 'css', 'json', 'markdown'];
