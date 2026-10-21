import React, { useCallback, useMemo, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({ content, onChange, error, maxLength = 5000 }) => {
  const quillRef = useRef(null);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        [{ 'color': [] }, { 'background': [] }],
        ['link'],
        ['clean']
      ],
    },
    clipboard: {
      matchVisual: false
    },
    keyboard: {
      bindings: {
        tab: false
      }
    }
  }), []);

  // Use MutationObserver instead of DOMNodeInserted
  useEffect(() => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const observer = new MutationObserver(() => {
        editor.update();
      });
      
      observer.observe(editor.root, {
        childList: true,
        subtree: true,
        characterData: true
      });

      return () => observer.disconnect();
    }
  }, []);

  const handleChange = useCallback((value) => {
    const text = value.replace(/<[^>]*>/g, '');
    if (text.length <= maxLength) {
      onChange(value);
    }
  }, [onChange, maxLength]);

  const characterCount = useMemo(() => {
    const text = content?.replace(/<[^>]*>/g, '') || '';
    return text.length;
  }, [content]);

  const wordCount = useMemo(() => {
    const text = content?.replace(/<[^>]*>/g, '') || '';
    return text.trim().split(/\s+/).filter(Boolean).length;
  }, [content]);

  return (
    <div className="rich-text-editor space-y-2">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={content}
        onChange={handleChange}
        modules={modules}
        formats={[
          'header',
          'bold', 'italic', 'underline', 'strike',
          'list', 'bullet',
          'align',
          'color', 'background',
          'link'
        ]}
        className={`bg-white transition-colors ${
          error ? 'border-red-500' : 'border-gray-300 hover:border-gray-400 focus-within:border-blue-500'
        }`}
      />
      <div className="flex justify-between text-sm text-gray-500">
        <div className="space-x-4">
          <span>{characterCount}/{maxLength} characters</span>
          <span>•</span>
          <span>{wordCount} words</span>
        </div>
        {error && (
          <span className="text-red-500">{error}</span>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;