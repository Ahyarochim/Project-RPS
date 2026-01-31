import React, { useState } from 'react';
import { BootcampData, BootcampFormInput, createEmptyBootcamp } from './bootcamp.types';

interface BootcampFormProps {
  onSubmit: (data: BootcampFormInput) => void;
  onGenerateAI?: (data: BootcampFormInput) => void;
  loading?: boolean;
}

export const BootcampForm: React.FC<BootcampFormProps> = ({
  onSubmit,
  onGenerateAI,
  loading = false
}) => {
  const [formData, setFormData] = useState<BootcampFormInput>({
    nama: '',
    durasi: 8,
    level: 'Beginner',
    deskripsi: '',
    additional_context: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BootcampFormInput, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'durasi' ? parseInt(value) || 0 : value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof BootcampFormInput]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BootcampFormInput, string>> = {};

    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama bootcamp wajib diisi';
    }

    if (formData.durasi < 1 || formData.durasi > 24) {
      newErrors.durasi = 'Durasi harus antara 1-24 minggu';
    }

    if (!formData.deskripsi.trim()) {
      newErrors.deskripsi = 'Deskripsi bootcamp wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleGenerateAI = () => {
    if (validate() && onGenerateAI) {
      onGenerateAI(formData);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🚀 Bootcamp Curriculum Generator
        </h1>
        <p className="text-gray-600">
          Buat rencana program bootcamp/workshop dengan AI atau isi manual
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nama Bootcamp */}
        <div>
          <label htmlFor="nama" className="block text-sm font-semibold text-gray-700 mb-2">
            Nama Bootcamp *
          </label>
          <input
            type="text"
            id="nama"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            placeholder="e.g., Full Stack Web Development Bootcamp"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.nama ? 'border-red-500' : 'border-gray-300'
              }`}
            disabled={loading}
          />
          {errors.nama && (
            <p className="mt-1 text-sm text-red-600">{errors.nama}</p>
          )}
        </div>

        {/* Durasi & Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="durasi" className="block text-sm font-semibold text-gray-700 mb-2">
              Durasi (minggu) *
            </label>
            <input
              type="number"
              id="durasi"
              name="durasi"
              value={formData.durasi}
              onChange={handleChange}
              min="1"
              max="24"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.durasi ? 'border-red-500' : 'border-gray-300'
                }`}
              disabled={loading}
            />
            {errors.durasi && (
              <p className="mt-1 text-sm text-red-600">{errors.durasi}</p>
            )}
          </div>

          <div>
            <label htmlFor="level" className="block text-sm font-semibold text-gray-700 mb-2">
              Level Bootcamp *
            </label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Deskripsi */}
        <div>
          <label htmlFor="deskripsi" className="block text-sm font-semibold text-gray-700 mb-2">
            Deskripsi Bootcamp *
          </label>
          <textarea
            id="deskripsi"
            name="deskripsi"
            value={formData.deskripsi}
            onChange={handleChange}
            rows={4}
            placeholder="Jelaskan tujuan, target peserta, dan outcome dari bootcamp ini..."
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.deskripsi ? 'border-red-500' : 'border-gray-300'
              }`}
            disabled={loading}
          />
          {errors.deskripsi && (
            <p className="mt-1 text-sm text-red-600">{errors.deskripsi}</p>
          )}
        </div>

        {/* Additional Context (Optional for AI) */}
        <div>
          <label htmlFor="additional_context" className="block text-sm font-semibold text-gray-700 mb-2">
            Konteks Tambahan (Opsional - untuk AI Generator)
          </label>
          <textarea
            id="additional_context"
            name="additional_context"
            value={formData.additional_context}
            onChange={handleChange}
            rows={3}
            placeholder="Berikan informasi tambahan seperti teknologi spesifik yang ingin diajarkan, target industri, atau kebutuhan khusus lainnya..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">
            Informasi ini akan membantu AI menggenerate konten yang lebih spesifik dan relevan
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          {onGenerateAI && (
            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating dengan AI...
                </span>
              ) : (
                '✨ Generate dengan AI'
              )}
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            📝 Isi Manual
          </button>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Tips:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Gunakan <strong>Generate dengan AI</strong> untuk auto-fill seluruh curriculum</li>
            <li>Gunakan <strong>Isi Manual</strong> untuk masuk ke form detail lengkap</li>
            <li>Durasi optimal: 4-12 minggu untuk bootcamp intensive</li>
            <li>Semakin detail konteks tambahan, semakin spesifik hasil AI</li>
          </ul>
        </div>
      </form>
    </div>
  );
};

// Example usage component with state management
export const BootcampFormContainer: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null); // Keep raw object for reference if needed
  const [jsonContent, setJsonContent] = useState<string>(''); // For the editable textarea

  const handleSubmit = (formData: BootcampFormInput) => {
    console.log('Manual form submission:', formData);
    alert('Form submitted! (Manual logic to be implemented)');
  };

  const handleGenerateAI = async (formData: BootcampFormInput) => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-bootcamp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('AI generation failed');
      }

      const data = await response.json();
      if (data.success && data.data) {
        setGeneratedData(data.data);
        setJsonContent(JSON.stringify(data.data, null, 2));
        alert('✅ AI Generation Successful! Please review the JSON below.');
      } else {
        throw new Error('Invalid response structure');
      }

    } catch (error) {
      console.error('Error generating with AI:', error);
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // 1. Load JSON Feature
  const handleLoadJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        setGeneratedData(parsed);
        setJsonContent(content); // Keep formatting if possible, or re-stringify: JSON.stringify(parsed, null, 2)
        alert('✅ JSON Loaded Successfully! You can now edit and convert it.');
      } catch (err) {
        alert('❌ Error loading JSON: Invalid format');
      }
    };
    reader.readAsText(file);
  };

  // 2. Download JSON Feature
  const handleDownload = () => {
    try {
      // Validate JSON first
      const parsed = JSON.parse(jsonContent);
      const blob = new Blob([JSON.stringify(parsed, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bootcamp_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('❌ Invalid JSON content. Please fix errors before downloading.');
    }
  };

  // 3. Convert to DOCX Feature
  const handleConvertToDocx = async () => {
    try {
      const parsed = JSON.parse(jsonContent); // Get current state of editor

      // Show loading state for button (optional: can add separate loading state)
      const btn = document.getElementById('btn-convert-docx') as HTMLButtonElement;
      if (btn) { btn.disabled = true; btn.innerText = '⏳ Converting...'; }

      const response = await fetch('/api/convert-to-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });

      if (!response.ok) throw new Error('Conversion failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bootcamp_curriculum_${Date.now()}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      if (btn) { btn.innerText = '✅ Downloaded!'; setTimeout(() => { btn.disabled = false; btn.innerText = '📄 Convert to DOCX'; }, 2000); }

    } catch (err) {
      alert('❌ Error converting to DOCX: ' + (err instanceof Error ? err.message : 'Unknown error'));
      const btn = document.getElementById('btn-convert-docx') as HTMLButtonElement;
      if (btn) { btn.disabled = false; btn.innerText = '📄 Convert to DOCX'; }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">

      {/* Load JSON Section */}
      <div className="max-w-4xl mx-auto mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200 shadow-sm">
        <h3 className="text-lg font-bold text-blue-900 mb-4">📂 Load Existing Bootcamp JSON</h3>
        <div className="flex gap-4 items-center">
          <input
            type="file"
            accept=".json"
            onChange={handleLoadJson}
            className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-white file:text-blue-700
                    hover:file:bg-blue-100"
          />
        </div>
        <p className="text-xs text-blue-800 mt-2">Upload file JSON yang sudah ada untuk diedit atau di-convert ke DOCX.</p>
      </div>

      <BootcampForm
        onSubmit={handleSubmit}
        onGenerateAI={handleGenerateAI}
        loading={loading}
      />

      {/* Editor & Actions Section */}
      {(jsonContent || generatedData) && (
        <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              ✅ Result Editor
            </h2>
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              Editable Mode
            </div>
          </div>

          <p className="mb-2 text-gray-600 text-sm">
            Silakan edit JSON di bawah ini sebelum menyimpan atau convert.
          </p>

          <textarea
            value={jsonContent}
            onChange={(e) => setJsonContent(e.target.value)}
            className="w-full h-96 p-4 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            spellCheck={false}
          />

          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleDownload}
              className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex justify-center items-center gap-2"
            >
              📥 Save JSON
            </button>
            <button
              id="btn-convert-docx"
              onClick={handleConvertToDocx}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
            >
              📄 Convert to DOCX
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BootcampForm;
