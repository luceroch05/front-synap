import { useParams } from 'react-router-dom';
import RegistroNotasGrupales from '@/components/notas/RegistroNotasGrupales';

export default function NotasGrupoPage() {
  const { id } = useParams();
  const grupoId = Number(id);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <RegistroNotasGrupales grupoId={grupoId} />
    </main>
  );
}
