import Setting from '../models/Setting.js';

export const getSettings = async (req, res, next) => {
  try {
    const settingsList = await Setting.find();
    const settingsMap = {};
    settingsList.forEach(s => { settingsMap[s.key] = s.value; });

    // Include defaults if not yet in DB
    const response = {
      brand_name: settingsMap['brand_name'] || 'Zuno',
      tagline: settingsMap['tagline'] || 'Premium Artisanal Roasted Makhana',
      free_delivery_threshold: settingsMap['free_delivery_threshold'] !== undefined ? settingsMap['free_delivery_threshold'] : 499,
      standard_delivery_fee: settingsMap['standard_delivery_fee'] !== undefined ? settingsMap['standard_delivery_fee'] : 49,
      support_email: settingsMap['support_email'] || 'support@zuno.com',
      support_phone: settingsMap['support_phone'] || '+919876543210',
      serviceable_pincodes: settingsMap['serviceable_pincodes'] || ['110001', '110020', '110048', '560001', '560034', '400001', '400050'],
      auto_dispatch_enabled: settingsMap['auto_dispatch_enabled'] !== undefined ? settingsMap['auto_dispatch_enabled'] : true,
      delivery_eta_time: settingsMap['delivery_eta_time'] || '12 Mins',
      delivery_eta_badge: settingsMap['delivery_eta_badge'] || 'Diwali Rush Express'
    };

    res.json({ success: true, settings: response });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const updates = req.body;

    for (const [key, value] of Object.entries(updates)) {
      await Setting.findOneAndUpdate(
        { key },
        { key, value, updatedBy: req.user._id },
        { upsert: true, new: true }
      );
    }

    res.json({ success: true, message: 'Settings successfully updated' });
  } catch (error) {
    next(error);
  }
};

/**
 * Free Live Address Autocomplete & Search (OpenStreetMap Nominatim)
 */
export const geocodeAddress = async (req, res, next) => {
  try {
    const query = req.query.q?.trim();
    if (!query) {
      return res.json({ success: true, results: [] });
    }

    const settingsDoc = await Setting.findOne({ key: 'serviceable_pincodes' });
    const serviceablePincodes = settingsDoc?.value || ['110001', '110020', '110048', '560001', '560034', '400001', '400050'];

    const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=6&countrycodes=in`;
    
    const response = await fetch(osmUrl, {
      headers: {
        'User-Agent': 'ZunoMakhanaApp/1.0 (contact@zuno.com)'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim query failed with status: ${response.status}`);
    }

    const data = await response.json();

    const results = data.map((item) => {
      const addr = item.address || {};
      const postcode = addr.postcode || '';
      const locality = addr.suburb || addr.neighbourhood || addr.road || addr.village || addr.town || addr.city || '';
      const city = addr.city || addr.town || addr.state_district || addr.county || 'Bengaluru';
      const state = addr.state || 'Karnataka';

      return {
        displayName: item.display_name,
        name: item.name || locality || city,
        locality,
        city,
        state,
        pincode: postcode,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        isServiceable: postcode ? serviceablePincodes.includes(postcode) : true
      };
    });

    res.json({ success: true, results });
  } catch (error) {
    console.error('Geocoding error:', error.message);
    res.json({ success: true, results: [] });
  }
};

/**
 * Free Live Reverse Geocoding from GPS Coordinates (OpenStreetMap Nominatim)
 */
export const reverseGeocode = async (req, res, next) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    }

    const settingsDoc = await Setting.findOne({ key: 'serviceable_pincodes' });
    const serviceablePincodes = settingsDoc?.value || ['110001', '110020', '110048', '560001', '560034', '400001', '400050'];

    const osmUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
    
    const response = await fetch(osmUrl, {
      headers: {
        'User-Agent': 'ZunoMakhanaApp/1.0 (contact@zuno.com)'
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim reverse query failed with status: ${response.status}`);
    }

    const data = await response.json();
    const addr = data.address || {};

    const road = addr.road || '';
    const locality = addr.suburb || addr.neighbourhood || addr.residential || '';
    const city = addr.city || addr.town || addr.state_district || addr.county || 'Bengaluru';
    const state = addr.state || 'Karnataka';
    const pincode = addr.postcode || '';

    const areaName = locality ? `${locality}, ${city}` : city;
    const formattedShort = pincode ? `${areaName} - ${pincode}` : areaName;

    res.json({
      success: true,
      address: {
        displayName: data.display_name,
        shortLocation: formattedShort,
        street: road,
        locality,
        city,
        state,
        pincode,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        isServiceable: pincode ? serviceablePincodes.includes(pincode) : true
      }
    });
  } catch (error) {
    console.error('Reverse geocoding error:', error.message);
    // Graceful fallback for mock or offline coordinates
    res.json({
      success: true,
      address: {
        displayName: `GPS Pin (${parseFloat(lat).toFixed(4)}, ${parseFloat(lon).toFixed(4)})`,
        shortLocation: 'Bengaluru - 560001',
        street: 'Detected Location',
        locality: 'MG Road Area',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        isServiceable: true
      }
    });
  }
};
