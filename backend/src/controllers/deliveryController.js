import DeliveryAssignment from '../models/DeliveryAssignment.js';
import User from '../models/User.js';
import { deliveryService } from '../services/deliveryService.js';
import { ROLES } from '../config/constants.js';

export const getPartnerAssignments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { partner: req.user._id };

    if (status === 'active') {
      query.status = { $in: ['assigned', 'accepted', 'picked_up', 'out_for_delivery'] };
    } else if (status === 'completed') {
      query.status = { $in: ['delivered', 'failed', 'rejected'] };
    }

    const assignments = await DeliveryAssignment.find(query)
      .sort({ createdAt: -1 })
      .populate('order');

    res.json({ success: true, assignments });
  } catch (error) {
    next(error);
  }
};

export const updateAssignmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, otpCode, failReason, notes } = req.body;

    const result = await deliveryService.updatePartnerStatus({
      assignmentId: id,
      newStatus: status,
      partnerId: req.user._id,
      otpCode,
      failReason,
      notes
    });

    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const getAvailablePartners = async (req, res, next) => {
  try {
    const partners = await User.find({
      role: ROLES.DELIVERY_PARTNER,
      isActive: true
    }).select('name email phone deliveryPartnerProfile');

    res.json({ success: true, partners });
  } catch (error) {
    next(error);
  }
};

export const togglePartnerAvailability = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.deliveryPartnerProfile) {
      user.deliveryPartnerProfile = {};
    }
    user.deliveryPartnerProfile.isAvailable = !user.deliveryPartnerProfile.isAvailable;
    await user.save();

    res.json({
      success: true,
      isAvailable: user.deliveryPartnerProfile.isAvailable,
      message: `Status updated to ${user.deliveryPartnerProfile.isAvailable ? 'Online' : 'Offline'}`
    });
  } catch (error) {
    next(error);
  }
};
