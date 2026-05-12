'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useToast } from '@/hooks/use-toast';
import { notesApi } from '@/lib/api';

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: 'lecture', label: 'Lecture Notes', icon: '📖' },
  { value: 'lab', label: 'Lab Notes', icon: '🔬' },
  { value: 'assignment', label: 'Assignment', icon: '📝' },
  { value: 'previous-year-paper', label: 'Previous Year Paper', icon: '📄' },
  { value: 'other', label: 'Other', icon: '📁' },
];

const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (type: string): string => {
  if (type.includes('pdf')) return '📕';
  if (type.startsWith('image/')) return '🖼️';
  if (type.includes('word') || type.includes('document')) return '📘';
  if (type.includes('powerpoint') || type.includes('presentation')) return '📙';
  return '📄';
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function CreateNotePage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishMode, setPublishMode] = useState<'publish' | 'draft'>('publish');
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    subject: '',
    semester: '1',
    branch: '',
    tags: '',
    category: 'lecture',
  });

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_MIME_TYPES.includes(file.type))
      return 'Unsupported file type. Please upload PDF, Word, PowerPoint, image, or TXT.';
    if (file.size > MAX_FILE_SIZE)
      return 'File is too large. Maximum allowed size is 10 MB.';
    return null;
  };

  const processFile = (file: File) => {
    const err = validateFile(file);
    if (err) {
      toast({ title: 'Invalid File', description: err, variant: 'destructive' });
      return;
    }
    setUploadedFile(file);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = e => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const removeFile = () => {
    setUploadedFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (mode: 'publish' | 'draft') => {
    if (!formData.title.trim()) {
      toast({ title: 'Missing Title', description: 'Please enter a title.', variant: 'destructive' });
      return;
    }
    if (!formData.subject.trim()) {
      toast({ title: 'Missing Subject', description: 'Please enter a subject.', variant: 'destructive' });
      return;
    }
    if (!formData.content.trim() && !uploadedFile) {
      toast({ title: 'No Content', description: 'Please write content or upload a file.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    setPublishMode(mode);

    try {
      // Convert file to base64 if present
      let fileData: Record<string, any> = {};
      if (uploadedFile) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(uploadedFile);
        });
        fileData = {
          fileUrl: base64,
          fileName: uploadedFile.name,
          fileType: uploadedFile.type,
          fileSize: uploadedFile.size,
        };
      }

      const tags = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      await notesApi.create({
        ...formData,
        ...fileData,
        semester: parseInt(formData.semester),
        tags,
        isPublished: mode === 'publish',
      });

      toast({
        title: mode === 'publish' ? '🎉 Note Published!' : '💾 Draft Saved!',
        description:
          mode === 'publish'
            ? 'Your note is now live for the community.'
            : 'Your draft has been saved privately.',
      });

      router.push('/my-notes');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Derived ─────────────────────────────────────────────────────────────────

  const canProceed = formData.title.trim() && formData.subject.trim();

  const parsedTags = formData.tags
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <ProtectedRoute>
      <div className="cn-page">
        <div className="cn-bg" />

        <div className="cn-container">

          {/* ── Top bar ── */}
          <div className="cn-topbar">
            <Link href="/dashboard" className="cn-back">← Dashboard</Link>

            <div className="cn-steps">
              <div className={`cn-step ${step >= 1 ? 'cn-step--active' : ''}`}>
                <span className="cn-step-num">1</span>
                <span className="cn-step-label">Details</span>
              </div>
              <div className="cn-step-line" />
              <div className={`cn-step ${step >= 2 ? 'cn-step--active' : ''}`}>
                <span className="cn-step-num">2</span>
                <span className="cn-step-label">Content</span>
              </div>
            </div>

            <div style={{ width: 100 }} />
          </div>

          {/* ════════════════════════════════════════════════
              STEP 1 — Details
          ════════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="cn-card cn-fade">
              <div className="cn-card-head">
                <h1 className="cn-title">Create a Note</h1>
                <p className="cn-subtitle">Fill in the details about your note</p>
              </div>

              <div className="cn-body">

                {/* Title */}
                <div className="cn-field">
                  <label className="cn-label">Title <span className="cn-req">*</span></label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Advanced Calculus — Chapter 5 Integration"
                    className="cn-input"
                    autoFocus
                  />
                </div>

                {/* Subject + Branch */}
                <div className="cn-row">
                  <div className="cn-field">
                    <label className="cn-label">Subject <span className="cn-req">*</span></label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="e.g., Mathematics"
                      className="cn-input"
                    />
                  </div>
                  <div className="cn-field">
                    <label className="cn-label">Branch</label>
                    <input
                      type="text"
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      placeholder="e.g., Computer Science"
                      className="cn-input"
                    />
                  </div>
                </div>

                {/* Semester + Category */}
                <div className="cn-row">
                  <div className="cn-field">
                    <label className="cn-label">Semester <span className="cn-req">*</span></label>
                    <select name="semester" value={formData.semester} onChange={handleChange} className="cn-select">
                      {[1,2,3,4,5,6,7,8].map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="cn-field">
                    <label className="cn-label">Category <span className="cn-req">*</span></label>
                    <select name="category" value={formData.category} onChange={handleChange} className="cn-select">
                      {CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="cn-field">
                  <label className="cn-label">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description of what this note covers..."
                    className="cn-textarea"
                    rows={3}
                  />
                </div>

                {/* Tags */}
                <div className="cn-field">
                  <label className="cn-label">
                    Tags <span className="cn-hint">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="e.g., calculus, integration, exam-prep"
                    className="cn-input"
                  />
                  {parsedTags.length > 0 && (
                    <div className="cn-tags">
                      {parsedTags.map((tag, i) => (
                        <span key={i} className="cn-tag">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Next */}
                <button
                  onClick={() => setStep(2)}
                  disabled={!canProceed}
                  className="cn-btn-primary"
                >
                  Continue to Content →
                </button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════
              STEP 2 — Content & Upload
          ════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="cn-card cn-fade">
              <div className="cn-card-head">
                <button className="cn-back-inline" onClick={() => setStep(1)}>← Edit Details</button>
                <h1 className="cn-title">Add Content</h1>
                <p className="cn-subtitle">Upload a file or write your notes below</p>
              </div>

              <div className="cn-body">

                {/* ── File Upload ── */}
                <div className="cn-field">
                  <label className="cn-label">Upload File</label>

                  <div
                    className={[
                      'cn-dropzone',
                      dragOver ? 'cn-dropzone--over' : '',
                      uploadedFile ? 'cn-dropzone--filled' : '',
                    ].join(' ')}
                    onDrop={handleDrop}
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onClick={() => !uploadedFile && fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx,.ppt,.pptx,.txt"
                      onChange={handleFileInput}
                      style={{ display: 'none' }}
                    />

                    {uploadedFile ? (
                      /* File card */
                      <div className="cn-file-card">
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="cn-img-preview" />
                        ) : (
                          <span className="cn-file-emoji">{getFileIcon(uploadedFile.type)}</span>
                        )}
                        <div className="cn-file-meta">
                          <span className="cn-file-name">{uploadedFile.name}</span>
                          <span className="cn-file-size">{formatFileSize(uploadedFile.size)}</span>
                        </div>
                        <button
                          className="cn-remove-btn"
                          onClick={e => { e.stopPropagation(); removeFile(); }}
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ) : (
                      /* Empty state */
                      <div className="cn-drop-empty">
                        <span className="cn-drop-icon">☁️</span>
                        <p className="cn-drop-title">Drop your file here</p>
                        <p className="cn-drop-sub">or <span className="cn-drop-link">click to browse</span></p>
                        <div className="cn-accepted">
                          {['PDF','Word','PPT','Images','TXT'].map(t => (
                            <span key={t} className="cn-accepted-chip">{t}</span>
                          ))}
                        </div>
                        <p className="cn-drop-limit">Max 10 MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Divider ── */}
                <div className="cn-divider">
                  <span>or write content directly</span>
                </div>

                {/* ── Text Content ── */}
                <div className="cn-field">
                  <label className="cn-label">Note Content</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Type or paste your note content here..."
                    className="cn-textarea cn-textarea--tall"
                    rows={10}
                  />
                  <span className="cn-char-count">{formData.content.length} characters</span>
                </div>

                {/* ── Action buttons ── */}
                <div className="cn-actions">
                  <button
                    onClick={() => handleSubmit('draft')}
                    disabled={isSubmitting}
                    className="cn-btn-draft"
                  >
                    {isSubmitting && publishMode === 'draft' ? '⏳ Saving...' : '💾 Save as Draft'}
                  </button>
                  <button
                    onClick={() => handleSubmit('publish')}
                    disabled={isSubmitting}
                    className="cn-btn-publish"
                  >
                    {isSubmitting && publishMode === 'publish' ? '⏳ Publishing...' : '🚀 Publish Note'}
                  </button>
                </div>

                <p className="cn-publish-hint">
                  <strong>Publish</strong> = visible to all students &nbsp;|&nbsp;
                  <strong>Draft</strong> = saved privately for you
                </p>
              </div>
            </div>
          )}

        </div>

        {/* ── Styles ── */}
        <style jsx>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          .cn-page {
            min-height: 100vh;
            background: #080d1a;
            font-family: 'Georgia', serif;
            position: relative;
            overflow-x: hidden;
          }

          /* animated gradient background */
          .cn-bg {
            position: fixed;
            inset: 0;
            z-index: 0;
            background:
              radial-gradient(ellipse 70% 50% at 15% 15%, rgba(56,119,242,0.13) 0%, transparent 65%),
              radial-gradient(ellipse 55% 40% at 85% 80%, rgba(124,58,237,0.10) 0%, transparent 65%),
              radial-gradient(ellipse 40% 60% at 50% 45%, rgba(6,182,212,0.06) 0%, transparent 70%);
            pointer-events: none;
          }

          /* ── Layout ── */
          .cn-container {
            position: relative;
            z-index: 1;
            max-width: 680px;
            margin: 0 auto;
            padding: 28px 20px 80px;
          }

          /* ── Top bar ── */
          .cn-topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 36px;
          }

          .cn-back {
            color: #64748b;
            text-decoration: none;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            letter-spacing: 0.06em;
            padding: 7px 14px;
            border: 1px solid rgba(100,116,139,0.22);
            border-radius: 7px;
            transition: all 0.18s;
            white-space: nowrap;
          }
          .cn-back:hover { color: #cbd5e1; border-color: rgba(100,116,139,0.5); }

          /* ── Steps ── */
          .cn-steps {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .cn-step {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
          }

          .cn-step-num {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 2px solid rgba(100,116,139,0.28);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-family: 'Courier New', monospace;
            color: #475569;
            transition: all 0.25s;
          }

          .cn-step--active .cn-step-num {
            border-color: #3b82f6;
            background: rgba(59,130,246,0.14);
            color: #93c5fd;
          }

          .cn-step-label {
            font-size: 10px;
            color: #475569;
            font-family: 'Courier New', monospace;
            letter-spacing: 0.06em;
            text-transform: uppercase;
          }

          .cn-step--active .cn-step-label { color: #93c5fd; }

          .cn-step-line {
            width: 36px;
            height: 1px;
            background: rgba(100,116,139,0.2);
            margin-bottom: 18px;
            flex-shrink: 0;
          }

          /* ── Card ── */
          .cn-card {
            background: rgba(13, 20, 38, 0.82);
            border: 1px solid rgba(148,163,184,0.10);
            border-radius: 18px;
            overflow: hidden;
            backdrop-filter: blur(24px);
            box-shadow:
              0 0 0 1px rgba(255,255,255,0.03) inset,
              0 30px 60px rgba(0,0,0,0.5);
          }

          .cn-fade {
            animation: fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }

          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(14px); }
            to   { opacity: 1; transform: translateY(0); }
          }

          .cn-card-head {
            padding: 32px 36px 22px;
            border-bottom: 1px solid rgba(148,163,184,0.07);
            background: rgba(255,255,255,0.02);
          }

          .cn-title {
            font-size: 24px;
            font-weight: 700;
            color: #f1f5f9;
            letter-spacing: -0.02em;
            margin-bottom: 4px;
          }

          .cn-subtitle {
            color: #475569;
            font-size: 13px;
            font-family: 'Courier New', monospace;
          }

          .cn-back-inline {
            background: none;
            border: none;
            color: #475569;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            cursor: pointer;
            padding: 0;
            margin-bottom: 10px;
            display: block;
            transition: color 0.18s;
          }
          .cn-back-inline:hover { color: #94a3b8; }

          /* ── Body ── */
          .cn-body {
            padding: 30px 36px 36px;
            display: flex;
            flex-direction: column;
            gap: 22px;
          }

          /* ── Fields ── */
          .cn-field { display: flex; flex-direction: column; gap: 7px; }

          .cn-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          .cn-label {
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.09em;
            text-transform: uppercase;
            color: #94a3b8;
            font-family: 'Courier New', monospace;
          }

          .cn-req { color: #f87171; margin-left: 2px; }

          .cn-hint {
            font-weight: 400;
            text-transform: none;
            letter-spacing: 0;
            color: #475569;
          }

          .cn-input,
          .cn-textarea,
          .cn-select {
            width: 100%;
            background: rgba(22, 34, 57, 0.7);
            border: 1px solid rgba(148,163,184,0.13);
            border-radius: 9px;
            padding: 11px 14px;
            color: #e2e8f0;
            font-size: 14px;
            font-family: inherit;
            transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
            outline: none;
          }

          .cn-input::placeholder, .cn-textarea::placeholder { color: #2d3f5a; }

          .cn-input:focus, .cn-textarea:focus, .cn-select:focus {
            border-color: rgba(59,130,246,0.5);
            background: rgba(22, 34, 57, 0.95);
            box-shadow: 0 0 0 3px rgba(59,130,246,0.09);
          }

          .cn-select {
            cursor: pointer;
            -webkit-appearance: none;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'%3E%3Cpath fill='%2364748b' d='M5 7L0 2h10z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 13px center;
          }
          .cn-select option { background: #0f172a; color: #e2e8f0; }

          .cn-textarea { resize: vertical; min-height: 80px; line-height: 1.65; }
          .cn-textarea--tall { min-height: 200px; font-family: 'Courier New', monospace; font-size: 13px; }

          .cn-char-count {
            font-size: 11px;
            color: #334155;
            font-family: 'Courier New', monospace;
            text-align: right;
          }

          /* Tags */
          .cn-tags { display: flex; flex-wrap: wrap; gap: 6px; }

          .cn-tag {
            background: rgba(59,130,246,0.11);
            border: 1px solid rgba(59,130,246,0.22);
            color: #93c5fd;
            padding: 3px 10px;
            border-radius: 100px;
            font-size: 11px;
            font-family: 'Courier New', monospace;
          }

          /* ── Drop Zone ── */
          .cn-dropzone {
            border: 2px dashed rgba(148,163,184,0.18);
            border-radius: 12px;
            padding: 32px 24px;
            text-align: center;
            cursor: pointer;
            transition: all 0.22s;
            background: rgba(10, 18, 35, 0.5);
            min-height: 160px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .cn-dropzone:hover,
          .cn-dropzone--over {
            border-color: rgba(59,130,246,0.45);
            background: rgba(59,130,246,0.05);
          }

          .cn-dropzone--filled {
            cursor: default;
            border-style: solid;
            border-color: rgba(16,185,129,0.35);
            background: rgba(16,185,129,0.04);
          }

          /* Drop empty state */
          .cn-drop-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
          }

          .cn-drop-icon { font-size: 42px; line-height: 1; }

          .cn-drop-title { font-size: 15px; font-weight: 600; color: #cbd5e1; }

          .cn-drop-sub { font-size: 13px; color: #475569; }

          .cn-drop-link { color: #60a5fa; text-decoration: underline; }

          .cn-drop-limit {
            font-size: 11px;
            color: #2d3f5a;
            font-family: 'Courier New', monospace;
          }

          .cn-accepted { display: flex; gap: 6px; flex-wrap: wrap; justify-content: center; }

          .cn-accepted-chip {
            background: rgba(148,163,184,0.07);
            border: 1px solid rgba(148,163,184,0.12);
            color: #64748b;
            padding: 2px 9px;
            border-radius: 4px;
            font-size: 10px;
            font-family: 'Courier New', monospace;
          }

          /* File card */
          .cn-file-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            width: 100%;
          }

          .cn-file-emoji { font-size: 52px; line-height: 1; }

          .cn-img-preview {
            max-height: 130px;
            max-width: 100%;
            border-radius: 8px;
            object-fit: contain;
          }

          .cn-file-meta {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 3px;
          }

          .cn-file-name {
            color: #e2e8f0;
            font-size: 14px;
            font-weight: 600;
            max-width: 320px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .cn-file-size {
            color: #64748b;
            font-size: 12px;
            font-family: 'Courier New', monospace;
          }

          .cn-remove-btn {
            background: rgba(239,68,68,0.1);
            border: 1px solid rgba(239,68,68,0.22);
            color: #f87171;
            padding: 6px 14px;
            border-radius: 7px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.18s;
            font-family: 'Courier New', monospace;
          }
          .cn-remove-btn:hover { background: rgba(239,68,68,0.2); }

          /* ── Divider ── */
          .cn-divider {
            display: flex;
            align-items: center;
            gap: 14px;
            color: #2d3f5a;
            font-size: 11px;
            font-family: 'Courier New', monospace;
            letter-spacing: 0.06em;
          }
          .cn-divider::before, .cn-divider::after {
            content: '';
            flex: 1;
            height: 1px;
            background: rgba(148,163,184,0.09);
          }

          /* ── Buttons ── */
          .cn-btn-primary {
            width: 100%;
            padding: 13px;
            background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
            border: none;
            border-radius: 10px;
            color: #fff;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            letter-spacing: 0.01em;
          }
          .cn-btn-primary:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 10px 28px rgba(59,130,246,0.3);
          }
          .cn-btn-primary:disabled { opacity: 0.35; cursor: not-allowed; }

          .cn-actions {
            display: grid;
            grid-template-columns: 1fr 1.5fr;
            gap: 12px;
          }

          .cn-btn-draft {
            padding: 14px;
            background: rgba(22, 34, 57, 0.9);
            border: 1px solid rgba(148,163,184,0.18);
            border-radius: 10px;
            color: #94a3b8;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          .cn-btn-draft:hover:not(:disabled) {
            border-color: rgba(148,163,184,0.4);
            color: #cbd5e1;
            background: rgba(22, 34, 57, 1);
          }
          .cn-btn-draft:disabled { opacity: 0.4; cursor: not-allowed; }

          .cn-btn-publish {
            padding: 14px;
            background: linear-gradient(135deg, #059669 0%, #3b82f6 100%);
            border: none;
            border-radius: 10px;
            color: #fff;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            letter-spacing: 0.01em;
            position: relative;
            overflow: hidden;
          }
          .cn-btn-publish:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 10px 28px rgba(5,150,105,0.32);
          }
          .cn-btn-publish:disabled { opacity: 0.4; cursor: not-allowed; }

          .cn-publish-hint {
            text-align: center;
            font-size: 11px;
            color: #334155;
            font-family: 'Courier New', monospace;
            line-height: 1.6;
          }
          .cn-publish-hint strong { color: #475569; }

          /* ── Responsive ── */
          @media (max-width: 580px) {
            .cn-container { padding: 16px 12px 60px; }
            .cn-body, .cn-card-head { padding-left: 20px; padding-right: 20px; }
            .cn-row { grid-template-columns: 1fr; }
            .cn-actions { grid-template-columns: 1fr; }
            .cn-step-line { width: 20px; }
          }
        `}</style>
      </div>
    </ProtectedRoute>
  );
}