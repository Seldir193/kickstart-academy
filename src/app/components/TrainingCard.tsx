type Training = {
  title: string;
  day: string;       // e.g. "Monday"
  time: string;      // e.g. "16:00 – 17:30"
  level: string;     // e.g. "U10–U12"
  location?: string; // optional
};

export default function TrainingCard({ training }: { training: Training }) {
  return (
    <article className="card">
      <header className="card-head">
        <h3 className="card-title">{training.title}</h3>
        <span className="badge">{training.level}</span>
      </header>
      <ul className="card-list">
        <li><strong>Day:</strong> {training.day}</li>
        <li><strong>Time:</strong> {training.time}</li>
        {training.location && <li><strong>Location:</strong> {training.location}</li>}
      </ul>
      <div className="card-actions">
        <button className="btn btn-secondary" type="button">Book</button>
      </div>
    </article>
  );
}
