export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  INVENTORY_MANAGER: 'inventory_manager',
  ORDER_MANAGER: 'order_manager',
  PRODUCTION_MANAGER: 'production_manager',
  DELIVERY_MANAGER: 'delivery_manager',
  DELIVERY_PARTNER: 'delivery_partner',
  SUPPORT_STAFF: 'support_staff',
  CUSTOMER: 'customer'
};

export const ORDER_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  PACKED: 'packed',
  READY_FOR_DISPATCH: 'ready_for_dispatch',
  ASSIGNED: 'assigned',
  PICKED_UP: 'picked_up',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  FAILED: 'failed',
  RETURNED: 'returned'
};

export const VALID_ORDER_TRANSITIONS = {
  [ORDER_STATUS.PENDING_PAYMENT]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.PACKED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PACKED]: [ORDER_STATUS.READY_FOR_DISPATCH, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.READY_FOR_DISPATCH]: [ORDER_STATUS.ASSIGNED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.ASSIGNED]: [ORDER_STATUS.PICKED_UP, ORDER_STATUS.READY_FOR_DISPATCH, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PICKED_UP]: [ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.FAILED],
  [ORDER_STATUS.OUT_FOR_DELIVERY]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.FAILED],
  [ORDER_STATUS.FAILED]: [ORDER_STATUS.READY_FOR_DISPATCH, ORDER_STATUS.RETURNED],
  [ORDER_STATUS.DELIVERED]: [ORDER_STATUS.RETURNED],
  [ORDER_STATUS.CANCELLED]: [],
  [ORDER_STATUS.RETURNED]: []
};

export const INVENTORY_TYPES = {
  RAW_MATERIAL: 'raw_material',
  INGREDIENT: 'ingredient',
  FLAVOUR: 'flavour',
  PACKAGING: 'packaging',
  WIP: 'wip',
  FINISHED_GOODS: 'finished_goods'
};

export const MOVEMENT_TYPES = {
  PURCHASE_RECEIPT: 'purchase_receipt',
  PRODUCTION_ISSUE: 'production_issue',
  PRODUCTION_RECEIPT: 'production_receipt',
  ORDER_RESERVATION: 'order_reservation',
  ORDER_FULFILLMENT: 'order_fulfillment',
  ORDER_CANCELLATION_RELEASE: 'order_cancellation_release',
  MANUAL_ADJUSTMENT: 'manual_adjustment',
  DAMAGED_WRITEOFF: 'damaged_writeoff',
  EXPIRED_WRITEOFF: 'expired_writeoff',
  RETURN_RESTOCK: 'return_restock'
};

export const PAYMENT_METHODS = {
  COD: 'cod',
  RAZORPAY: 'razorpay'
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

export const PRODUCTION_STATUS = {
  PLANNED: 'planned',
  MATERIALS_ISSUED: 'materials_issued',
  PROCESSING: 'processing',
  QUALITY_CHECK: 'quality_check',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export const EXPENSE_CATEGORIES = [
  'raw_material',
  'packaging',
  'transportation',
  'rent',
  'electricity',
  'salaries',
  'marketing',
  'equipment',
  'delivery',
  'maintenance',
  'other'
];
