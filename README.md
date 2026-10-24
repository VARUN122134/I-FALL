# I FALL

A beautiful, modern website that helps Instagram users discover who doesn't follow them back. All processing happens in your browser - your data never leaves your device.

## Features

- **Privacy-first**: All analysis happens locally in your browser. No data is uploaded to servers.
- **User-friendly**: Step-by-step guide to download your Instagram data
- **Automatic parsing**: Just upload your ZIP file, no extraction needed
- **Clear results**: See who doesn't follow you back, mutual connections, and more
- **Export**: Download results as CSV
- **Mobile & desktop support**: Works on all devices

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router DOM
- JSZip for ZIP parsing
- FileSaver.js for CSV export

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd ifall-app
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Build for production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Preview production build

```bash
npm run preview
```

## How to Use

1. Go to [Instagram Settings > Accounts Center > Your info and permissions > Download your info](https://www.instagram.com/download/request/)
2. Request your data (choose JSON format if available)
3. Wait for Instagram to email you the download link (can take up to 48 hours)
4. Download the ZIP file
5. Go to I FALL, upload the ZIP file - no need to extract it
6. View your results instantly

## Privacy

- No passwords required
- All processing is done in your browser using JavaScript
- Your Instagram export files are never uploaded to any server
- No analytics or tracking of personal data
- I FALL is not affiliated with or endorsed by Instagram or Meta

## License

MIT
