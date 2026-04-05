import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl mb-6">😶‍🌫️</p>
      <h1 className="font-bebas text-6xl tracking-wide text-accent mb-2">404</h1>
      <p className="text-muted text-lg mb-8">Esta página no existe... o se la comió un gato.</p>
      <Link
        href="/"
        className="px-8 py-3 bg-accent hover:bg-red-500 text-white font-bebas text-xl tracking-widest rounded-xl transition-colors"
      >
        VOLVER AL FEED
      </Link>
    </div>
  )
}
