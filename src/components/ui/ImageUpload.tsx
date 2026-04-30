import { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (base64: string) => void;
  label?: string;
  accept?: string;
  className?: string;
}

export default function ImageUpload({ value, onChange, label = 'Imagen', accept = 'image/*', className = '' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) handleFile(file);
  };

  const isDataUrl = value?.startsWith('data:') || value?.startsWith('http');

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input ref={inputRef} type="file" accept={accept} onChange={handleChange} className="hidden" />

      {isDataUrl ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="preview"
            className="max-h-32 max-w-full rounded-xl border border-gray-200 object-contain bg-gray-50"
          />
          <button
            type="button"
            onClick={() => { onChange(''); if (inputRef.current) inputRef.current.value = ''; }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          className="flex flex-col items-center justify-center gap-2 px-6 py-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">Haz clic o arrastra una imagen</p>
            <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, SVG — máx. 2 MB</p>
          </div>
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">
            <Upload className="w-3.5 h-3.5" /> Seleccionar archivo
          </span>
        </div>
      )}
    </div>
  );
}
