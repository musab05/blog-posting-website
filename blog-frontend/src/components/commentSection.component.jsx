import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthProvider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import {
  Heart,
  MessageSquare,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';

export default function CommentSection({ blog, setBlog }) {
  const { blogId } = useParams();
  const { user, token } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeReplyEditors, setActiveReplyEditors] = useState({});
  const [initialized, setInitialized] = useState(false);

  const toggleReplyEditor = commentId => {
    setActiveReplyEditors(prev => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
    if (!activeReplyEditors[commentId]) {
      setReplyingTo(commentId);
    } else {
      setReplyingTo(null);
    }
  };

  
  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/blogs/${blogId}/comment`,
        {
          text: commentText,
          userId: user?.userId,
          parentId: replyingTo,
        },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBlog(prev => ({
        ...res.data,
        likedByUser: prev.likedByUser,
      }));
      setCommentText('');
      setReplyingTo(null);
      if (replyingTo) {
        setActiveReplyEditors(prev => ({
          ...prev,
          [replyingTo]: false,
        }));
      }
    } catch (err) {
      console.error('Comment Error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async commentId => {
    if (!user?.id) return;

    try {
      const res = await axios.delete(
        `${
          import.meta.env.VITE_SERVER_DOMAIN
        }/blogs/${blogId}/comment/${commentId}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBlog(res.data);
    } catch (err) {
      console.error('Delete comment error:', err.response?.data || err.message);
    }
  };

  useEffect(() => {
    const initializeBlogData = async () => {
      if (!blogId || initialized) return;

      try {
        const viewResponse = await axios.post(
          `${import.meta.env.VITE_SERVER_DOMAIN}/blogs/${blogId}/view`,
          { userId: user?.id || null },
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setBlog(prev => ({
          ...prev,
          viewsCount:
            viewResponse.data.viewsCount || (prev.viewsCount || 0) + 1,
        }));

        if (user?.id) {
          const { data } = await axios.get(
            `${import.meta.env.VITE_SERVER_DOMAIN}/blogs/${blogId}/like-status`,
            {
              params: { userId: user.id },
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          setBlog(prev => ({
            ...prev,
            likedByUser: data.liked,
          }));
        } else {
          setBlog(prev => ({
            ...prev,
            viewsCount: (prev.viewsCount || 0),
          }));
        }

        setInitialized(true);
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };

    initializeBlogData();
  }, [blogId, user?.userId, token, setBlog, initialized]);

  const handleLike = async () => {
    if (!user?.id) return;

    try {
      setBlog(prev => ({
        ...prev,
        likesCount: prev.likedByUser
          ? prev.likesCount - 1
          : prev.likesCount + 1,
        likedByUser: !prev.likedByUser,
      }));

      const { data } = await axios.post(
        `${import.meta.env.VITE_SERVER_DOMAIN}/blogs/${blogId}/like`,
        { userId: user.userId },
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );

      setBlog(prev => ({
        ...prev,
        likesCount: data.likesCount,
        likedByUser: data.likedByUser,
      }));
    } catch (err) {
      setBlog(prev => ({
        ...prev,
        likesCount: prev.likedByUser
          ? prev.likesCount + 1
          : prev.likesCount - 1,
        likedByUser: !prev.likedByUser,
      }));
      console.error('Like error:', err);
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className="flex items-center gap-1"
            >
              <Heart
                size={18}
                className={
                  blog?.likedByUser
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-500'
                }
              />
              <span>{blog?.likesCount || 0}</span>
            </Button>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Eye size={18} />
              <span>{blog?.viewsCount || 0}</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold">
            Comments ({blog?.comments?.length || 0})
          </h2>
        </div>
      </CardHeader>

      {user && (
        <CardContent className="p-4 border-b">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.profileUrl} />
              <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Write a comment..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleAddComment}
                  disabled={loading || !commentText.trim()}
                >
                  {loading ? 'Posting...' : 'Comment'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      )}

      <CardContent className="p-0">
        {blog?.comments?.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="divide-y">
            {blog?.comments
              ?.filter(comment => !comment.parentId)
              ?.map(comment => (
                <CommentNode
                  key={comment.id}
                  comment={comment}
                  blog={blog}
                  user={user}
                  onReply={toggleReplyEditor}
                  activeReplyEditors={activeReplyEditors}
                  setCommentText={setCommentText}
                  handleAddComment={handleAddComment}
                  loading={loading}
                  onDelete={handleDeleteComment}
                />
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CommentNode({
  comment,
  blog,
  user,
  onReply,
  activeReplyEditors,
  setCommentText,
  handleAddComment,
  loading,
  onDelete,
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const replies = comment?.replies || [];

  return (
    <div className="p-4">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={comment.author?.profileUrl} />
          <AvatarFallback>
            {comment.author?.username[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <Link to={`/profile/${comment.author?.username}`}>
                <p className="font-medium">{comment.author?.username}</p>
              </Link>

              <p className="text-sm text-muted-foreground">
                {new Date(comment.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              {user?.id === comment.userId && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(comment.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  Delete
                </Button>
              )}
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReply(comment.id)}
                  className="text-muted-foreground"
                >
                  <MessageSquare size={16} className="mr-1" />
                  Reply
                </Button>
              )}
            </div>
          </div>
          <p className="mt-1">{comment.text}</p>

          {activeReplyEditors[comment.id] && (
            <div className="mt-4 pl-6">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profileUrl} />
                  <AvatarFallback>
                    {user.username[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder="Write your reply..."
                    onChange={e => setCommentText(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onReply(comment.id)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      disabled={loading}
                    >
                      {loading ? 'Posting...' : 'Reply'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Replies Section */}
          {replies?.length > 0 && (
            <Collapsible
              open={isExpanded}
              onOpenChange={setIsExpanded}
              className="mt-4"
            >
              <div className="flex items-center">
                <CollapsibleTrigger className="flex items-center text-sm text-muted-foreground">
                  {isExpanded ? (
                    <ChevronUp size={16} className="mr-1" />
                  ) : (
                    <ChevronDown size={16} className="mr-1" />
                  )}
                  {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="mt-2 space-y-4 pl-6 border-l-2">
                {replies.map(reply => (
                  <CommentNode
                    key={reply.id}
                    comment={reply}
                    blog={blog}
                    user={user}
                    onReply={onReply}
                    activeReplyEditors={activeReplyEditors}
                    setCommentText={setCommentText}
                    handleAddComment={handleAddComment}
                    loading={loading}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
      </div>
    </div>
  );
}
