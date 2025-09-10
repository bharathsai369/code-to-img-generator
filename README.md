# Code to Image Generator

A beautiful, modern React application that converts source code into shareable images with syntax highlighting, customizable themes, and various styling options.

![Code to Image Generator](https://via.placeholder.com/800x400/1e1e1e/ffffff?text=Code+to+Image+Generator)

## Features

✨ **Syntax Highlighting**: Support for 15+ programming languages  
🎨 **Multiple Themes**: 8 built-in themes (GitHub Dark, Dracula, Nord, etc.)  
🔧 **Customizable**: Adjust fonts, padding, shadows, and more  
📱 **Responsive Design**: Works perfectly on desktop and mobile  
💾 **Export Options**: Download as PNG or copy to clipboard  
🪟 **Window Controls**: Optional macOS-style window decorations  
📝 **Code Formatting**: Built-in Prettier integration  
🌈 **Background Styles**: 6 beautiful gradient backgrounds  

## Supported Languages

- JavaScript / JSX / TSX
- TypeScript
- Python
- HTML / CSS
- JSON
- SQL
- Go
- Rust
- C++
- Java
- PHP
- Markdown

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone or extract the project:
```bash
cd code-to-image-generator
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Paste or type your code** in the editor
2. **Select a programming language** from the dropdown
3. **Choose a theme** that matches your style
4. **Customize the appearance**:
   - Font family and size
   - Padding and border radius
   - Shadow effects
   - Background gradients
   - Window controls and line numbers
5. **Generate your image**:
   - Click "Download PNG" to save locally
   - Click "Copy Image" to copy to clipboard

## Building for Production

```bash
npm run build
npm run start
```

## Technologies Used

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Highlight.js** - Syntax highlighting
- **html-to-image** - Convert DOM to images
- **Prettier** - Code formatting
- **Lucide React** - Beautiful icons

## External Dependencies (CDN)

The app loads these libraries dynamically:
- Highlight.js (syntax highlighting)
- html-to-image (image generation)
- Prettier (code formatting)
- Google Fonts (custom fonts)

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
