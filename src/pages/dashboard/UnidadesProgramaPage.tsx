import { useParams } from 'react-router-dom';
import GestionUnidades from '@/components/unidades/GestionUnidades';

export default function UnidadesProgramaPage() {
  const { id } = useParams();
  const programaId = Number(id);

  return (
    <div className="page-root">
      <div className="page-body">
        <GestionUnidades programaId={programaId} />
      </div>
    </div>
  );
}
