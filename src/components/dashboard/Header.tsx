import { Bell } from 'lucide-react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const date = new Date().toLocaleDateString('es-PE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div
      className="h-16 bg-white flex items-center justify-between px-7 flex-shrink-0"
      style={{ borderBottom: '1px solid #EEF0F4' }}
    >
      <div>
        <h1 className="font-bold text-[#0D1F35] text-lg leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-5">
        <p className="text-xs text-gray-400 capitalize hidden md:block">{date}</p>
        <button className="relative p-2 rounded-xl hover:bg-gray-50 transition-colors">
          <Bell size={18} className="text-gray-400" />
          <span
            className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: '#F7941D' }}
          />
        </button>
      </div>
    </div>
  );
}
