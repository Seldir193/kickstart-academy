



import TrainingCard from "../components/TrainingCard";

export default function TrainingsPage() {
  return (
    <section>
      <h1>Trainings</h1>
      <p>Choose a session and book your spot. No account required (coming soon).</p>

      {/* Render the big UI exactly once */}
      <TrainingCard />
    </section>
  );
}

