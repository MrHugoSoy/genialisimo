'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { usePosts } from '@/hooks/usePosts'
import { useToast } from '@/components/ui/Toaster'
import { CATEGORIES, POPULAR_TAGS, Category } from '@/types'
import { Upload, ImagePlus, X, Tag, Plus } from 'lucide-react'
import Image from 'next/image'
import clsx from 'clsx'

export function CreatePostPage() {
  const { user, loading } = useAuthContext()
  const { createPost } = usePosts()
  const { toast } = useToast()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>('memes')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!loading && !user) router.push('/')
  }, [user, loading])

  function handleFile(f: File) {
    if (!f.type.startsWith('image/')) { toast('⚠️', 'Solo imágenes'); return }
    if (f.size > 20 * 1024 * 1024) { toast('⚠️', 'Máximo 20MB'); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  function toggleTag(tag: string) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag].slice(0, 5)
    )
  }

  function addCustomTag() {
    const t = customTag.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
    if (!t) return
    if (selectedTags.includes(t)) { setCustomTag(''); return }
    if (selectedTags.length >= 5) { toast('⚠️', 'Máximo 5 tags'); return }
    setSelectedTags(prev => [...prev, t])
    setCustomTag('')
  }

  async function handleSubmit() {
    if (!title.trim()) { toast('⚠️', 'Escribe un título'); return }
    setSubmitting(true)
    const { error } = await createPost(title.trim(), category, file ?? undefined, selectedTags)
    setSubmitting(false)
    if (error) { toast('❌', String(error)); return }
    toast('🚀', '¡Post publicado!')
    router.push('/')
  }

  return (
    <div className="max-w-xl mx-auto px-4 pt-24 pb-16">
      <h1 className="font-bebas text-4xl tracking-wide mb-8">CREAR POST</h1>

      <div className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-muted mb-2">Título *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Escribe algo que haga reír..."
            maxLength={120}
            className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm outline-none focus:border-accent transition-colors"
          />
          <p className="text-[10px] font-mono text-muted mt-1 text-right">{title.length}/120</p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-muted mb-2">Categoría</label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.entries(CATEGORIES) as [Category, any][]).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={clsx(
                  'flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-bold transition-all',
                  category === key
                    ? 'border-accent bg-accent/10 text-white'
                    : 'border-border bg-surface text-muted hover:border-border/80 hover:text-white'
                )}
              >
                <span className="text-xl">{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-muted mb-2">
            Tags <span className="text-muted normal-case">({selectedTags.length}/5)</span>
          </label>

          {/* Selected tags */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {selectedTags.map(tag => (
                <span
                  key={tag}
                  className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-accent/20 border border-accent text-accent font-mono font-bold"
                >
                  #{tag}
                  <button onClick={() => toggleTag(tag)} className="hover:text-white transition-colors">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Popular tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {POPULAR_TAGS.slice(0, 12).map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={clsx(
                  'text-[11px] px-2.5 py-1 rounded-full border font-mono font-bold transition-all',
                  selectedTags.includes(tag)
                    ? 'bg-accent/20 border-accent text-accent'
                    : 'border-border text-muted hover:border-accent hover:text-white'
                )}
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Custom tag input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={customTag}
                onChange={e => setCustomTag(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCustomTag()}
                placeholder="tag personalizado..."
                maxLength={20}
                className="w-full pl-8 pr-3 py-2 bg-surface2 border border-border rounded-lg text-sm outline-none focus:border-accent transition-colors font-mono"
              />
            </div>
            <button
              onClick={addCustomTag}
              className="px-3 py-2 bg-surface2 border border-border hover:border-accent rounded-lg text-muted hover:text-white transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-muted mb-2">Imagen / GIF</label>
          {preview ? (
            <div className="relative rounded-xl overflow-hidden bg-black">
              <Image src={preview} alt="preview" width={600} height={400} className="w-full object-contain max-h-80" />
              <button
                onClick={() => { setFile(null); setPreview(null) }}
                className="absolute top-3 right-3 w-8 h-8 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-black transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all"
            >
              <ImagePlus size={36} className="mx-auto mb-3 text-muted" />
              <p className="text-sm text-muted font-medium">Arrastra tu imagen o haz clic</p>
              <p className="text-[10px] font-mono text-muted mt-1">PNG · JPG · GIF · WEBP · máx 20MB</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !title.trim()}
          className="w-full py-4 bg-accent hover:bg-red-500 text-white rounded-xl font-bebas text-2xl tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-3"
        >
          <Upload size={20} />
          {submitting ? 'PUBLICANDO...' : 'PUBLICAR POST'}
        </button>
      </div>
    </div>
  )
}
