'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { usePosts, extractYoutubeId } from '@/hooks/usePosts'
import { useToast } from '@/components/ui/Toaster'
import { CATEGORIES, POPULAR_TAGS, Category } from '@/types'
import { Upload, ImagePlus, X, Tag, Plus, Lightbulb, Youtube } from 'lucide-react'
import Image from 'next/image'
import clsx from 'clsx'

const TITLE_EXAMPLES = [
  'Cuando el wifi se cae justo en la mejor parte...',
  'Mi cara cuando el lunes llega sin avisar',
  'Yo a las 3am sin razon aparente',
  'El gato de mi vecina juzgandome otra vez',
  'Developers vs el codigo que ellos mismos escribieron',
]

export function CreatePostPage() {
  const { user, loading } = useAuthContext()
  const { createPost } = usePosts()
  const { toast } = useToast()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>('memes')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoPreviewId, setVideoPreviewId] = useState<string | null>(null)
  const [mediaTab, setMediaTab] = useState<'image' | 'video'>('image')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showTips, setShowTips] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!loading && !user) router.push('/')
  }, [user, loading])

  function handleFile(f: File) {
    if (!f.type.startsWith('image/')) { toast('⚠️', 'Solo imagenes'); return }
    if (f.size > 20 * 1024 * 1024) { toast('⚠️', 'Maximo 20MB'); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  function handleVideoUrl(url: string) {
    setVideoUrl(url)
    const id = extractYoutubeId(url)
    setVideoPreviewId(id)
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
    if (selectedTags.length >= 5) { toast('⚠️', 'Maximo 5 tags'); return }
    setSelectedTags(prev => [...prev, t])
    setCustomTag('')
  }

  function useTitleExample(example: string) {
    setTitle(example)
    setShowTips(false)
  }

  async function handleSubmit() {
    if (!title.trim()) { toast('⚠️', 'Escribe un titulo'); return }
    if (mediaTab === 'video' && videoUrl && !videoPreviewId) {
      toast('⚠️', 'Link de YouTube invalido'); return
    }
    setSubmitting(true)
    const { error } = await createPost(
      title.trim(),
      category,
      mediaTab === 'image' ? (file ?? undefined) : undefined,
      selectedTags,
      mediaTab === 'video' ? videoUrl : undefined
    )
    setSubmitting(false)
    if (error) { toast('❌', String(error)); return }
    toast('🚀', 'Post publicado!')
    router.push('/')
  }

  const titleQuality = title.length === 0 ? null
    : title.length < 15 ? 'corto'
    : title.length < 40 ? 'bueno'
    : 'excelente'

  const qualityColor = {
    corto: 'text-orange-400',
    bueno: 'text-accent2',
    excelente: 'text-fresh',
  }

  return (
    <div className="max-w-xl mx-auto px-4 pt-24 pb-16">
      <h1 className="font-bebas text-4xl tracking-wide mb-8">CREAR POST</h1>

      <div className="space-y-5">
        {/* Title */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted">Titulo *</label>
            <button
              onClick={() => setShowTips(o => !o)}
              className="flex items-center gap-1 text-[10px] text-muted hover:text-accent2 transition-colors font-mono"
            >
              <Lightbulb size={11} /> ejemplos
            </button>
          </div>

          {showTips && (
            <div className="mb-3 bg-surface2 border border-border rounded-xl p-3 space-y-1 animate-slideUp">
              <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-2">
                Titulos que funcionan mejor en Google:
              </p>
              {TITLE_EXAMPLES.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => useTitleExample(ex)}
                  className="w-full text-left text-xs text-muted hover:text-white hover:bg-surface px-2 py-1.5 rounded-lg transition-colors"
                >
                  {ex}
                </button>
              ))}
              <div className="pt-2 border-t border-border">
                <p className="text-[10px] text-muted">
                  Bueno: "Cuando el wifi se cae justo en la pelicula"
                </p>
                <p className="text-[10px] text-muted mt-1">
                  Evitar: "jajaja mira esto"
                </p>
              </div>
            </div>
          )}

          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ej: Cuando el wifi se cae justo en la mejor parte..."
            maxLength={120}
            className="w-full px-4 py-3 bg-surface border border-border rounded-xl text-sm outline-none focus:border-accent transition-colors"
          />

          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center gap-1.5">
              {titleQuality && (
                <>
                  <div className={clsx('w-1.5 h-1.5 rounded-full', {
                    'bg-orange-400': titleQuality === 'corto',
                    'bg-accent2': titleQuality === 'bueno',
                    'bg-fresh': titleQuality === 'excelente',
                  })} />
                  <span className={clsx('text-[10px] font-mono', qualityColor[titleQuality])}>
                    {titleQuality === 'corto' && 'Titulo muy corto'}
                    {titleQuality === 'bueno' && 'Buen titulo'}
                    {titleQuality === 'excelente' && 'Excelente titulo'}
                  </span>
                </>
              )}
              {!titleQuality && (
                <span className="text-[10px] text-muted font-mono">
                  Titulos descriptivos aparecen mejor en Google
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-muted">{title.length}/120</p>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-muted mb-2">Categoria</label>
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

          <div className="flex flex-wrap gap-1.5 mb-3">
            {POPULAR_TAGS.slice(0, 20).map(tag => (
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

        {/* Media — tabs imagen / video */}
        <div>
          <div className="flex gap-1 bg-surface2 rounded-xl p-1 mb-4">
            <button
              onClick={() => setMediaTab('image')}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all',
                mediaTab === 'image' ? 'bg-surface text-white' : 'text-muted hover:text-white'
              )}
            >
              <ImagePlus size={13} /> Imagen / GIF
            </button>
            <button
              onClick={() => setMediaTab('video')}
              className={clsx(
                'flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all',
                mediaTab === 'video' ? 'bg-surface text-white' : 'text-muted hover:text-white'
              )}
            >
              <Youtube size={13} /> Video YouTube
            </button>
          </div>

          {/* Imagen */}
          {mediaTab === 'image' && (
            <>
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
                  <p className="text-[10px] font-mono text-muted mt-1">PNG · JPG · GIF · WEBP · max 20MB</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </>
          )}

          {/* Video YouTube */}
          {mediaTab === 'video' && (
            <div>
              <div className="relative">
                <Youtube size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
                <input
                  type="text"
                  value={videoUrl}
                  onChange={e => handleVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full pl-9 pr-4 py-3 bg-surface border border-border rounded-xl text-sm outline-none focus:border-accent transition-colors"
                />
              </div>

              {videoUrl && !videoPreviewId && (
                <p className="text-[11px] text-accent font-mono mt-1">Link de YouTube invalido</p>
              )}

              {videoPreviewId && (
                <div className="mt-3 rounded-xl overflow-hidden bg-black aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoPreviewId}`}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              )}

              {!videoUrl && (
                <p className="text-[10px] text-muted font-mono mt-2">
                  Pega cualquier link de YouTube — videos, Shorts, todos funcionan
                </p>
              )}
            </div>
          )}
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