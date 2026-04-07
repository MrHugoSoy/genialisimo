import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidad — Genialisimo',
  description: 'Política de privacidad y tratamiento de datos de Genialisimo',
}

export default function PrivacidadPage() {
  const fecha = '6 de abril de 2026'
  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">
      <Link href="/" className="text-[11px] font-mono text-muted hover:text-accent transition-colors mb-8 inline-block">
        ← Volver al inicio
      </Link>

      <h1 className="font-bebas text-4xl tracking-wide mb-2">Política de Privacidad</h1>
      <p className="text-muted text-sm font-mono mb-10">Última actualización: {fecha}</p>

      <div className="space-y-8 text-sm text-white/80 leading-relaxed">

        <section>
          <h2 className="font-bebas text-xl tracking-wide text-white mb-3">1. Información que recopilamos</h2>
          <p>Al usar Genialisimo recopilamos la siguiente información:</p>
          <ul className="mt-3 space-y-2 list-none">
            {[
              'Dirección de correo electrónico al registrarte',
              'Nombre de usuario que elijas',
              'Contenido que publicas (posts, comentarios, votos)',
              'Datos de uso como páginas visitadas y tiempo en el sitio',
              'Dirección IP y tipo de navegador',
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-accent mt-0.5">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-bebas text-xl tracking-wide text-white mb-3">2. Cómo usamos tu información</h2>
          <p>Usamos tu información para:</p>
          <ul className="mt-3 space-y-2 list-none">
            {[
              'Crear y gestionar tu cuenta de usuario',
              'Mostrarte contenido personalizado en el feed',
              'Enviarte notificaciones sobre actividad en tus posts',
              'Mejorar la experiencia y funcionalidad del sitio',
              'Prevenir spam y contenido inapropiado',
              'Analizar el uso del sitio con Google Analytics',
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-accent mt-0.5">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-bebas text-xl tracking-wide text-white mb-3">3. Cookies</h2>
          <p>Genialisimo usa cookies para:</p>
          <ul className="mt-3 space-y-2 list-none">
            {[
              'Mantener tu sesión iniciada',
              'Recordar tus preferencias',
              'Analizar el tráfico con Google Analytics (cookies de terceros)',
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-accent mt-0.5">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3">Puedes desactivar las cookies en la configuración de tu navegador, aunque esto puede afectar el funcionamiento del sitio.</p>
        </section>

        <section>
          <h2 className="font-bebas text-xl tracking-wide text-white mb-3">4. Compartir información con terceros</h2>
          <p>No vendemos ni compartimos tu información personal con terceros, excepto:</p>
          <ul className="mt-3 space-y-2 list-none">
            {[
              'Supabase — proveedor de base de datos y autenticación',
              'Vercel — proveedor de hosting',
              'Google Analytics — análisis de tráfico anónimo',
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-accent mt-0.5">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-bebas text-xl tracking-wide text-white mb-3">5. Seguridad de tus datos</h2>
          <p>Implementamos medidas de seguridad para proteger tu información, incluyendo cifrado SSL, autenticación segura y acceso restringido a la base de datos. Sin embargo, ningún sistema es 100% seguro.</p>
        </section>

        <section>
          <h2 className="font-bebas text-xl tracking-wide text-white mb-3">6. Tus derechos</h2>
          <p>Tienes derecho a:</p>
          <ul className="mt-3 space-y-2 list-none">
            {[
              'Acceder a tu información personal',
              'Corregir datos incorrectos',
              'Eliminar tu cuenta y todos tus datos',
              'Exportar tu información',
              'Oponerte al procesamiento de tus datos',
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-accent mt-0.5">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3">Para ejercer estos derechos contáctanos en: <span className="text-accent font-mono">privacidad@genialisimo.com</span></p>
        </section>

        <section>
          <h2 className="font-bebas text-xl tracking-wide text-white mb-3">7. Contenido de usuarios</h2>
          <p>El contenido que publicas en Genialisimo (posts, comentarios, imágenes) es visible públicamente. Eres responsable del contenido que publicas y debe cumplir con nuestros <Link href="/terminos" className="text-accent hover:underline">Términos de Uso</Link>.</p>
        </section>

        <section>
          <h2 className="font-bebas text-xl tracking-wide text-white mb-3">8. Menores de edad</h2>
          <p>Genialisimo no está dirigido a menores de 13 años. Si eres menor de 13 años, no uses este sitio. Si descubrimos que un menor ha creado una cuenta, la eliminaremos.</p>
        </section>

        <section>
          <h2 className="font-bebas text-xl tracking-wide text-white mb-3">9. Cambios a esta política</h2>
          <p>Podemos actualizar esta política ocasionalmente. Te notificaremos de cambios importantes por email o mediante un aviso en el sitio. El uso continuado del sitio después de los cambios implica aceptación.</p>
        </section>

        <section>
          <h2 className="font-bebas text-xl tracking-wide text-white mb-3">10. Contacto</h2>
          <p>Para preguntas sobre esta política de privacidad:</p>
          <div className="mt-3 p-4 bg-surface border border-border rounded-xl font-mono text-sm space-y-1">
            <p>📧 privacidad@genialisimo.com</p>
            <p>🌐 genialisimo.com</p>
          </div>
        </section>

      </div>
    </div>
  )
}