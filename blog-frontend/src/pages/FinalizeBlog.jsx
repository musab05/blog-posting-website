// src/pages/FinalizeBlog.jsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

export default function FinalizeBlog() {
  const navigate = useNavigate();
  const location = useLocation();
  const { blogId } = location.state || {};

  const [shortDescription, setShortDescription] = useState('');
  const [tags, setTags] = useState('');

  const handleFinalize = async () => {
    if (!shortDescription.trim()) {
      alert('Short description is required');
      return;
    }

    try {
      await axios.put(
        import.meta.env.VITE_SERVER_DOMAIN + `/blogs/finalize/${blogId}`,
        {
          shortDescription,
          tags: tags.split(',').map(tag => tag.trim()),
        },
        { withCredentials: true }
      );

      alert('Blog finalized and published!');
      navigate('/'); // Redirect to homepage or blog list
    } catch (error) {
      console.error(error);
      alert('Error finalizing blog');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Finalize Your Blog</h2>
      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Short Description</label>
          <textarea
            className="border rounded w-full p-2"
            placeholder="Enter short description"
            value={shortDescription}
            onChange={e => setShortDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">
            Tags (comma separated)
          </label>
          <input
            className="border rounded w-full p-2"
            placeholder="e.g. tech, react, javascript"
            value={tags}
            onChange={e => setTags(e.target.value)}
          />
        </div>
        <Button onClick={handleFinalize} className="w-full">
          Finalize & Publish
        </Button>
      </div>
    </div>
  );
}
