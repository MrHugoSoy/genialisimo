# 🔥 Genialisimo

Feed de memes y contenido viral en español. Stack: **Next.js 16 · Supabase · Tailwind CSS · TypeScript**

---

## 🚀 Setup en 5 pasos

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.local.example .env.local
```
Edita `.env.local` con tus credenciales de Supabase:
```
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
```
Encuéntralas en: **Supabase Dashboard → Settings → API**

### 3. Crear la base de datos
En **Supabase → SQL Editor**, pega y ejecuta el contenido de `supabase-schema.sql`

### 4. Configurar Auth (opcional: Google OAuth)
En **Supabase → Authentication → Providers → Google**:
- Activa Google
- Agrega `http://localhost:3000/auth/callback` como Redirect URL

### 5. Correr el proyecto
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000)

---

## 📁 Estructura del proyecto

```
genialisimo/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Home (Hot feed)
│   ├── top/page.tsx
│   ├── trending/page.tsx
│   ├── fresh/page.tsx
│   ├── create/page.tsx     # Crear post
│   ├── profile/page.tsx    # Perfil de usuario
│   └── auth/callback/      # OAuth callback
├── components/
│   ├── auth/               # AuthModal, UserMenu, ProfilePage, AuthProvider
│   ├── feed/               # FeedPage, PostCard, CommentSection, CreatePostPage
│   ├── layout/             # Topbar, Sidebar, RightSidebar
│   └── ui/                 # Toaster
├── hooks/
│   ├── useAuth.ts          # Auth state + actions
│   └── usePosts.ts         # Feed + voting + create
├── lib/
│   ├── supabase.ts         # Browser client
│   └── supabase-server.ts  # Server client
├── types/index.ts          # TypeScript types + constants
└── supabase-schema.sql     # Schema completo de la BD
```

---

## 🚢 Deploy en Vercel

1. Sube el proyecto a GitHub
2. Importa el repo en [vercel.com](https://vercel.com)
3. En **Environment Variables** agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy automático ✅

En Supabase, agrega tu dominio de Vercel como Redirect URL:
**Authentication → URL Configuration → Redirect URLs** → `https://tudominio.vercel.app/auth/callback`

---

## 🎨 Personalización rápida

| Qué cambiar | Dónde |
|---|---|
| Colores | `tailwind.config.ts` → `colors` |
| Fuentes | `app/globals.css` + `tailwind.config.ts` → `fontFamily` |
| Categorías | `types/index.ts` → `CATEGORIES` |
| Avatares | `types/index.ts` → `AVATARS` |
| Logo | `components/layout/Topbar.tsx` |
