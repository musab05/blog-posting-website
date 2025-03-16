import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import TextEditor from '../components/textEditor.component';

export default function EditorPage() {
  const [mode, setMode] = useState('blog');
  const [title, setTitle] = useState('');
  const [banner, setBanner] = useState(null);
  const [content, setContent] = useState(null);
  const [video, setVideo] = useState(null);

  const handleSaveDraft = () => {
    if (mode === 'blog' && title.trim() !== '') {
      alert('Draft saved!');
    }
  };

  const handleFullSave = () => {
    if (mode === 'blog' && banner && title && content) {
      alert('Blog saved! Move to tags/description page');
    } else if (mode === 'video' && video) {
      alert('Video saved! Move to tags/description page');
    }
  };

  const handleBannerUpload = e => {
    const file = e.target.files[0];
    if (file) setBanner(URL.createObjectURL(file));
  };

  const handleVideoUpload = e => {
    const file = e.target.files[0];
    if (file) setVideo(URL.createObjectURL(file));
  };

  return (
    <div className="max-w-5xl mx-auto p-6 relative">
      {/* NAV-LIKE BUTTONS */}
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

        {/* BLOG */}
        <TabsContent value="blog">
          <div className="space-y-6">
            {/* Banner Upload */}
            <Card>
              <CardContent className="p-4">
                <label className="mb-2 block font-medium">Banner Image:</label>
                <div
                  className="w-full aspect-video border-dashed border-2 rounded flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50"
                  onClick={() => document.getElementById('bannerInput').click()}
                >
                  {banner ? (
                    <img
                      src={banner}
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

            {/* Title & Content */}
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

        {/* VIDEO */}
        <TabsContent value="video">
          <Card>
            <CardContent className="p-4 space-y-4">
              <label className="block mb-1 font-medium">Upload Video:</label>
              <div
                className="w-full aspect-video border-dashed border-2 rounded flex items-center justify-center cursor-pointer overflow-hidden bg-gray-50"
                onClick={() => document.getElementById('videoInput').click()}
              >
                {video ? (
                  <video controls className="w-full h-full object-cover">
                    <source src={video} />
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
