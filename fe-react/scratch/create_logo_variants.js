const sharp = require('sharp');
const path = require('path');

const inputPath = path.join(__dirname, '../public/closet-logo.png');
const whiteOutputPath = path.join(__dirname, '../public/closet-logo-white.png');
const goldOutputPath = path.join(__dirname, '../public/closet-logo-gold.png');

async function generateLogoVariants() {
  console.log('Processing closet-logo.png...');
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  console.log(`Image info: ${width}x${height}, channels: ${channels}`);

  // Create White Buffer
  const whiteBuffer = Buffer.from(data);
  // Create Gold Buffer (#D4AF37 -> R: 212, G: 175, B: 55)
  const goldBuffer = Buffer.from(data);

  for (let i = 0; i < data.length; i += channels) {
    const alpha = data[i + 3];

    if (alpha > 5) {
      // White logo: set RGB to 255, keep alpha
      whiteBuffer[i] = 255;
      whiteBuffer[i + 1] = 255;
      whiteBuffer[i + 2] = 255;

      // Gold logo: set RGB to #D4AF37 (212, 175, 55), keep alpha
      goldBuffer[i] = 212;
      goldBuffer[i + 1] = 175;
      goldBuffer[i + 2] = 55;
    }
  }

  // Save White Logo
  await sharp(whiteBuffer, {
    raw: { width, height, channels }
  })
  .png()
  .toFile(whiteOutputPath);

  console.log('Saved closet-logo-white.png');

  // Save Gold Logo
  await sharp(goldBuffer, {
    raw: { width, height, channels }
  })
  .png()
  .toFile(goldOutputPath);

  console.log('Saved closet-logo-gold.png');
}

generateLogoVariants().catch(err => {
  console.error('Error generating logo variants:', err);
});
