import { ProductLink } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"

interface ProductPricesProps {
  product: ProductLink
}

export default function ProductPrices({ product }: ProductPricesProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-2xl font-bold mb-4">Price History</h3>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span>Current Price:</span>
            <span className="font-bold">${product.price}</span>
          </div>
          {/* Add more price-related information here */}
        </div>
      </CardContent>
    </Card>
  )
}
