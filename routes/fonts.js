var express = require('express');
var router = express.Router();

const apiKeyGoogleFont = process.env.API_KEY_GOOGLE_FONT;

// Get all font of Google Font
router.get('/', (req, res) => {
  fetch(`https://webfonts.googleapis.com/v1/webfonts?key=${apiKeyGoogleFont}`)
    .then(response => response.json())
    .then(data => {
      res.json(
        data.items.map(font => ({
          name: font.family,
          weight: font.variants,
          category: font.category,
          files: font.files
        }))
      );
    })
    .catch(error => {
      console.error('Error fetching fonts:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});

module.exports = router;