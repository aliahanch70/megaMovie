import { Card, CardContent } from "@/components/ui/card"


interface Product {
  specifications?: Record<string, string | number>
}

interface ProductSpecificationsProps {
  product: Product
}

export default function ProductSpecifications({ product }: ProductSpecificationsProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-2xl font-bold mb-4">Technical Specifications</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(product.specifications || {}).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="font-medium">{key}:</span>
              <span>{String(value)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
