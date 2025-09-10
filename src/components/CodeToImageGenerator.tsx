"use client";

import React, { useState, useRef, useCallback, useEffect, FC } from "react";
import {
  Type,
  Download,
  FileImage,
  Code,
  RotateCcw,
  Eye,
  Settings,
  Zap,
  Sparkles,
  Palette,
  Clipboard,
  Wand2,
  Image as ImageIcon,
} from "lucide-react";

import { State } from "@/types";
import {
  LANGUAGES,
  FONT_FAMILIES,
  PRESET_THEMES,
  SHADOW_PRESETS,
  BACKGROUND_STYLES,
  DEFAULT_STATE,
  PRETTIER_SUPPORTED_LANGUAGES,
} from "@/constants";
import { isColorDark } from "@/utils";
import { ControlGroup } from "./ControlGroup";

const CodeToImageGenerator: FC = () => {
  const [state, setState] = useState<State>(DEFAULT_STATE);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [notification, setNotification] = useState<string>("");
  const previewRef = useRef<HTMLDivElement | null>(null);
  const highlightedCodeRef = useRef<HTMLDivElement | null>(null);
  const editorTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  const updateState = useCallback((updates: Partial<State>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  useEffect(() => {
    const loadScript = (src: string) =>
      new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return resolve();
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error(`Failed to load script ${src}`));
        document.head.appendChild(script);
      });

    const embedStyle = async (url: string, id: string) => {
      try {
        const cssText = await (await fetch(url)).text();
        let styleEl = document.getElementById(id);
        if (!styleEl) {
          styleEl = document.createElement("style");
          styleEl.id = id;
          document.head.appendChild(styleEl);
        }
        styleEl.textContent = cssText;
      } catch (error) {
        console.error("Error embedding stylesheet:", error);
      }
    };

    embedStyle(
      `https://fonts.googleapis.com/css2?family=${FONT_FAMILIES.join(
        "&family="
      ).replace(/\s/g, "+")}&display=swap`,
      "google-fonts-style"
    );

    window.prettierPlugins = {};
    Promise.all([
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js"
      ),
      loadScript(
        "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"
      ),
      loadScript("https://unpkg.com/prettier@2.8.8/standalone.js"),
      loadScript("https://unpkg.com/prettier@2.8.8/parser-babel.js"),
      loadScript("https://unpkg.com/prettier@2.8.8/parser-html.js"),
      loadScript("https://unpkg.com/prettier@2.8.8/parser-postcss.js"),
      loadScript("https://unpkg.com/prettier@2.8.8/parser-typescript.js"),
    ])
      .then(() => {
        Promise.all(
          Object.keys(LANGUAGES).map((lang) => {
            if (["javascript", "html", "css", "typescript"].includes(lang))
              return Promise.resolve();
            return loadScript(
              `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/${lang}.min.js`
            ).catch(() => {});
          })
        ).then(() => setScriptsLoaded(true));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    const embedTheme = async () => {
      const theme = PRESET_THEMES[state.theme] || PRESET_THEMES.githubDark;
      const url = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${theme.theme}.min.css`;
      try {
        const cssText = await (await fetch(url)).text();
        let styleEl = document.getElementById("hljs-theme-style");
        if (!styleEl) {
          styleEl = document.createElement("style");
          styleEl.id = "hljs-theme-style";
          document.head.appendChild(styleEl);
        }
        const defaultColor = isColorDark(theme.background) ? "#f0f0f0" : "#333";
        styleEl.textContent = `.hljs { color: ${defaultColor}; background: transparent; } ${cssText}`;
      } catch (error) {
        console.error("Error embedding theme stylesheet:", error);
      }
    };
    embedTheme();
  }, [state.theme]);

  const highlightedCode = React.useMemo(() => {
    if (scriptsLoaded && window.hljs) {
      const lang = window.hljs.getLanguage(state.language)
        ? state.language
        : "plaintext";
      return window.hljs.highlight(state.code, { language: lang }).value;
    }
    return state.code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }, [state.code, state.language, scriptsLoaded]);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(""), 3000);
  };

  const handlePrettifyCode = () => {
    if (!PRETTIER_SUPPORTED_LANGUAGES.includes(state.language)) {
      showNotification(
        `Formatting not supported for ${
          LANGUAGES[state.language as keyof typeof LANGUAGES]
        }.`
      );
      return;
    }
    if (
      !window.prettier ||
      !window.prettierPlugins ||
      Object.keys(window.prettierPlugins).length < 4
    ) {
      showNotification("Prettier is not ready yet. Please wait a moment.");
      return;
    }
    try {
      const parserMap: Record<string, string> = {
        javascript: "babel",
        jsx: "babel",
        tsx: "typescript",
        typescript: "typescript",
        html: "html",
        css: "css",
        json: "json",
        markdown: "markdown",
      };
      const parser = parserMap[state.language];
      const formattedCode = window.prettier.format(state.code, {
        parser: parser,
        plugins: Object.values(window.prettierPlugins),
        semi: true,
        singleQuote: false,
        tabWidth: 2,
      });
      updateState({ code: formattedCode });
      showNotification("Code formatted!");
    } catch (error) {
      const langName =
        LANGUAGES[state.language as keyof typeof LANGUAGES] || state.language;
      showNotification(`Formatting failed. Ensure code is valid ${langName}.`);
    }
  };

  const generateAndDownload = async (type: "png" | "clipboard") => {
    if (!previewRef.current || !window.htmlToImage) return;
    setIsGenerating(true);
    try {
      // Get the exact content dimensions
      const previewElement = previewRef.current;
      if (!previewElement) return;

      // Get the actual content wrapper
      const contentWrapper = previewElement.querySelector(
        ".code-content-wrapper"
      );
      if (!contentWrapper) return;

      // Store original styles
      const originalPreviewStyle = previewElement.style.cssText;
      const originalWrapperStyle = contentWrapper.style.cssText;

      // Reset constraints and force dimensions to match content
      previewElement.style.width = "fit-content";
      previewElement.style.height = "fit-content";
      previewElement.style.maxWidth = "none";
      previewElement.style.maxHeight = "none";
      contentWrapper.style.width = "fit-content";
      contentWrapper.style.height = "fit-content";

      // Wait for the DOM to update
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Get the exact dimensions
      const { width, height } = contentWrapper.getBoundingClientRect();

      const blob = await window.htmlToImage.toBlob(previewElement, {
        pixelRatio: 2.5,
        width: Math.ceil(width),
        height: Math.ceil(height),
      });

      // Restore original styling
      previewElement.style.cssText = originalPreviewStyle;
      contentWrapper.style.cssText = originalWrapperStyle;

      if (!blob) throw new Error("Blob generation failed.");

      if (type === "clipboard") {
        if (navigator.clipboard && typeof ClipboardItem !== "undefined") {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          showNotification("Image copied to clipboard!");
        }
      } else {
        const link = document.createElement("a");
        link.download = `code-snippet-${Date.now()}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
      }
    } catch (error) {
      console.error("Image generation failed:", error);
      showNotification("Image generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (highlightedCodeRef.current) {
      highlightedCodeRef.current.scrollTop = e.currentTarget.scrollTop;
      highlightedCodeRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const getLineNumbers = () => {
    const lineCount = state.code.split("\n").length;
    if (state.code === "") return "1";
    return Array.from({ length: lineCount }, (_, i) => i + 1).join("\n");
  };

  const getTheme = () => PRESET_THEMES[state.theme] || PRESET_THEMES.githubDark;
  const isThemeDark = isColorDark(getTheme().background);

  const getShadowStyle = () => {
    const shadowMap: Record<string, string> = {
      sm: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
      md: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
      lg: "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
      xl: "0 25px 50px -12px rgba(0,0,0,0.25)",
    };
    return shadowMap[state.shadow] || "none";
  };

  return (
    <>
      <main className="min-h-screen bg-gray-50 font-sans">
        <div className="container mx-auto px-4 md:px-8 py-8 max-w-7xl">
          <header className="text-center mb-10">
            <div className="inline-block p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
              <Code className="text-white" size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 tracking-tight">
              Code to Image Generator
            </h1>
            <p className="text-gray-600 text-lg mt-3 max-w-2xl mx-auto">
              Create beautiful, shareable images of your source code.
            </p>
          </header>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Code size={20} className="text-blue-500" />
                    Code Editor
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrettifyCode}
                      disabled={
                        !scriptsLoaded ||
                        !PRETTIER_SUPPORTED_LANGUAGES.includes(state.language)
                      }
                      title={
                        PRETTIER_SUPPORTED_LANGUAGES.includes(state.language)
                          ? "Format code"
                          : "Formatting not supported"
                      }
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Wand2 size={16} />
                      Prettify
                    </button>
                    <button
                      onClick={() => setState(DEFAULT_STATE)}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      <RotateCcw size={16} />
                      Reset
                    </button>
                  </div>
                </div>
                <div className="relative w-full" style={{ minHeight: "24rem" }}>
                  <textarea
                    ref={editorTextareaRef}
                    value={state.code}
                    onChange={(e) => updateState({ code: e.target.value })}
                    onScroll={handleScroll}
                    aria-label="Code editor"
                    className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent z-10 resize-y font-mono whitespace-pre overflow-auto"
                    style={{
                      fontFamily: state.fontFamily,
                      fontSize: state.fontSize,
                      lineHeight: 1.6,
                      caretColor: isThemeDark ? "white" : "black",
                      tabSize: 2,
                      minHeight: "24rem",
                    }}
                    spellCheck="false"
                  />
                  <div
                    ref={highlightedCodeRef}
                    className="absolute inset-0 w-full h-full rounded-lg overflow-auto"
                    style={{ backgroundColor: getTheme().background }}
                  >
                    <pre
                      className="!m-0 !p-4"
                      style={{
                        fontFamily: state.fontFamily,
                        fontSize: state.fontSize,
                        lineHeight: 1.6,
                        tabSize: 2,
                      }}
                    >
                      <code
                        className={`hljs language-${state.language} !p-0 !bg-transparent`}
                        dangerouslySetInnerHTML={{ __html: highlightedCode }}
                      />
                    </pre>
                  </div>
                </div>
              </section>
              <section className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                  <Settings size={20} className="text-purple-500" />
                  Styling Controls
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ControlGroup
                    label="Theme"
                    className="md:col-span-2 lg:col-span-1"
                  >
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {Object.entries(PRESET_THEMES).map(([key, theme]) => (
                        <button
                          key={key}
                          onClick={() => updateState({ theme: key })}
                          className={`p-2 rounded-md border-2 text-xs transition-all ${
                            state.theme === key
                              ? "border-blue-500 ring-2 ring-blue-200"
                              : "border-gray-200 hover:border-gray-400"
                          }`}
                          style={{
                            backgroundColor: theme.background,
                            color: isColorDark(theme.background)
                              ? "#fff"
                              : "#333",
                          }}
                        >
                          {theme.name}
                        </button>
                      ))}
                    </div>
                  </ControlGroup>
                  <div className="space-y-4">
                    <ControlGroup label="Language">
                      <select
                        value={state.language}
                        onChange={(e) =>
                          updateState({ language: e.target.value })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        {Object.entries(LANGUAGES).map(([key, name]) => (
                          <option key={key} value={key}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </ControlGroup>
                    <ControlGroup label="Font Family">
                      <select
                        value={state.fontFamily}
                        onChange={(e) =>
                          updateState({ fontFamily: e.target.value })
                        }
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        {FONT_FAMILIES.map((font) => (
                          <option
                            key={font}
                            value={font}
                            style={{ fontFamily: font }}
                          >
                            {font}
                          </option>
                        ))}
                      </select>
                    </ControlGroup>
                  </div>
                  <div className="space-y-4">
                    <ControlGroup label={`Padding (${state.padding}px)`}>
                      <input
                        type="range"
                        min="16"
                        max="128"
                        value={state.padding}
                        onChange={(e) =>
                          updateState({ padding: +e.target.value })
                        }
                        className="w-full"
                      />
                    </ControlGroup>
                    <ControlGroup label={`Font Size (${state.fontSize}px)`}>
                      <input
                        type="range"
                        min="10"
                        max="24"
                        value={state.fontSize}
                        onChange={(e) =>
                          updateState({ fontSize: +e.target.value })
                        }
                        className="w-full"
                      />
                    </ControlGroup>
                    <ControlGroup
                      label={`Border Radius (${state.borderRadius}px)`}
                    >
                      <input
                        type="range"
                        min="0"
                        max="32"
                        value={state.borderRadius}
                        onChange={(e) =>
                          updateState({ borderRadius: +e.target.value })
                        }
                        className="w-full"
                      />
                    </ControlGroup>
                  </div>
                  <ControlGroup label="Background">
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      {BACKGROUND_STYLES.map((bg) => (
                        <button
                          key={bg.id}
                          title={bg.name}
                          onClick={() =>
                            updateState({ backgroundStyleId: bg.id })
                          }
                          className={`h-10 rounded-md border-2 transition-all ${
                            state.backgroundStyleId === bg.id
                              ? "border-blue-500 ring-2 ring-blue-200"
                              : "border-gray-200"
                          }`}
                          style={bg.style}
                        ></button>
                      ))}
                    </div>
                  </ControlGroup>
                  <ControlGroup label="Shadow">
                    <select
                      value={state.shadow}
                      onChange={(e) => updateState({ shadow: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md mt-2"
                    >
                      {Object.entries(SHADOW_PRESETS).map(([key, name]) => (
                        <option key={key} value={key}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </ControlGroup>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={state.showWindowControls}
                        onChange={(e) =>
                          updateState({ showWindowControls: e.target.checked })
                        }
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />{" "}
                      Show window controls
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={state.showLineNumbers}
                        onChange={(e) =>
                          updateState({ showLineNumbers: e.target.checked })
                        }
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />{" "}
                      Show line numbers
                    </label>
                    {state.showWindowControls && (
                      <ControlGroup label="Window Title">
                        <input
                          type="text"
                          value={state.windowTitle}
                          onChange={(e) =>
                            updateState({ windowTitle: e.target.value })
                          }
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                      </ControlGroup>
                    )}
                  </div>
                </div>
              </section>
            </div>
            <aside className="lg:sticky top-8 self-start w-full">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-4">
                <Eye size={20} className="text-green-500" />
                Live Preview
              </h3>
              <div
                className="p-4 md:p-8 rounded-2xl transition-all duration-300 overflow-auto max-h-[calc(100vh-12rem)]"
                style={
                  BACKGROUND_STYLES.find(
                    (bg) => bg.id === state.backgroundStyleId
                  )?.style
                }
              >
                <div
                  ref={previewRef}
                  className="min-w-fit max-w-full"
                  style={{
                    boxShadow: getShadowStyle(),
                  }}
                >
                  <div
                    className="code-content-wrapper"
                    style={{
                      backgroundColor: getTheme().background,
                      borderRadius: `${state.borderRadius}px`,
                      overflow: "auto",
                      maxWidth: "100%",
                    }}
                  >
                    {state.showWindowControls && (
                      <div
                        className="flex items-center gap-2 px-4 py-3"
                        style={{
                          borderBottom: `1px solid rgba(${
                            isThemeDark ? "255,255,255" : "0,0,0"
                          }, 0.1)`,
                        }}
                      >
                        <div className="flex gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                        <div
                          className="flex-1 text-center text-xs font-medium"
                          style={{
                            color: isThemeDark ? "#ffffff99" : "#00000099",
                            fontFamily: "sans-serif",
                          }}
                        >
                          {state.windowTitle}
                        </div>
                      </div>
                    )}
                    <div
                      style={{ padding: `${state.padding}px` }}
                      className="flex whitespace-pre min-w-0"
                    >
                      {state.showLineNumbers && (
                        <pre
                          className="!m-0 !p-0 pr-4 text-right opacity-50 select-none shrink-0"
                          style={{
                            fontFamily: state.fontFamily,
                            fontSize: `${state.fontSize}px`,
                            lineHeight: 1.6,
                            tabSize: 2,
                          }}
                        >
                          <code>{getLineNumbers()}</code>
                        </pre>
                      )}
                      <pre
                        className="!m-0 !p-0 overflow-x-auto min-w-0"
                        style={{
                          fontFamily: state.fontFamily,
                          fontSize: `${state.fontSize}px`,
                          lineHeight: 1.6,
                          tabSize: 2,
                        }}
                      >
                        <code
                          className={`hljs language-${state.language} !p-0 !bg-transparent`}
                          dangerouslySetInnerHTML={{ __html: highlightedCode }}
                        />
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mt-6">
                <button
                  onClick={() => generateAndDownload("png")}
                  disabled={isGenerating || !scriptsLoaded}
                  className="flex-grow flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 transition-all transform hover:scale-105"
                >
                  <FileImage size={18} />
                  Download PNG
                </button>
                <button
                  onClick={() => generateAndDownload("clipboard")}
                  disabled={isGenerating || !scriptsLoaded}
                  className="flex-grow flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold shadow-lg bg-gray-700 text-white hover:bg-gray-800 disabled:opacity-50 transition-all transform hover:scale-105"
                >
                  <Clipboard size={18} />
                  Copy Image
                </button>
              </div>
            </aside>
          </div>
        </div>
        {notification && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-fade-in-out">
            {notification}
          </div>
        )}
      </main>
    </>
  );
};

export default CodeToImageGenerator;
