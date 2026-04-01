const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Base icon (you'll need to create this as icon-base.svg or icon-base.png)
const baseIcon = path.join(__dirname, '../public/icon-base.png');

async function generateIcons() {
    console.log('🎨 Generating PWA icons...\n');

    for (const size of sizes) {
        const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);

        try {
            await sharp(baseIcon)
                .resize(size, size, {
                    fit: 'contain',
                    background: { r: 79, g: 70, b: 229, alpha: 1 } // Primary color
                })
                .png()
                .toFile(outputPath);

            console.log(`✅ Generated ${size}x${size} icon`);
        } catch (error) {
            console.error(`❌ Error generating ${size}x${size} icon:`, error.message);
        }
    }

    console.log('\n✨ Icon generation complete!');
    console.log('\n📝 Next steps:');
    console.log('1. Replace public/icon-base.png with your actual logo');
    console.log('2. Run this script again: node scripts/generate-icons.js');
    console.log('3. Verify icons in public/icons/ directory');
}

// Check if base icon exists
if (!fs.existsSync(baseIcon)) {
    console.log('⚠️  Base icon not found!');
    console.log('\n📝 Creating placeholder icon...');

    // Create a simple placeholder icon
    const placeholderSvg = `
    <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
      <rect width="512" height="512" fill="#4F46E5"/>
      <text x="50%" y="50%" font-family="Arial" font-size="200" fill="white" text-anchor="middle" dominant-baseline="middle">📦</text>
    </svg>
  `;

    fs.writeFileSync(path.join(__dirname, '../public/icon-base.svg'), placeholderSvg);

    console.log('✅ Created placeholder icon at public/icon-base.svg');
    console.log('\n💡 Replace this with your actual logo and run the script again.');
} else {
    generateIcons();
}
