import { Image } from 'lucide-react'

export default function MediaLibraryPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Media Library</h1>
        <p className="text-sm text-gray-400 mt-1">All uploaded assets — copy URL, replace image, manage files</p>
      </div>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-14 w-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-5">
          <Image className="h-6 w-6 text-orange-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Media Library</h2>
        <p className="text-sm text-gray-400 max-w-sm">A grid view of all uploaded images and assets. Copy the CDN URL for use anywhere on the site, replace an image without changing its URL, or delete unused files.</p>
        <span className="mt-6 text-[11px] font-semibold bg-orange-100 text-orange-500 px-3 py-1.5 rounded-full">Coming soon</span>
      </div>
    </div>
  )
}
