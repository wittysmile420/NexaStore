const express = require('express');
const Product = require('../models/Product');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/products/categories — public list of categories
router.get('/categories', authenticate, async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories.sort());
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/products/analytics/summary — admin only
router.get('/analytics/summary', authenticate, requireAdmin, async (req, res) => {
  try {
    const [stats] = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          totalInventoryValue: { $sum: { $multiply: ['$price', '$stock'] } },
          publishedCount: {
            $sum: { $cond: ['$isPublished', 1, 0] },
          },
          unpublishedCount: {
            $sum: { $cond: ['$isPublished', 0, 1] },
          },
        },
      },
    ]);

    const categoryDistribution = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
      { $sort: { count: -1 } },
    ]);

    const ratingDistribution = await Product.aggregate([
      {
        $bucket: {
          groupBy: '$rating',
          boundaries: [0, 1, 2, 3, 4, 5.01],
          default: 'Other',
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    const priceRanges = await Product.aggregate([
      {
        $bucket: {
          groupBy: '$price',
          boundaries: [0, 25, 50, 100, 250, 500, 1000, 5000],
          default: '5000+',
          output: { count: { $sum: 1 }, avgRating: { $avg: '$rating' } },
        },
      },
    ]);

    const stockStatus = await Product.aggregate([
      {
        $group: {
          _id: '$availabilityStatus',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      ...stats,
      categoryDistribution,
      ratingDistribution,
      priceRanges,
      stockStatus,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/products — list with search, filter, sort, pagination
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      search,
      category,
      sort,
      order = 'asc',
      page = 1,
      limit = 12,
      minRating,
      minPrice,
      maxPrice,
    } = req.query;

    const filter = {};

    // Role-based: users only see published products
    if (req.user.role !== 'admin') {
      filter.isPublished = true;
    }

    // Search by title (case-insensitive regex for partial match)
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    // Multi-category filter (comma-separated)
    if (category) {
      const categories = category.split(',').map(c => c.trim());
      filter.category = { $in: categories };
    }

    // Rating filter
    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Sort options
    const sortOptions = {};
    if (sort) {
      const sortOrder = order === 'desc' ? -1 : 1;
      switch (sort) {
        case 'price':
          sortOptions.price = sortOrder;
          break;
        case 'rating':
          sortOptions.rating = sortOrder;
          break;
        case 'name':
          sortOptions.title = sortOrder;
          break;
        default:
          sortOptions.createdAt = -1;
      }
    } else {
      sortOptions.createdAt = -1;
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error('Products list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/products/:id — single product detail
router.get('/:id', authenticate, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Users can't see unpublished products
    if (req.user.role !== 'admin' && !product.isPublished) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Product detail error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /api/products/:id/toggle-publish — admin only
router.patch('/:id/toggle-publish', authenticate, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isPublished = !product.isPublished;
    await product.save();

    res.json({
      message: `Product ${product.isPublished ? 'published' : 'unpublished'} successfully`,
      product,
    });
  } catch (error) {
    console.error('Toggle publish error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
