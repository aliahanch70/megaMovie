export default function MovieDetailPage() {
    return (
      <div className="min-h-screen bg-neutral-950 text-white p-6">
        {/* Hero Section */}
        <div className="relative h-64 w-full rounded-2xl overflow-hidden mb-8">
          <img
            src="https://res.cloudinary.com/dxldyoda8/image/upload/v1742025431/products/uploads/1742025427247-ksh4sutjeg.jpg"
            alt="Daredevil background"
            className="object-cover w-full h-full opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-black/70 to-transparent flex flex-col justify-end p-6">
            <h1 className="text-4xl font-bold text-red-500">Daredevil: Born Again <span className="text-white">(2025)</span></h1>
            <div className="mt-2 text-yellow-400 text-lg flex items-center gap-1">
              <span className="text-xl">⭐</span> 8.6
            </div>
          </div>
        </div>
  
        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Poster */}
          <div className="w-full">
            <img
              src="https://res.cloudinary.com/dxldyoda8/image/upload/v1742025431/products/uploads/1742025427247-ksh4sutjeg.jpg"
              alt="Daredevil poster"
              className="rounded-xl shadow-lg"
            />
          </div>
  
          {/* Movie Info */}
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-semibold mb-1">Description</h2>
              <p className="text-neutral-300">
                Matt Murdock finds himself on a collision course with Wilson Fisk when their past identities begin to emerge.
              </p>
            </div>
  
            <div>
              <h3 className="text-xl font-semibold mb-1">Genres</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm">Action</span>
                <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm">Drama</span>
                <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">Crime</span>
              </div>
            </div>
  
            <div>
              <h3 className="text-xl font-semibold mb-1">Status</h3>
              <span className="bg-red-800 text-white px-3 py-1 rounded-full text-sm">Out of Stock</span>
            </div>
  
            <div className="mt-4 flex gap-4">
              <button className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-xl font-medium">Watch Trailer</button>
              <button className="border border-white px-5 py-2 rounded-xl font-medium hover:bg-white hover:text-black">Add to Watchlist</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  