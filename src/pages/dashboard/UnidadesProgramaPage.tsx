import { useParams } from 'react-router-dom';
import GestionUnidades from '@/components/unidades/GestionUnidades';

export default function UnidadesProgramaPage() {
  const { id } = useParams();
  const programaId = Number(id);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <GestionUnidades programaId={programaId} />
    </main>
  );
}
