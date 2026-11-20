const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/auth');

// All customer routes require authentication
router.use(protect);

router
  .route('/')
  .get(getCustomers)
  .post(createCustomer);

router
  .route('/:id')
  .get(getCustomerById)
  .put(updateCustomer)
  .delete(authorize('admin'), deleteCustomer);

module.exports = router;
