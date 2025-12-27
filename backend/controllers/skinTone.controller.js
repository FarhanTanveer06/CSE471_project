const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const sharp = require('sharp');

// Analyze skin tone from uploaded image using Face++ API
exports.analyzeSkinTone = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const apiKey = process.env.FACEPP_API_KEY;
    const apiSecret = process.env.FACEPP_API_SECRET;

    if (!apiKey || !apiSecret) {
      // Clean up uploaded file
      if (req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({ message: 'Face++ API credentials not configured' });
    }

    // Prepare form data for Face++ API
    const formData = new FormData();
    formData.append('api_key', apiKey);
    formData.append('api_secret', apiSecret);
    formData.append('image_file', fs.createReadStream(req.file.path));
    formData.append('return_attributes', 'gender,age,ethnicity');
    formData.append('return_landmark', '2'); // Get 83-point landmarks for cheek detection

    // Call Face++ Detect API
    const response = await axios.post(
      'https://api-us.faceplusplus.com/facepp/v3/detect',
      formData,
      { headers: formData.getHeaders() }
    );

    // Check if face was detected
    if (!response.data.faces || response.data.faces.length === 0) {
      // Clean up uploaded file
      if (req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'No face detected in the image. Please upload a clear photo of your face.' });
    }

    const face = response.data.faces[0];
    const faceRect = face.face_rectangle;

    if (!faceRect) {
      if (req.file.path) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ message: 'Could not detect face region. Please upload a clearer photo of your face.' });
    }

    // Analyze skin color from face region
    const analysisResult = await analyzeSkinFromFace(req.file.path, faceRect);

    // Clean up uploaded file
    if (req.file.path) {
      fs.unlinkSync(req.file.path);
    }

    // Get recommended colors based on skin tone
    const recommendedColors = getRecommendedColorsByBrightness(analysisResult.brightness, analysisResult.skinTone);

    res.json({
      skinTone: analysisResult.skinTone,
      recommendedColors,
      faceAttributes: {
        age: face.attributes?.age?.value,
        gender: face.attributes?.gender?.value,
        ethnicity: face.attributes?.ethnicity?.value
      },
      message: 'Skin tone analyzed successfully'
    });

  } catch (err) {
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Failed to analyze skin tone' });
  }
};

// Extract skin pixels from face region and calculate brightness
async function analyzeSkinFromFace(imagePath, faceRect) {
  const image = sharp(imagePath);
  const metadata = await image.metadata();

  // Extract face region (excluding edges to avoid hair/background)
  // Use center 70% of face width and middle 60% of face height
  const faceWidth = faceRect.width;
  const faceHeight = faceRect.height;
  const faceLeft = faceRect.left;
  const faceTop = faceRect.top;

  // Extract center region of face (avoiding edges with hair/background)
  const extractWidth = Math.round(faceWidth * 0.7);
  const extractHeight = Math.round(faceHeight * 0.6);
  const extractLeft = faceLeft + Math.round(faceWidth * 0.15);
  const extractTop = faceTop + Math.round(faceHeight * 0.2);

  // Validate coordinates
  const safeLeft = Math.max(0, Math.min(extractLeft, metadata.width - 1));
  const safeTop = Math.max(0, Math.min(extractTop, metadata.height - 1));
  const safeWidth = Math.max(1, Math.min(extractWidth, metadata.width - safeLeft));
  const safeHeight = Math.max(1, Math.min(extractHeight, metadata.height - safeTop));

  // Extract face region pixels
  const faceBuffer = await image
    .clone()
    .extract({
      left: safeLeft,
      top: safeTop,
      width: safeWidth,
      height: safeHeight
    })
    .resize(200, 200, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer();

  const safeLength = Math.floor(faceBuffer.length / 3) * 3;
  const pixelCount = safeLength / 3;

  if (pixelCount === 0) {
    throw new Error('No pixels extracted from face region');
  }

  // Calculate average RGB from face pixels
  let totalR = 0, totalG = 0, totalB = 0;

  for (let i = 0; i < safeLength; i += 3) {
    totalR += faceBuffer[i];
    totalG += faceBuffer[i + 1];
    totalB += faceBuffer[i + 2];
  }

  // Calculate average RGB
  const avgR = totalR / pixelCount;
  const avgG = totalG / pixelCount;
  const avgB = totalB / pixelCount;

  // Calculate brightness using luminance formula: 0.299*R + 0.587*G + 0.114*B
  const brightness = 0.299 * avgR + 0.587 * avgG + 0.114 * avgB;
  console.log('Brightness Value:', Math.round(brightness));

  // Determine skin tone based on brightness thresholds
  let skinTone;
  if (brightness > 132) {
    skinTone = 'light';
  } else if (brightness > 125) {
    skinTone = 'medium-light';
  } else if (brightness > 118) {
    skinTone = 'medium';
  } else if (brightness > 105) {
    skinTone = 'medium-dark';
  } else {
    skinTone = 'dark';
  }

  return {
    skinTone,
    brightness: Math.round(brightness)
  };
}

// Get recommended colors based on skin tone 
function getRecommendedColorsByBrightness(skinBrightness, skinTone) {
  const colorRecommendations = {
    'dark': {
      best: ['Black', 'Navy Blue', 'Dark Green', 'Maroon', 'Charcoal Gray'],
      avoid: ['White', 'Cream', 'Pastel Yellow', 'Baby Pink', 'Sky Blue', 'Ivory', 'Off-White'],
      description: 'Deep, rich colors like black, navy blue, and dark green will create strong contrast with your dark skin, making it appear lighter and more vibrant.'
    },
    'medium-dark': {
      best: ['Black','Navy Blue', 'Olive Green', 'Deep Teal', 'Wine'],
      avoid: ['Beige', 'Light Brown', 'Light Grey', 'Khaki', 'Tan', 'Cream'],
      description: 'Rich colors like Black, navy blue, olive green, and rust will create flattering contrast with your deeper wheatish skin, making it appear lighter.'
    },
    'medium': {
      best: ['Royal Blue', 'Forest Green', 'Mustard', 'Chocolate Brown'],
      avoid: ['Beige', 'Khaki', 'Dusty Pink', 'Light Brown', 'Tan', 'Cream'],
      description: 'Vibrant colors like royal blue, forest green, and mustard will enhance your medium wheatish skin tone beautifully.'
    },
    'medium-light': {
      best: ['Dark Navy', 'Deep Maroon', 'Green', 'Charcoal'],
      avoid: ['Beige', 'Khaki', 'Dusty Pink', 'Light Brown', 'Tan', 'Cream'],
      description: 'Darker colors like dark navy, deep maroon, and charcoal will make your light-wheatish skin appear brighter and more radiant.'
    },
    'light': {
      best: ['Black', 'Dark Blue', 'Dark Grey', 'Baby Pink', 'Dark Brown', 'Sky Blue', 'Blue', 'Red', 'White', 'Cream'],
      avoid: ['Pastel Yellow', 'Ivory', 'Off-White'],
      description: 'Dark, rich colors like black, deep blue, and dark maroon will make your fair skin look even lighter. Avoid light colors that can make you look washed out.'
    }
  };

  const recommendation = colorRecommendations[skinTone] || colorRecommendations['medium'];

  return {
    best: recommendation.best,
    conditional: [],
    avoid: recommendation.avoid,
    description: recommendation.description
  };
}

