import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Términos de Uso — Genialisimo',
  description: 'Términos y condiciones de uso de Genialisimo',
}

export default function TerminosPage() {
  const fecha = '6 de abril de 2026'
  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">
      <Link href="/" className="text-[11px] font-mono text-muted hover:text-accent transition-colors mb-8 inline-block">
        ← Volver al inicio
      </Link>

      <h1 className="font-bebas text-4xl tracking-wide mb-2">Términos de Uso</h1>
      <p className="text-muted text-sm font-mono mb-10">Última actualización: {fecha}</p>

      <div className="space-y-8 text-sm text-white/80 leading-relaxed">

        <section>
          <h2 className="font-bebas text-xl tracking-wide text-white mb-3">1. Aceptación de los términos</h2>
          <p>Al acceder y usar Genialisimo aceptas estos Términos de Uso. Si no estás de acuerdo, no uses el sitio.</p>
        </section>

        <section>
          <h2 className="font-bebas text-xl tracking-wide text-white mb-3">2. Uso aceptable</h2>
          <p>Puedes usar Genialisimo para:</p>
          <ul className="mt-3 space-y-2 list-none">
            {[
              'Publicar memes, imágenes y contenido de humor',
              'Comentar y votar en posts de otros usuarios',
              'Interactuar con la comunidad de forma respetuosa',
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-fresh mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-bebas text-xl tracking-wide text-white mb-3">3. Contenido prohibido</h2>
          <p>Está estrictamente prohibido publicar:</p>
          <ul className="mt-3 space-y-2 list-none">
            {[
              'Contenido sexual explícito o pornográfico',
              'Violencia extrema o gore',
              'Discurso de odio o discriminación',
              'Acoso, amenazas o intimidación',
              'Información personal de terceros sin consentimiento',
              'Spam o contenido publicitario no autorizado',
              'Contenido ilegal o que infrinja derechos de autor',
              'Malware o código malicioso',
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-accent mt-0.5">✗</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-bebas text-xl tracking-wide text-white mb-3">4. Tu cuenta</h2>
          <p>Eres responsable de mantener la seguridad de tu cuenta y contraseña. Notifícanos inmediatamente si sospechas acceso no autorizado. No puedes transferir tu cuenta a otra persona.</p>
        </section>

        <section>
          <h2 className="font-bebas text-xl tracking-wide text-white mb-3">5. Propiedad intelectual</h2>
          <p>Al publicar contenido en Genialisimo nos otorgas una licencia no exclusiva para mostrar ese contenido en el sitio. Sigues siendo el propietario de tu contenido. Eres responsable de que el contenido que publicas no infrinja derechos de autor de terceros.</p>
        </section>

        <section>
          <h2 className="font-bebas text-xl tracking-wide text-white mb-3">6. Moderación y sanciones</h2>
          <p>Nos reservamos el derecho de:</p>
          <ul className="mt-3 space-y-2 list-none">
            {[
              'Eliminar contenido que viole estos términos sin previo aviso',
              'Suspender o eliminar cuentas que incumplan las normas',
              'Reportar actividad ilegal a las autoridades competentes',
            ].map(item => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-accent mt-0.5">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-bebas text-xl tracking-wide text-white mb-3">7. Limitación de responsabilidad</h2>
          <p>Genialisimo se proporciona "tal cual". No somos responsables por el contenido publicado por los usuarios ni por daños derivados del uso del sitio. El contenido publicado por usuarios no representa nuestra opinión.</p>
        </section>

        <section>
          <h2 className="font-bebas text-xl tracking-wide text-white mb-3">8. Cambios al servicio</h2>
          <p>Podemos modificar, suspender o discontinuar cualquier parte del servicio en cualquier momento sin previo aviso ni responsabilidad.</p>
        </section>

        <section>
          <h2 className="font-bebas text-xl tracking-wide text-white mb-3">9. Ley aplicable</h2>
          <p>Estos términos se rigen por las leyes de México. Cualquier disputa se resolverá en los tribunales competentes de México.</p>
        </section>

        <section>
          <h2 className="font-bebas text-xl tracking-wide text-white mb-3">10. Contacto</h2>
          <p>Para preguntas sobre estos términos:</p>
          <div className="mt-3 p-4 bg-surface border border-border rounded-xl font-mono text-sm space-y-1">
            <p>📧 legal@genialisimo.com</p>
            <p>🌐 genialisimo.com</p>
          </div>
        </section>

      </div>
    </div>
  )
}