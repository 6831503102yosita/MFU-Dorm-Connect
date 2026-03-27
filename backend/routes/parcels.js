'use strict';
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const c = require('../controllers/parcelController');

router.get('/', auth, c.listParcels);
router.post('/', auth, c.createParcel);
router.get('/:id', auth, c.getParcel);
router.patch('/:id/status', auth, c.updateParcelStatus);
router.delete('/:id', auth, c.deleteParcel);

module.exports = router;
