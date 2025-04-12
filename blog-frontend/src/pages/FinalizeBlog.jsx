import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthProvider';

export default function FinalizeBlog() {
  const navigate = useNavigate();
  const location = useLocation();
  const { blogId, isUpdate } = location.state || {};
  const { user } = useAuth();

  const [shortDescription, setShortDescription] = useState('');
  const [tags, setTags] = useState('');

  useEffect(() => {
    if (blogId) {
      const fetchBlogData = async () => {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_SERVER_DOMAIN}/blogs/${blogId}/edit`,
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${user.token}`,
              },
            }
          );
          const blog = res.data;
          if (blog.shortDescription) {
            setShortDescription(blog.shortDescription);
          }
          if (blog.tags) {
            setTags(blog.tags.join(', '));
          }
        } catch (error) {
          console.error('Error fetching blog data:', error);
        }
      };
      fetchBlogData();
    }
  }, [blogId, user.token]);

  const handleFinalize = async () => {
    if (!shortDescription.trim()) {
      alert('Short description is required');
      return;
    }

    try {
      const tagsArray = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);

      await axios.put(
        `${import.meta.env.VITE_SERVER_DOMAIN}/blogs/finalize/${blogId}`,
        {
          shortDescription,
          tags: tagsArray,
        },
        { withCredentials: true }
      );

      alert(
        isUpdate ? 'Blog updated successfully!' : 'Blog published successfully!'
      );
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Error finalizing blog');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Publish
      </h2>
      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Short Description *</label>
          <textarea
            className="border rounded w-full p-2"
            placeholder="Enter short description"
            value={shortDescription}
            onChange={e => setShortDescription(e.target.value)}
            rows={5}
            required
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
          {isUpdate ? 'Update Blog' : 'Finalize & Publish'}
        </Button>
      </div>
    </div>
  );
}
