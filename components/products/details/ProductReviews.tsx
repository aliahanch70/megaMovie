import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ProductReviewsProps {
  productId: string
  session: any
}

export default function ProductReviews({ productId, session }: ProductReviewsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Customer Reviews</h3>
          {session && (
            <Button variant="outline">Write a Review</Button>
          )}
        </div>
        <div className="space-y-4">
          {/* Add review list and form components here */}
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      </CardContent>
    </Card>
  )
}
