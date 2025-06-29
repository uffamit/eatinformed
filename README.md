# eatinfromed

eatinformed is a Next.js application designed to help users understand the nutritional content and potential health implications of food products by analyzing images of food labels.

## Features

- Upload images of food labels.
- Extract key nutritional information.
- Assess potential health and safety concerns based on ingredients.
- Display results in a clear and organized format.

## Getting Started

### Prerequisites

- Node.js (version 18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository_url>
```

2. Navigate to the project directory:

```bash
cd nutri-scan
```

3. Install dependencies:

```bash
npm install
# or
yarn install
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

### Building for Production

```bash
npm run build
# or
yarn build
```

This builds the application for production to the `.next` folder.

### Running the Production Server

```bash
npm start
```

## Project Structure

- `src/app`: Contains the main application pages and routing.
- `src/components`: Reusable UI components.
- `src/hooks`: Custom React hooks.
- `src/lib`: Utility functions.
- `src/types`: TypeScript type definitions.
- `src/ai`: AI-related code, including flows for ingredient extraction and health assessment.

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

## License

[Specify your license here, e.g., MIT]