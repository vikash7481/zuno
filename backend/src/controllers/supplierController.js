import Supplier from '../models/Supplier.js';

export const getSuppliers = async (req, res, next) => {
  try {
    const suppliers = await Supplier.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, suppliers });
  } catch (error) {
    next(error);
  }
};

export const createSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, supplier });
  } catch (error) {
    next(error);
  }
};

export const updateSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findByIdAndUpdate(id, req.body, { new: true });
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    res.json({ success: true, supplier });
  } catch (error) {
    next(error);
  }
};
