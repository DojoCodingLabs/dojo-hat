# Dojo Coding Hat Photo Editor

A fun and interactive photo editor that lets you add Dojo Coding hats to your photos! Upload your image, position and customize the hat overlay, and download your creation.

## Features

- 🎩 **Hat Overlay**: Add Dojo Coding hats to any photo
- 🎄 **Christmas Mode**: Toggle festive Christmas hat with animated background decorations
- 🎨 **Interactive Controls**:
  - Rotate hat left/right
  - Scale up/down
  - Flip horizontally
  - Drag to reposition
  - Reset to default position
- 💾 **Save & Download**: Export your edited image as PNG
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ✨ **Modern UI**: Clean white background with Dojo Coding branding

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dojo-hat
```

2. Install dependencies:
```bash
yarn install
```

3. Start the development server:
```bash
yarn start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Available Scripts

### `yarn start`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000). The page will reload automatically when you make changes.

### `yarn build`

Builds the app for production to the `build` folder. The build is optimized and ready for deployment.

### `yarn test`

Launches the test runner in interactive watch mode.

### `yarn deploy`

Builds and deploys the app to GitHub Pages (configured in `package.json`).

## Usage

1. **Upload an Image**: Click the file input to select an image from your device
2. **Position the Hat**: Click and drag the hat overlay to position it on your photo
3. **Customize**:
   - Use rotation buttons to rotate the hat
   - Use scale buttons to make it bigger or smaller
   - Use flip button to mirror the hat (disabled in Christmas mode)
   - Use reset button to return to default position
4. **Christmas Mode**: Toggle the checkbox at the top to switch to festive Christmas hat with animated decorations
5. **Save**: Click "Save Image" to download your edited photo

## Technology Stack

- **React** 18.3.1
- **TypeScript** 4.4.2
- **Tailwind CSS** - Styling
- **Create React App** - Build tooling

## Deployment

The app is configured to deploy to GitHub Pages. Run:

```bash
yarn deploy
```

This will build the app and deploy it to the `gh-pages` branch.

## License

© 2024 Dojo Coding™

## Links

- [Dojo Coding on X (Twitter)](https://x.com/dojocoding)
