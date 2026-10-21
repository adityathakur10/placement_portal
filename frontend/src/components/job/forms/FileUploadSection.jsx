import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { RiUpload2Line, RiFileTextLine, RiCloseLine } from 'react-icons/ri';
import { Toast } from '@/components/ui/toast';

const FileUploadSection = ({ formData, setFormData, errors }) => {
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file type
      if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
          .includes(file.type)) {
        Toast.error('Please upload a PDF or Word document');
        return;
      }

      // Validate file size (20MB)
      if (file.size > 20 * 1024 * 1024) {
        Toast.error('File size should be less than 20MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        descriptionFile: file,
        fileName: file.name
      }));
    }
  }, [setFormData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    multiple: false
  });

  return (
    <div className="space-y-4">
      {formData.descriptionFile ? (
        <div className="bg-base-100 rounded-lg border border-base-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RiFileTextLine className="text-2xl text-muted" />
              <span className="font-medium">{formData.fileName}</span>
            </div>
            <button
              type="button"
              onClick={() => setFormData(prev => ({
                ...prev,
                descriptionFile: null,
                fileName: null
              }))}
              className="text-red hover:text-red-600"
            >
              <RiCloseLine size={20} />
            </button>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            ${errors?.descriptionFile ? 'border-red' : 'border-base-200'} 
            ${isDragActive ? 'bg-base-200' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="space-y-2">
            <RiUpload2Line className="mx-auto text-3xl text-muted" />
            <div className="font-medium">Drag & drop or click to upload file</div>
            <div className="text-sm text-muted">PDF, DOC or DOCX (Max 20MB)</div>
          </div>
        </div>
      )}

      {errors?.descriptionFile && (
        <p className="text-sm text-red mt-2">{errors.descriptionFile}</p>
      )}
    </div>
  );
};

export default FileUploadSection;