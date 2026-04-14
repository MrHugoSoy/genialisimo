'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/components/auth/AuthProvider'
import { useToast } from '@/components/ui/Toaster'
import { createClient } from '@/lib/supabase'
import { Upload, Download, Send } from 'lucide-react'

const TEMPLATES = ['😂', '🤔', '😤', '💀', '🗿', '😭', '🤡', '👀', '🙏', '😈']
const FONTS = ['Impact', 'Arial Black', 'Comic Sans MS', 'Arial']

export function MemeGenerator() {
  const { user } = useAuthContext()
  const { toast } = useToast()
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [topText, setTopText] = useState('TEXTO SUPERIOR')
  const [bottomText, setBottomText] = useState('TEXTO INFERIOR')
  const [fontSize, setFontSize] = useState(48)
  const [fontFamily, setFontFamily] = useState('Impact')
  const [textColor, setTextColor] = useState('#ffffff')
  const [bgColor, setBgColor] = useState('#000000')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>('😂')
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null)
  const [aspect, setAspect] = useState<'1:1' | '16:9' | '9:16'>('1:1')
  const [publishing, setPublishing] = useState(false)
  const [title, setTitle] = useState('')
  const [tagsInput, setTagsInput] = useState('meme,genialisimo')

  const getDimensions = () => {
    switch (aspect) {
      case '16:9': return { w: 800, h: 450 }
      case '9:16': return { w: 450, h: 800 }
      default: return { w: 600, h: 600 }
    }
  }

  const drawMeme = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const { w, h } = getDimensions()
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, w, h)

    if (uploadedImage) {
      const imgRatio = uploadedImage.width / uploadedImage.height
      const canvasRatio = w / h
      let sx = 0, sy = 0, sw = uploadedImage.width, sh = uploadedImage.height
      if (imgRatio > canvasRatio) {
        sw = uploadedImage.height * canvasRatio
        sx = (uploadedImage.width - sw) / 2
      } else {
        sh = uploadedImage.width / canvasRatio
        sy = (uploadedImage.height - sh) / 2
      }
      ctx.drawImage(uploadedImage, sx, sy, sw, sh, 0, 0, w, h)
    } else if (selectedTemplate) {
      ctx.font = `${h * 0.35}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(selectedTemplate, w / 2, h / 2)
    }

    const drawText = (text: string, y: number) => {
      if (!text) return
      ctx.font = `900 ${fontSize}px ${fontFamily}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = fontSize / 6
      ctx.lineJoin = 'round'
      ctx.strokeText(text.toUpperCase(), w / 2, y)
      ctx.fillStyle = textColor
      ctx.fillText(text.toUpperCase(), w / 2, y)
    }

    drawText(topText, fontSize * 1.1)
    drawText(bottomText, h - fontSize * 1.1)

    ctx.font = 'bold 14px Arial'
    ctx.fillStyle = 'rgba(255,70,84,0.6)'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'bottom'
    ctx.fillText('GENIALISIMO.COM', w - 10, h - 8)
  }, [topText, bottomText, fontSize, fontFamily, textColor, bgColor, selectedTemplate, uploadedImage, aspect])

  useEffect(() => { drawMeme() }, [drawMeme])

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const img = new window.Image()
    img.onload = () => {
      setUploadedImage(img)
      setSelectedTemplate(null)
    }
    img.src = URL.createObjectURL(file)
  }

  function handleDownload() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'meme-genialisimo.png'
    link.href = canvas.toDataURL()
    link.click()
    toast('⬇️', 'Meme descargado')
  }

  async function handlePublish() {
    if (!user) { router.push('/'); toast('⚠️', 'Inicia sesion para publicar'); return }
    if (!title.trim()) { toast('⚠️', 'Agrega un titulo al meme'); return }
    setPublishing(true)
    try {
      const canvas = canvasRef.current!
      const blob = await new Promise<Blob>(res => canvas.toBlob(b => res(b!), 'image/jpeg', 0.9))
      const file = new File([blob], `meme-${Date.now()}.jpg`, { type: 'image/jpeg' })
      const supabase = createClient()
      const path = `${user.id}/${Date.now()}-meme.jpg`
      const { error: uploadError } = await supabase.storage.from('posts').upload(path, file)
      if (uploadError) throw uploadError
      const image_url = supabase.storage.from('posts').getPublicUrl(path).data.publicUrl
      const tags = tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
      const { error } = await supabase.from('posts').insert({
        title: title.trim(),
        category: 'memes',
        image_url,
        user_id: user.id,
        tags,
      })
      if (error) throw error
      toast('🔥', 'Meme publicado!')
      router.push('/')
    } catch {
      toast('❌', 'Error al publicar')
    }
    setPublishing(false)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 pt-20 pb-16">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-bebas text-3xl tracking-wide">Crear Meme</h1>
        <span className="text-[11px] font-mono text-muted bg-surface2 border border-border px-3 py-1 rounded-full">Beta</span>
      </div>

      {/* Layout — mobile: columna, desktop: dos columnas */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* Canvas — primero en mobile */}
        <div className="w-full lg:flex-1 lg:min-w-0 order-first lg:order-last">
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="p-4 flex items-center justify-center bg-[#111]" style={{ minHeight: 300 }}>
              <canvas
                ref={canvasRef}
                style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8, display: 'block' }}
              />
            </div>
            <div className="p-4 border-t border-border space-y-3">
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Titulo del meme para publicar..."
                className="w-full px-4 py-2.5 bg-surface2 border border-border rounded-lg text-sm outline-none focus:border-accent transition-colors"
              />
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm font-mono">#</span>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  placeholder="meme, viral, lunes..."
                  className="w-full pl-7 pr-4 py-2.5 bg-surface2 border border-border rounded-lg text-sm outline-none focus:border-accent transition-colors font-mono"
                />
              </div>
              {tagsInput && (
                <div className="flex flex-wrap gap-1.5">
                  {tagsInput.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                    <span key={tag} className="text-[11px] px-2 py-0.5 bg-accent/10 border border-accent/30 text-accent rounded-full font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2.5 bg-surface2 border border-border rounded-lg text-sm font-bold text-muted hover:text-white transition-colors"
                >
                  <Download size={15} /> Descargar
                </button>
                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-accent hover:bg-red-500 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                >
                  <Send size={15} /> {publishing ? 'Publicando...' : 'Publicar en el feed'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de controles — segundo en mobile */}
        <div className="w-full lg:w-64 lg:shrink-0 space-y-4 order-last lg:order-first">

          {/* Imagen */}
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted mb-3">Imagen</p>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-surface2 border border-border rounded-lg text-sm text-muted hover:text-white hover:border-accent transition-colors"
            >
              <Upload size={14} /> Subir imagen
            </button>
            <p className="text-[10px] text-muted font-mono mt-2 text-center">o elige una plantilla</p>
            <div className="grid grid-cols-5 gap-1.5 mt-2">
              {TEMPLATES.map(t => (
                <button
                  key={t}
                  onClick={() => { setSelectedTemplate(t); setUploadedImage(null) }}
                  className={`h-10 rounded-lg bg-surface2 text-xl flex items-center justify-center transition-all border ${selectedTemplate === t && !uploadedImage ? 'border-accent scale-110' : 'border-transparent hover:border-accent/50'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Texto */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted">Texto</p>
            <div>
              <label className="text-[10px] text-muted font-mono mb-1 block">Superior</label>
              <input
                type="text"
                value={topText}
                onChange={e => setTopText(e.target.value)}
                placeholder="Texto arriba..."
                className="w-full px-3 py-2 bg-surface2 border border-border rounded-lg text-sm outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted font-mono mb-1 block">Inferior</label>
              <input
                type="text"
                value={bottomText}
                onChange={e => setBottomText(e.target.value)}
                placeholder="Texto abajo..."
                className="w-full px-3 py-2 bg-surface2 border border-border rounded-lg text-sm outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          {/* Estilo */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted">Estilo</p>
            <div>
              <label className="text-[10px] text-muted font-mono mb-1 block">Fuente</label>
              <select
                value={fontFamily}
                onChange={e => setFontFamily(e.target.value)}
                className="w-full px-3 py-2 bg-surface2 border border-border rounded-lg text-sm outline-none"
              >
                {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <label className="text-[10px] text-muted font-mono">Tamaño</label>
                <span className="text-[10px] text-white font-mono">{fontSize}px</span>
              </div>
              <input
                type="range" min="24" max="80" step="2"
                value={fontSize}
                onChange={e => setFontSize(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-[10px] text-muted font-mono mb-1 block">Texto</label>
                <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-surface2 cursor-pointer" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-muted font-mono mb-1 block">Fondo</label>
                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-surface2 cursor-pointer" />
              </div>
            </div>
          </div>

          {/* Formato */}
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted mb-3">Formato</p>
            <div className="flex gap-2">
              {(['1:1', '16:9', '9:16'] as const).map(a => (
                <button
                  key={a}
                  onClick={() => setAspect(a)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${aspect === a ? 'bg-accent text-white' : 'bg-surface2 text-muted hover:text-white'}`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}