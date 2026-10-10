import Review from '../models/Review.js';
import Product from '../models/Product.js';

export const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId, status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, reviews });
  } catch (error) {
    next(error);
  }
};

export const addReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5 stars' });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Review comment cannot be empty' });
    }

    const review = await Review.create({
      product: productId,
      user: req.user._id,
      userName: req.user.name,
      rating: numRating,
      title: title || '',
      comment: comment.trim(),
      isVerifiedPurchase: true
    });

    // Update product rating summary
    const allReviews = await Review.find({ product: productId, status: 'approved' });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / (allReviews.length || 1);

    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(avg * 10) / 10,
      reviewCount: allReviews.length
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};
