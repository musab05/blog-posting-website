import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthProvider';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Edit,
  Eye,
  Calendar,
  FileText,
  Clock,
  Users,
  Heart,
} from 'lucide-react';

function BlogCard({ blog, onEdit }) {
  return (
    <Card
      className={`w-full overflow-hidden border hover:shadow-md transition-shadow ${
        blog.isDraft ? 'border-dashed border-gray-300' : 'border-solid'
      }`}
    >
      {/* Only show banner for published blogs */}
      {!blog.isDraft && blog.banner && (
        <img
          className="w-full h-32 object-cover"
          src={blog.banner}
          alt={blog.title}
        />
      )}

      <CardContent className={`p-3 ${blog.isDraft ? 'pt-3' : 'pt-2'}`}>
        <div className="flex flex-col h-full">
          <h2
            className={`font-medium line-clamp-2 ${
              blog.isDraft ? 'text-sm' : 'text-base'
            }`}
          >
            {blog.title}
          </h2>

          <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(blog.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(blog.id)}
                className="h-7 px-2 text-xs"
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
              {!blog.isDraft && (
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                  <Eye className="w-3 h-3 mr-1" />
                  View
                </Button>
              )}
            </div>
          </div>

          {/* Draft indicator */}
          {blog.isDraft && (
            <div className="mt-2 flex items-center gap-1 text-xs text-yellow-600">
              <Clock className="w-3 h-3" />
              <span>Draft</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('published');
  const [publishedBlogs, setPublishedBlogs] = useState([]);
  const [draftBlogs, setDraftBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalFollowers: 0,
    pendingFollowers: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [publishedRes, draftRes, metricsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/blogs/published`),
        axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/blogs/drafts`),
        axios.get(`${import.meta.env.VITE_SERVER_DOMAIN}/dashboard/metrics`),
      ]);

      setPublishedBlogs(publishedRes.data || []);
      setDraftBlogs(draftRes.data || []);
      setMetrics(
        metricsRes.data || {
          totalViews: 0,
          totalLikes: 0,
          totalFollowers: 0,
          pendingFollowers: 0,
        }
      );
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEditBlog = blogId => {
    navigate(`/editor?edit=${blogId}`);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Compact Metrics Section */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="p-3 pb-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium">Published</h3>
              <FileText className="h-3 w-3 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-lg font-bold">{publishedBlogs.length}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="p-3 pb-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium">Drafts</h3>
              <Clock className="h-3 w-3 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-lg font-bold">{draftBlogs.length}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="p-3 pb-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium">Views</h3>
              <Eye className="h-3 w-3 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-lg font-bold">{metrics.totalViews}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="p-3 pb-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium">Likes</h3>
              <Heart className="h-3 w-3 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-lg font-bold">{metrics.totalLikes}</div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="p-3 pb-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium">Followers</h3>
              <Users className="h-3 w-3 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-1">
            <div className="text-lg font-bold">{metrics.totalFollowers}</div>
            {metrics.pendingFollowers > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.pendingFollowers} pending
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Blogs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-10">
          <TabsTrigger value="published" className="text-xs py-1">
            Published
          </TabsTrigger>
          <TabsTrigger value="drafts" className="text-xs py-1">
            Drafts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="published">
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : publishedBlogs.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No published blogs yet
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {publishedBlogs.map(blog => (
                <BlogCard key={blog.id} blog={blog} onEdit={handleEditBlog} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="drafts">
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : draftBlogs.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">
              No drafts yet
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {draftBlogs.map(blog => (
                <BlogCard key={blog.id} blog={blog} onEdit={handleEditBlog} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
