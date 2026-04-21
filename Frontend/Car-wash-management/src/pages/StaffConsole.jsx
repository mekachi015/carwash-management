import { useQueue } from '../hooks/useQueue';
import { AddCarForm } from '../components/AddCarForm';
import { CarCard } from '../components/CarCard';

export function StaffConsole() {
  const { queue, refresh } = useQueue();

  return (
    <div>
      <h1>Staff Console</h1>
      <p style={{ color: 'var(--gray-500)', marginBottom: '1.5rem' }}>Manage the wash queue.</p>

      

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Active Queue</h2>
          <span className="badge badge-washing">{queue.length} car{queue.length !== 1 ? 's' : ''}</span>
        </div>

        {queue.length === 0 ? (
          <div className="empty-state">
            <p>Queue is empty — add a car above.</p>
          </div>
        ) : (
          queue.map((car, i) => (
            <CarCard
              key={car.id}
              car={car}
              position={i + 1}
              onUpdate={refresh}
            />
          ))
        )}
      </div>

      <AddCarForm />
    </div>

    
  );

  
}

export default StaffConsole;