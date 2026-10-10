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
      auto_dispatch_enabled: settingsMap['auto_dispatch_enabled'] !== undefined ? settingsMap['auto_dispatch_enabled'] : true
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
