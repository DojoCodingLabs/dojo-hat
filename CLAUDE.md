# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Dojo Coding-themed photo editor application that allows users to upload a photo and overlay a Dojo Coding hat onto it. The app features both regular and Christmas-themed hat modes with animated decorations. Built with React, TypeScript, and Tailwind CSS, and deployed to GitHub Pages.

## Development Commands

### Running the app
```bash
yarn start
```
Opens the app at http://localhost:3000 with hot-reload enabled.

### Building for production
```bash
yarn build
```
Creates an optimized production build in the `build/` folder.

### Testing
```bash
yarn test
```
Runs tests in interactive watch mode.

### Deployment
```bash
yarn deploy
```
Builds and deploys to GitHub Pages (automatically runs `yarn build` first).

## Architecture

### Component Structure

The application has a single-component architecture:
- **App.tsx**: Root component that renders the PhotoEditor
- **PhotoEditor** (`src/components/PhotoEditor/`): Main component containing all photo editing logic

### PhotoEditor Component

The PhotoEditor is a self-contained component managing all photo editing functionality:

**State Management:**
- `baseImage`: User-uploaded photo (as data URL)
- `currentHatImage`: Current hat image (right-dojo-hat.png, left-dojo-hat.png, or dojo-christmas-hat.png)
- `isChristmasMode`: Boolean toggle for Christmas theme with animated decorations
- `transform`: Hat positioning state (position, rotation, scale, flipX)
- `originalImageSize`: Original dimensions for proper canvas scaling
- `status`: Success/error messages with auto-dismiss

**Core Features:**
1. **Image Upload**: Accepts image files and converts to data URL
2. **Hat Overlay**: Draggable hat with transform controls
3. **Christmas Mode**: Toggleable festive theme with animated snowflakes, ornaments, and special Christmas hat
4. **Touch & Mouse Support**: Unified handlers for both input methods
5. **Canvas Export**: Saves composite image at original resolution

**Transform System:**
- Position: Drag to move (touch and mouse events)
- Rotation: 15° increments
- Scale: 1.1x multiplier, constrained to 0.1-7x range
- Flip: Toggles between left-dojo-hat.png and right-dojo-hat.png assets (disabled in Christmas mode)

**Save Logic** (`handleSave` function, line 150):
- Creates offscreen canvas at original image dimensions
- Calculates scale factors between displayed size and actual size
- Applies transforms (translate → rotate → scale) in correct order
- Downloads as 'you-are-a-partner-now.png'

### Type Definitions

See `src/components/PhotoEditor/types.ts`:
- `Position`: x/y coordinates
- `Transform`: Complete transformation state
- `TouchData`: Multi-touch gesture data (not currently used)

### Styling

Uses Tailwind CSS with custom theme extensions (see `tailwind.config.js`):
- Custom fadeIn animation for status messages
- Custom border-width-3 utility
- Color scheme: #ff6b2b (primary orange), white background (light theme)
- Christmas mode: Red-green gradient backgrounds with festive decorations
- Modern gradient buttons with hover effects and shadow animations
- Responsive design with mobile support

## Assets

- `src/assets/right-dojo-hat.png`: Default hat orientation
- `src/assets/left-dojo-hat.png`: Flipped hat orientation
- `src/assets/dojo-christmas-hat.png`: Christmas-themed hat overlay
- `src/assets/Logo-Dojo.png`: Dojo Coding logo displayed in header

## Deployment

Deployed to `hats.dojocoding.io` via GitHub Pages with custom domain configuration.

## Christmas Mode Details

When Christmas mode is enabled:
- Background changes to festive red-green gradient
- Animated snowflakes (❄️) appear throughout the background
- Christmas ornaments (🎄, 🎁, ⭐) float with animation
- Hat switches to `dojo-christmas-hat.png`
- Flip button is disabled (Christmas hat has no flip variant)
- Button styling changes to red-green gradient theme
- UI elements adopt festive color palette
