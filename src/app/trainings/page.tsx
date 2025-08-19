import TrainingCard from "../components/TrainingCard";

const trainings = [
  { title: 'Ball Mastery', day: 'Monday', time: '16:00 – 17:30', level: 'U10–U12', location: 'Pitch A' },
  { title: 'Finishing Clinic', day: 'Wednesday', time: '17:30 – 19:00', level: 'U12–U14', location: 'Pitch B' },
  { title: 'Elite Session', day: 'Friday', time: '16:30 – 18:00', level: 'U14–U16', location: 'Main Stadium' },
];

export default function TrainingsPage() {
  return (
    <section>
      <h1>Trainings</h1>
      <p>Choose a session and book your spot. No account required (coming soon).</p>

      <div className="grid">
        {trainings.map((t) => (
          <TrainingCard key={`${t.day}-${t.title}`} training={t} />
        ))}
      </div>
    </section>
  );
}
