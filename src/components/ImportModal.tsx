import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, ArrowRight } from 'lucide-react';
import { parseUploadedFile } from '../services/storage';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportDocument: (title: string, htmlContent: string) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportDocument,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<{
    title: string;
    html: string;
    rawText: string;
    fileName: string;
    fileSize: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = async (file: File) => {
    setError(null);
    const validExtensions = ['.md', '.txt', '.markdown'];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setError('Please upload a valid Markdown (.md) or Plain Text (.txt) file.');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await parseUploadedFile(file);
      const sizeKb = (file.size / 1024).toFixed(1) + ' KB';
      setParsedData({
        title: result.title,
        html: result.html,
        rawText: result.rawText,
        fileName: file.name,
        fileSize: sizeKb,
      });
    } catch (err) {
      console.error(err);
      setError('Failed to parse file. Please verify it is a valid text file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedData) return;
    onImportDocument(parsedData.title, parsedData.html);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setParsedData(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-xl w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Import Document
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Upload Markdown (.md) or Plain Text (.txt) files
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {!parsedData ? (
            <div>
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/50 dark:bg-neutral-800/20'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.txt,.markdown"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileProcess(e.target.files[0]);
                    }
                  }}
                />

                <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-3 text-neutral-500">
                  <FileText className="w-6 h-6" />
                </div>

                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  Click to browse or drag & drop file here
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Supports .md and .txt (automatically converts headers, lists & code blocks)
                </p>
              </div>

              {/* Sample files quick-test shortcut */}
              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
                <span>Need a quick test?</span>
                <button
                  type="button"
                  onClick={() => {
                    const sampleMarkdown = `# Meeting Notes: Engineering Alignment

## Key Decisions
- Adopt local-first caching for instantaneous UI state
- Provide role-based sharing permissions (Owner, Editor, Viewer)
- Enable clean export to Markdown, HTML, and Text formats

> "Simplicity and responsiveness are the core features."

### Next Steps
1. Verify Tiptap rich-text hooks
2. Validate user switcher role changes
3. Finalize clean dashboard views
`;
                    const fakeFile = new File([sampleMarkdown], 'engineering_alignment_notes.md', {
                      type: 'text/markdown',
                    });
                    handleFileProcess(fakeFile);
                  }}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                >
                  Load sample markdown file
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 truncate max-w-xs">
                      {parsedData.fileName}
                    </p>
                    <p className="text-2xs text-emerald-700 dark:text-emerald-400">
                      {parsedData.fileSize} · Successfully parsed content
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 underline"
                >
                  Change file
                </button>
              </div>

              {/* Document Title input */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Document Title
                </label>
                <input
                  type="text"
                  value={parsedData.title}
                  onChange={(e) => setParsedData({ ...parsedData, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Preview Box */}
              <div>
                <div className="text-xs font-medium text-neutral-500 mb-1 flex items-center justify-between">
                  <span>Formatted Content Preview</span>
                  <span>{parsedData.rawText.length} characters</span>
                </div>
                <div
                  className="max-h-48 overflow-y-auto p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 prose prose-xs dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: parsedData.html }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-xl flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Cancel
          </button>

          {parsedData && (
            <button
              onClick={handleConfirmImport}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>Create Document</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
