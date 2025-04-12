import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, MessageSquare } from 'lucide-react';
import CommentSection from '../components/commentSection.component';
import VideoPlayer from '../common/VideoPlayer';
import { useAuth } from '../AuthProvider';

function BlockRenderer({ blocks }) {
  return blocks.map(block => {
    switch (block.type) {
      case 'header':
        return (
          <h2 key={block.id} className="text-2xl font-bold my-4">
            {block.data.text}
          </h2>
        );
      case 'paragraph':
        return (
          <p key={block.id} className="my-2 leading-7">
            {block.data.text}
          </p>
        );
      case 'list':
        return block.data.style === 'ordered' ? (
          <ol key={block.id} className="list-decimal ml-6">
            {block.data.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        ) : (
          <ul key={block.id} className="list-disc ml-6">
            {block.data.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        );
      case 'quote':
        return (
          <blockquote key={block.id} className="border-l-4 pl-4 italic my-4">
            {block.data.text}
            {block.data.caption && (
              <footer className="text-sm mt-2 not-italic">
                — {block.data.caption}
              </footer>
            )}
          </blockquote>
        );
      case 'code':
        return (
          <pre
            key={block.id}
            className="bg-gray-100 p-4 rounded my-4 overflow-x-auto text-sm"
          >
            <code>{block.data.code}</code>
          </pre>
        );
      case 'image':
        const imageFile = block.data.file;
        return (
          <figure key={block.id} className="my-6">
            <div className="flex justify-center">
              {imageFile?.url ? (
                <img
                  src={imageFile.url}
                  alt={block.data.caption || ''}
                  className="rounded-xl max-w-full h-auto max-h-[600px] object-contain"
                  onError={e => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling?.style?.removeProperty(
                      'display'
                    );
                  }}
                />
              ) : null}
              <div className="hidden bg-gray-100 rounded-xl p-4 text-center w-full">
                Failed to load image
              </div>
            </div>
            {block.data.caption && (
              <figcaption className="text-sm text-gray-500 text-center mt-2">
                {block.data.caption}
              </figcaption>
            )}
          </figure>
        );
      case 'video':
        const videoUrl = block.data.url || block.data.file?.url;
        const caption = block.data.caption;

        if (!videoUrl) {
          console.error('No video URL found in block:', block);
          return (
            <div className="bg-gray-100 rounded-xl p-4 text-center my-6">
              Video content not available
            </div>
          );
        }

        return (
          <div key={block.id} className="my-6">
            <div className="relative aspect-video">
              <video
                controls
                className="rounded-xl w-full bg-black"
                onError={e => {
                  e.target.style.display = 'none';
                  const errorDiv = e.target.nextElementSibling;
                  if (errorDiv) errorDiv.style.display = 'flex';
                }}
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div
                className="hidden absolute inset-0 bg-gray-100 rounded-xl items-center justify-center"
                style={{ display: 'none' }}
              >
                Failed to load video
              </div>
            </div>
            {caption && (
              <p className="text-sm text-gray-500 text-center mt-2">
                {caption}
              </p>
            )}
          </div>
        );
      case 'delimiter':
        return (
          <div key={block.id} className="my-8 flex justify-center">
            <div className="w-24 h-px bg-gray-300"></div>
          </div>
        );
      default:
        return null;
    }
  });
}

export default function BlogShowPage() {
  const { blogId } = useParams();
  const [blog, setBlog] = useState(null);
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleEditBlog = blogId => {
    navigate(`/editor?edit=${blogId}`);
  };

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_DOMAIN}/blogs/${blogId}`
        );
        console.log(res.data);
        setBlog(res.data);
        setAuthor(res.data.author);
      } catch (err) {
        console.error(err);
        setError('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [blogId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-96 w-full" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg inline-block">
          {error}
        </div>
        <Link
          to="/"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          Return to home
        </Link>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center">
        <p>Blog not found</p>
        <Link
          to="/"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          Return to home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {blog.banner && blog.type === 'blog' && (
        <img
          src={blog.banner}
          alt="banner"
          className="rounded-2xl w-full h-96 object-cover"
          onError={e => {
            e.target.style.display = 'none';
          }}
        />
      )}

      <h1 className="text-4xl font-bold">{blog.title}</h1>

      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src={author?.profileUrl} />
          <AvatarFallback>
            {author?.username?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div>
          <Link
            to={`/profile/${author?.username}`}
            className="font-semibold hover:underline"
          >
            {author?.username || 'Unknown author'}
          </Link>
          <p className="text-sm text-muted-foreground">
            {new Date(blog.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        {blog.userId === user?.id && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditBlog(blog.id)}
            className="h-8"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
        )}
      </div>

      {blog.tags?.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {blog.tags.map(tag => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      {blog.type === 'blog' && blog.content?.blocks && (
        <article className="mt-8">
          <BlockRenderer blocks={blog.content.blocks} />
        </article>
      )}

      {blog.type === 'video' && blog.video && (
        <div className="mt-8">
          <VideoPlayer videoUrl={blog.video} />
        </div>
      )}

      <div className="mt-12">
        <CommentSection blog={blog} setBlog={setBlog} />
      </div>
    </div>
  );
}
