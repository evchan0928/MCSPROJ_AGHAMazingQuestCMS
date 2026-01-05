import React from 'react';
import ContentForm from '../ContentForm';
import { useNavigate } from 'react-router-dom';

export default function UploadContentPage() {
  const navigate = useNavigate();
  return (
    <div>
      <h2>Upload Content</h2>
      <ContentForm onDone={() => navigate('/dashboard/content')} />
    </div>
  );
}
