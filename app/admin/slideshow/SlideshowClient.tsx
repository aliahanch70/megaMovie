'use client'

import SlideManager from '@/components/admin/products/SlideManager'

export default function SlideshowClient() {
    return (
        <div className="min-h-screen bg-black p-8">
            <div className="max-w-6xl mx-auto">
                <section className="mb-8">
                    <SlideManager />
                </section>
            </div>
        </div>
    )
}
