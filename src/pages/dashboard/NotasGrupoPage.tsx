import { useParams } from 'react-router-dom';
import RegistroNotasGrupales from '@/components/notas/RegistroNotasGrupales';

export default function NotasGrupoPage() {
  const { id } = useParams();
  const grupoId = Number(id);

  return <RegistroNotasGrupales grupoId={grupoId} />;
}
