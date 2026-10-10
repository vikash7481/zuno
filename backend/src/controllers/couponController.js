import Coupon from '../models/Coupon.js';

export const getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    next(error);
  }
};

export const validateCoupon = async (req, res, next) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Coupon code is required' });

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    });

    if (!coupon) {
      return res.status(400).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit has been reached' });
    }

    if (cartTotal < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum cart value of ₹${coupon.minOrderValue} required for this coupon`
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percentage') {
      const raw = (cartTotal * coupon.discountValue) / 100;
      discount = Math.min(raw, coupon.maxDiscountAmount || raw);
    } else {
      discount = Math.min(coupon.discountValue, cartTotal);
    }

    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        calculatedDiscount: Math.round(discount * 100) / 100
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create({
      ...req.body,
      code: req.body.code.toUpperCase()
    });
    res.status(201).json({ success: true, coupon });
  } catch (error) {
    next(error);
  }
};
