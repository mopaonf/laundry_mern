const express = require('express');
const fetch = (...args) =>
   import('node-fetch').then(({ default: fetch }) => fetch(...args));
const router = express.Router();

const GOOGLE_API_KEY =
   process.env.GOOGLE_API_KEY || 'AIzaSyBEKnvw9LBl_-kBxYZHuKM2kGYOCLl-9Ms';

// Autocomplete endpoint
router.get('/autocomplete', async (req, res) => {
   try {
      const { input, components, types, location, radius } = req.query;

      if (!input || input.length < 3) {
         return res.json({ predictions: [] });
      }

      console.log('Places autocomplete request:', {
         input,
         components,
         types,
         location,
         radius,
      });

      let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
         input
      )}&key=${GOOGLE_API_KEY}`;

      // Add location bias if provided
      if (location) {
         url += `&location=${location}`;
         if (radius) {
            url += `&radius=${radius}`;
         }
      }

      // Add components to restrict to specific countries if needed
      if (components) {
         url += `&components=${components}`;
      } else {
         // Default to Cameroon for better local results
         url += `&components=country:cm`;
      }

      // Add types if specified
      if (types) {
         url += `&types=${types}`;
      }

      console.log('Fetching from Google API:', url);

      const response = await fetch(url);
      const data = await response.json();

      console.log('Google API response:', data);

      res.json(data);
   } catch (error) {
      console.error('Places autocomplete error:', error);
      res.status(500).json({
         error: 'Failed to fetch places',
         details: error.message,
      });
   }
});

// Place details endpoint
router.get('/details', async (req, res) => {
   try {
      const { place_id, fields } = req.query;

      if (!place_id) {
         return res.status(400).json({ error: 'place_id is required' });
      }

      console.log('Place details request:', { place_id, fields });

      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${GOOGLE_API_KEY}&fields=${
         fields || 'formatted_address,geometry'
      }`;

      console.log('Fetching place details from Google API:', url);

      const response = await fetch(url);
      const data = await response.json();

      console.log('Google API place details response:', data);

      res.json(data);
   } catch (error) {
      console.error('Place details error:', error);
      res.status(500).json({
         error: 'Failed to fetch place details',
         details: error.message,
      });
   }
});

// Geocoding endpoint
router.get('/geocode', async (req, res) => {
   try {
      const { latlng } = req.query;

      if (!latlng) {
         return res.status(400).json({ error: 'latlng is required' });
      }

      console.log('Geocoding request:', { latlng });

      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&key=${GOOGLE_API_KEY}`;

      console.log('Fetching geocoding from Google API:', url);

      const response = await fetch(url);
      const data = await response.json();

      console.log('Google API geocoding response:', data);

      res.json(data);
   } catch (error) {
      console.error('Geocoding error:', error);
      res.status(500).json({
         error: 'Failed to geocode location',
         details: error.message,
      });
   }
});

module.exports = router;
