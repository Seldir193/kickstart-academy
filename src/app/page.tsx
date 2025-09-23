import Link from 'next/link';



const wpBase = process.env.NEXT_PUBLIC_WP_BASE_URL ?? 'http://localhost/wordpress';
const wpPath = process.env.NEXT_PUBLIC_WP_CONTACT_PATH ?? '/?page_id=143';
const contactUrl = `${wpBase.replace(/\/$/, '')}${wpPath.startsWith('/') ? wpPath : `/${wpPath}`}`;

export default function HomePage() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Train. Improve. Enjoy.</h1>
        <p>
          Elite youth football training with certified coaches. Book a free trial
          session and join the next generation of players.
        </p>
        <div className="hero-actions">
          <Link href="/trainings" className="btn btn-primary">View Trainings</Link>
          <Link href={contactUrl} className="btn btn-ghost">Contact</Link>
    
        </div>
      </div>
    </section>
  );
}
