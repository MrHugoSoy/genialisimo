import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Acerca de — Genialisimo',
  description: 'Conoce mas sobre Genialisimo, la comunidad de memes y contenido viral en español.',
}

export default function AcercaPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">
      <h1 className="font-bebas text-4xl tracking-wide mb-2">Acerca de Genialisimo</h1>
      <p className="text-muted text-sm font-mono mb-10">Fundado en 2026</p>

      <div className="space-y-8 text-sm text-white/80 leading-relaxed">

        <section>
          <h2 className="font-bebas text-xl tracking-wide text-white mb-3">Que es Genialisimo</h2>
          <p>
            Genialisimo es una comunidad de entretenimiento en español donde los usuarios comparten,
            votan y comentan memes, videos, fails y contenido viral. Somos el lugar donde la comunidad
            latina se reune para compartir lo mas gracioso de internet.
          </p>
        </section>

        <section>
          <h2 className="font-bebas text-xl tracking-wide text-white mb-3">Nuestra mision</h2>
          <p>
            Crear un espacio de entretenimiento en español donde cualquier persona pueda compartir
            contenido que haga reir, conectar con otros usuarios y descubrir lo mejor del humor latino.
            Creemos que la risa une a las personas y queremos ser el lugar donde eso suceda.
          </p>
        </section>

        <section>
          <h2 className="font-bebas text-xl tracking-wide text-white mb-3">Como funciona</h2>
          <p>
            Los usuarios se registran gratuitamente y pueden subir posts con imagenes, GIFs o videos
            de YouTube. La comunidad vota el contenido y los mejores posts aparecen en la seccion HOT.
            Tambien puedes comentar, seguir a otros usuarios y ganar puntos por tu actividad.
          </p>
        </section>

        <section>
          <h2 className="font-bebas text-xl tracking-wide text-white mb-3">Quienes somos</h2>
          <p>
            Somos un equipo apasionado por el humor y la cultura latina. Genialisimo nacio en 2026
            con la vision de crear la mejor comunidad de memes en español. Estamos comprometidos
            con mantener un espacio seguro, divertido y respetuoso para todos.
          </p>
        </section>

        <section>
          <h2 className="font-bebas text-xl tracking-wide text-white mb-3">Contenido y moderacion</h2>
          <p>
            Todo el contenido es publicado por usuarios de la comunidad. Contamos con un sistema
            de reportes y moderacion activa para mantener el sitio libre de contenido inapropiado.
            Si encuentras contenido que viola nuestras normas, usa el boton de reportar.
          </p>
        </section>

        <section>
          <h2 className="font-bebas text-xl tracking-wide text-white mb-3">Contacto</h2>
          <p>Para preguntas, sugerencias, reportes o colaboraciones:</p>
          <div className="mt-3 p-4 bg-surface border border-border rounded-xl font-mono text-sm space-y-1">
            <p>📧 contacto@genialisimo.com</p>
            <p>🌐 genialisimo.com</p>
            <p>📍 Mexico</p>
          </div>
        </section>

        <section>
          <h2 className="font-bebas text-xl tracking-wide text-white mb-3">Legal</h2>
          <div className="flex gap-4">
            <a href="/privacidad" className="text-accent hover:underline text-sm">Politica de Privacidad</a>
            <a href="/terminos" className="text-accent hover:underline text-sm">Terminos de Uso</a>
          </div>
        </section>

      </div>
    </div>
  )
}