import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';

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
          </blockquote>
        );
      case 'code':
        return (
          <pre
            key={block.id}
            className="bg-gray-100 p-2 rounded my-4 overflow-x-auto"
          >
            {block.data.code}
          </pre>
        );
      case 'image':
        return (
          <img
            key={block.id}
            src={block.data.file.url}
            alt={block.data.caption}
            className="rounded-xl my-4"
          />
        );
      case 'video':
        return (
          <video key={block.id} controls className="rounded-xl w-full my-4">
            <source src={block.data.file.url} type="video/mp4" />
          </video>
        );
      case 'delimiter':
        return (
          <div key={block.id} className="my-4 text-center">
            ***
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(
          import.meta.env.VITE_SERVER_DOMAIN+`/blogs/${blogId}`
        );
        console.log(res.data)
        setBlog(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [blogId]);

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (!blog) return <p className="p-8">Blog not found</p>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {(blog.banner && blog.type === "blog") && (
        <img
          src={blog.banner}
          alt="banner"
          className="rounded-2xl w-full h-96 object-cover"
        />
      )}

      <h1 className="text-4xl font-bold">{blog.title}</h1>

      <div className="flex items-center gap-4 mt-2">
        <Avatar>
          <AvatarImage src={blog.author?.profileURL || ''} />
          <AvatarFallback>
            {blog.author?.username[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">
            {blog.author?.name || blog.author?.username}
          </p>
          <p className="text-sm text-muted-foreground">
            {new Date(blog.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mt-4">
        {blog.tags?.map(tag => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))}
      </div>

      {blog.type === 'blog' && blog.content?.blocks && (
        <div className="prose prose-lg mt-6 max-w-none">
          <BlockRenderer blocks={blog.content.blocks} />
        </div>
      )}
      {blog.type === 'video' && blog.video && (
        <video controls className="rounded-xl w-full mt-6">
          <source src={blog.video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      <Card className="mt-8">
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MessageSquare size={20} /> Comments
          </h2>
          {blog.comments?.length === 0 && (
            <p className="text-sm text-muted-foreground">No comments yet</p>
          )}

          {blog.comments?.map(comment => (
            <div key={comment.id} className="space-y-2">
              <div className="flex gap-2 items-center">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {comment.author.username[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">
                    {comment.author.username}
                  </p>
                  <p className="text-sm">{comment.text}</p>
                </div>
              </div>

              {comment.replies?.length > 0 && (
                <div className="ml-8 space-y-2">
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="flex gap-2 items-center">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>
                          {reply.author.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-medium">
                          {reply.author.username}
                        </p>
                        <p className="text-xs">{reply.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
