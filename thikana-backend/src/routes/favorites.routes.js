const express = require('express');
const router = express.Router();
const FavoritesController = require('../controllers/favorites.controller');
const auth = require('../middleware/auth.middleware');

// All favorites endpoints require authentication
router.use(auth);

router.get('/', FavoritesController.list.bind(FavoritesController));
router.post('/:propertyId', FavoritesController.add.bind(FavoritesController));
router.delete('/:propertyId', FavoritesController.remove.bind(FavoritesController));

module.exports = router;
