import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import TextEditor from '../components/textEditor.component';
import axios from 'axios';
import { useAuth } from '../AuthProvider';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';

export default function EditorPage() {
  const [mode, setMode] = useState('blog');
  const [title, setTitle] = useState('');
  const [banner, setBanner] = useState(null);
  const [bannerPath, setBannerPath] = useState('');
  const [content, setContent] = useState('');
  const [video, setVideo] = useState(null);
  const [videoPath, setVideoPath] = useState('');
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editMode = searchParams.get('edit');
  const [blogId, setBlogId] = useState(null);
  const [isDraft, setIsDraft] = useState(false);

  const uploadFile = async fileOrUrl => {
    if (typeof fileOrUrl === 'string') {
      return fileOrUrl;
    }

    const formData = new FormData();
    formData.append('file', fileOrUrl);

    const res = await axios.post(
      import.meta.env.VITE_SERVER_DOMAIN + '/api/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      }
    );

    if (res.data.type === 'video') {
      return res.data;
    }
    return res.data.url;
  };

  const handleSaveDraft = async () => {
    if (title.trim() === '') {
      alert('Title is required');
      return;
    }

    let payload = {
      title,
      userId: user.userId,
      type: mode,
      isDraft: true,
    };

    try {
      if (mode === 'blog' && (banner || bannerPath)) {
        payload.banner = await uploadFile(banner || bannerPath);
      }

      if (mode === 'video' && (video || videoPath)) {
        const videoData = await uploadFile(video || videoPath);
        payload.video = videoData.url || videoData;
        payload.banner = videoData.banner || bannerPath;
      }

      if (mode === 'blog') {
        payload.content = content;
      }

      let response;
      if (editMode) {
        // Update existing draft
        response = await axios.put(
          `${import.meta.env.VITE_SERVER_DOMAIN}/blogs/${editMode}`,
          payload,
          { withCredentials: true }
        );
      } else {
        // Create new draft
        response = await axios.post(
          `${import.meta.env.VITE_SERVER_DOMAIN}/blogs/create`,
          payload,
          { withCredentials: true }
        );
      }

      alert('Draft saved!');
      navigate('/')
      if (!editMode) {
        setBlogId(response.data.id);
      }
    } catch (err) {
      console.error('Error saving draft:', err);
      alert('Failed to save draft');
    }
  };

  const handleBannerUpload = e => {
    const file = e.target.files[0];
    if (file) {
      setBanner(file);
      setBannerPath(URL.createObjectURL(file));
    }
  };

  const handleVideoUpload = e => {
    const file = e.target.files[0];
    if (file) {
      setVideo(file);
      setVideoPath(URL.createObjectURL(file));
    }
  };

  const handleFullSave = async () => {
    console.log('Full save clicked', mode, title, content, banner);
    if (mode === 'blog' && (!title || !content || (!banner && !bannerPath))) {
      alert('Please fill in all required fields');
      return;
    }
    if (mode === 'video' && (!video && !videoPath)) {
      alert('Video is required');
      return;
    }

    try {
      let payload = {
        title,
        type: mode,
        isDraft: false,
        userId: user.userId,
      };

      if (mode === 'blog') {
        payload.banner = bannerPath.startsWith('blob:')
          ? await uploadFile(banner)
          : bannerPath;
        payload.content = content;
      }

      if (mode === 'video') {
        const videoData = videoPath.startsWith('blob:')
          ? await uploadFile(video)
          : { url: videoPath, banner: bannerPath };
        payload.video = videoData.url;
        payload.banner = videoData.banner;
      }

      let response;
      if (editMode) {
        // Update existing blog
        response = await axios.put(
          `${import.meta.env.VITE_SERVER_DOMAIN}/blogs/${editMode}`,
          payload,
          { withCredentials: true }
        );
      } else {
        // Create new blog
        response = await axios.post(
          `${import.meta.env.VITE_SERVER_DOMAIN}/blogs/create`,
          payload,
          { withCredentials: true }
        );
      }

      navigate('/finalize-blog', {
        state: {
          blogId: editMode || response.data.id,
          isUpdate: !!editMode,
        },
      });
    } catch (err) {
      console.error('Error publishing blog:', err);
      alert('Failed to publish blog');
    }
  };

  useEffect(() => {
    if (editMode) {
      const fetchBlogToEdit = async () => {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_SERVER_DOMAIN}/blogs/${editMode}/edit`,
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const blog = res.data;
          setTitle(blog.title);
          setMode(blog.type || 'blog');
          setContent(blog.content || '');
          setIsDraft(blog.isDraft);
          setBlogId(blog.id);

          if (blog.banner) {
            setBannerPath(blog.banner);
          }

          if (blog.video) {
            setVideoPath(blog.video);
          }
        } catch (err) {
          console.error('Error fetching blog to edit:', err);
          navigate('/');
        }
      };
      fetchBlogToEdit();
    }
  }, [editMode, token, navigate]);

  return (
    <div className="max-w-5xl mx-auto p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <div className="text-2xl flex flex-row">
          <Link to="/" className="hover:text-gray-700 text-2xl flex flex-row justify-center items-center font-semibold">
            <FaHome size={30} />
            Home
          </Link>
          /
          <span className="text-2xl font-semibold">
            {editMode ? (isDraft ? 'Edit Draft' : 'Edit Blog') : 'Editor'}
          </span>
        </div>

        <div className="flex gap-4">
          <Button variant="outline" onClick={handleSaveDraft}>
            Draft
          </Button>
          <Button onClick={handleFullSave}>
            {editMode ? 'Update' : 'Save'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="blog" onValueChange={setMode} value={mode}>
        <TabsList className="mb-4">
          <TabsTrigger value="blog">Create Blog</TabsTrigger>
          <TabsTrigger value="video">Upload Video</TabsTrigger>
        </TabsList>

        <TabsContent value="blog">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <label className="mb-2 block font-medium">Banner Image:</label>
                <div
                  className="w-full aspect-video border-dashed border-2 rounded flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50"
                  onClick={() => document.getElementById('bannerInput').click()}
                >
                  {bannerPath ? (
                    <img
                      src={bannerPath}
                      alt="banner"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center">
                      <Upload />
                      <span>Click to upload banner</span>
                    </div>
                  )}
                  <input
                    id="bannerInput"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleBannerUpload}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Title:</label>
                  <input
                    className="border rounded w-full p-2"
                    placeholder="Enter blog title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium">Content:</label>
                  <TextEditor
                    setContent={setContent}
                    initialContent={content}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="video">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <label className="block mb-1 font-medium">Title:</label>
                <input
                  className="border rounded w-full p-2"
                  placeholder="Enter blog title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
              <label className="block mb-1 font-medium">Upload Video:</label>
              <div
                className="w-full aspect-video border-dashed border-2 rounded flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50"
                onClick={() => document.getElementById('videoInput').click()}
              >
                {videoPath ? (
                  <video controls className="w-full h-full object-cover">
                    <source src={videoPath} />
                  </video>
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <Upload />
                    <span>Click to upload video</span>
                  </div>
                )}
                <input
                  id="videoInput"
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={handleVideoUpload}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
