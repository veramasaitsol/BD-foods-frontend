import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchOrders, selectOrders } from '@/store/slices/orderSlice';
import { fetchProductReviews, submitReview, type Review } from '@/services/reviewService';
import { toast } from 'sonner';

const StarPicker: React.FC<{ value: number; onChange: (value: number) => void }> = ({ value, onChange }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button key={star} type="button" onClick={() => onChange(star)} className="p-0.5">
        <Star className={`w-6 h-6 ${star <= value ? 'fill-spice-gold text-spice-gold' : 'text-border'}`} />
      </button>
    ))}
  </div>
);

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const orders = useAppSelector(selectOrders);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProductReviews(productId)
      .then(setReviews)
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchOrders());
  }, [isAuthenticated, dispatch]);

  const eligibleOrder = orders.find(
    (order) => order.status === 'delivered' && order.items.some((item) => item.productId === productId)
  );

  const handleSubmit = async () => {
    if (!eligibleOrder || rating === 0) return;
    setSubmitting(true);
    try {
      const review = await submitReview({
        productId,
        orderId: eligibleOrder.id,
        rating,
        comment: comment.trim() || undefined,
      });
      setReviews((prev) => [review, ...prev]);
      setRating(0);
      setComment('');
      toast.success('Thanks for your review!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not submit your review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-16">
      <h2 className="font-display text-2xl font-bold text-foreground mb-6">Customer Reviews</h2>

      {eligibleOrder && (
        <div className="bg-secondary rounded-xl p-5 mb-6">
          <p className="font-medium mb-3">Rate this product</p>
          <StarPicker value={rating} onChange={setRating} />
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product (optional)"
            className="mt-3 bg-background"
            rows={3}
          />
          <Button className="mt-3" disabled={rating === 0 || submitting} onClick={handleSubmit}>
            {submitting ? 'Submitting…' : 'Submit Review'}
          </Button>
        </div>
      )}

      {loading ? (
        <p className="text-muted-foreground">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-border pb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? 'fill-spice-gold text-spice-gold' : 'text-border'}`}
                    />
                  ))}
                </div>
                <span className="font-medium text-sm">{review.customer?.name || 'Anonymous'}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ProductReviews;
