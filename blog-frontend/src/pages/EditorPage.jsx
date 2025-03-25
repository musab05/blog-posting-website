import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import TextEditor from '../components/textEditor.component';
import axios from 'axios';
import { useAuth } from '../AuthProvider';
import { useNavigate } from 'react-router-dom';

export default function EditorPage() {
  const [mode, setMode] = useState('blog');
  const [title, setTitle] = useState('');
  const [banner, setBanner] = useState(null);
  const [bannerPath, setBannerPath] = useState('');
  const [content, setContent] = useState(null);
  const [video, setVideo] = useState(null);
  const [videoPath, setVideoPath] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const uploadFile = async file => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await axios.post(
      import.meta.env.VITE_SERVER_DOMAIN + '/api/upload',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      }
    );
    console.log(res.data)
    if (res.data.type === "video") {
      return res.data;
    }
    
    return res.data.url;
  };

  const handleSaveDraft = async () => {
    console.log('Draft save is called');

    if (title.trim() === '') {
      alert('Title is required');
      return;
    }

    let payload = { title, userId:user.userId, type: mode, isDraft: true };

    if (mode === 'blog' && banner) {
      payload.banner = await uploadFile(banner);
    }

    if (mode === 'video' && video) {
      const videoData = await uploadFile(video);
      payload.video = videoData.url;
      payload.banner = videoData.banner;
    }

    if (mode === 'blog') {
      payload.content = content;
    }
    console.log("Draft", payload)

    await axios.post(import.meta.env.VITE_SERVER_DOMAIN + '/blogs', payload, {
      withCredentials: true,
    });
    alert('Draft saved!');
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
    console.log("Full save is called")
    if (mode === 'blog' && (!title || !content || !banner)) {
      alert('Please fill in all required fields');
      return;
    }
    if (mode === 'video' && !video) {
      alert('Video is required');
      return;
    }

    let payload = { title, type: mode, isDraft: false, userId: user.userId };

    if (mode === 'blog' && banner) {
      payload.banner = await uploadFile(banner);
      payload.content = content;
    }

    if (mode === 'video' && video) {
      const videoData = await uploadFile(video);
      payload.video = videoData.url;
      payload.banner = videoData.banner;
    }
    console.log('Blog', payload);

    const res = await axios.post(
      import.meta.env.VITE_SERVER_DOMAIN + '/blogs/create',
      payload,
      { withCredentials: true }
    );

    alert('Move to finalize step');
    navigate('/finalize-blog', { state: { blogId: res.data.id } });
  };

  return (
    <div className="max-w-5xl mx-auto p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Editor</h2>
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleSaveDraft}>
            Save Draft
          </Button>
          <Button onClick={handleFullSave}>Publish</Button>
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
                  {banner ? (
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
                  <TextEditor setContent={setContent} />
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
                {video ? (
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
