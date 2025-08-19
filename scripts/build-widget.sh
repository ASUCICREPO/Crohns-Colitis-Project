#!/bin/bash

# Build script for Crohns-Colitis Project Floating Chat Widget
echo "🚀 Building Crohns-Colitis Project Floating Chat Widget..."

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building the widget..."
npm run build

# Copy widget files to a dedicated widget directory
echo "📁 Organizing widget files..."
mkdir -p ../widget-dist
cp -r build/* ../widget-dist/

# Create widget-specific files
echo "📝 Creating widget integration files..."

# Create a simple integration guide
cat > ../widget-dist/INTEGRATION.md << 'EOF'
# Crohns-Colitis Project Chat Widget Integration

## Quick Start

Add this script tag to your website before the closing `</body>` tag:

```html
<script src="./static/js/widget.js" data-auto-init="true"></script>
```

## Manual Initialization

```html
<script src="./static/js/widget.js"></script>
<script>
  DisabilityRightsChatWidget.init();
</script>
```

## Features

- Floating chat button in bottom-right corner
- Expandable chat interface
- Multi-language support (English/Spanish)
- AI-powered responses via Amazon Q Business
- Cross-browser compatible
- Mobile responsive

## Customization

The widget automatically adapts to your website's theme and provides a consistent user experience across all devices.
EOF

echo "✅ Widget build complete!"
echo "📂 Widget files are in: ../widget-dist/"
echo "🌐 Deploy the contents of widget-dist/ to your web server"