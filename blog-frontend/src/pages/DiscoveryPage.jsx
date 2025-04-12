import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FiSearch,
  FiX,
  FiHeart,
  FiMessageSquare,
  FiBookmark,
  FiShare2,
  FiHome,
  FiCompass,
  FiPlusSquare,
  FiUser,
} from 'react-icons/fi';
import {
  RiFireFill,
  RiTimeFill,
  RiUserStarFill,
  RiShuffleFill,
} from 'react-icons/ri';
import { Link } from 'react-router-dom';

const DiscoveryPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('trending');
  const [isSearching, setIsSearching] = useState(false);
  const observer = useRef();

  // Deduplicate results
  const deduplicateResults = resultsArray => {
    const uniqueResults = [];
    const ids = new Set();

    resultsArray.forEach(item => {
      if (!ids.has(`${item.type}-${item.id}`)) {
        ids.add(`${item.type}-${item.id}`);
        uniqueResults.push(item);
      }
    });

    return uniqueResults;
  };

  // Fetch content
  const fetchContent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_DOMAIN}/discovery`,
        {
          params: { page, tab: activeTab },
        }
      );

      const contentResults = response.data.blogs.map(blog => ({
        type: 'blog',
        id: blog.id,
        title: blog.title,
        media: blog.banner,
        description: blog.shortDescription,
        tags: Array.isArray(blog.tags)
          ? blog.tags
          : JSON.parse(blog.tags || '[]'),
        likesCount: blog.likesCount,
        commentsCount: blog.commentsCount || 0,
        createdAt: blog.createdAt,
        author: {
          id: blog.author.id,
          username: blog.author.username,
          name: blog.author.name,
          avatar: blog.author.profileUrl,
        },
      }));

      setResults(prev => deduplicateResults([...prev, ...contentResults]));
      setHasMore(response.data.hasMore);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch content');
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchContent();
  }, [activeTab]);

  // Infinite scroll
  const lastResultRef = useCallback(
    node => {
      if (loading || !hasMore || isSearching) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          setPage(prev => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, isSearching]
  );

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setIsSearching(false);
      setResults([]);
      setPage(1);
      fetchContent();
      return;
    }

    try {
      setIsSearching(true);
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_DOMAIN}/discovery/search`,
        { params: { query: searchQuery } }
      );

      setResults(deduplicateResults(response.data.results || []));
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Search failed. Please try again.');
      setLoading(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    setResults([]);
    setPage(1);
    fetchContent();
  };

  // Tab change
  useEffect(() => {
    if (!isSearching) {
      setResults([]);
      setPage(1);
      fetchContent();
    }
  }, [activeTab]);

  // Pagination
  useEffect(() => {
    if (page > 1 && !isSearching) {
      fetchContent();
    }
  }, [page]);

  // Content Card Component
  const ContentCard = ({ content }) => (
    <Card className="border-none rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <CardHeader className="p-3 flex items-center space-x-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={content.author.avatar} />
          <AvatarFallback>{content.author.username.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Link
            to={`/${content.type === 'blog' ? 'blog' : 'profile'}/${
              content.id
            }`}
            className="font-medium text-sm hover:underline"
          >
            {content.author.username}
          </Link>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <FiShare2 className="h-4 w-4" />
        </Button>
      </CardHeader>

      {/* Media */}
      <div className="aspect-square bg-gray-100 relative">
        {content.media && (
          <img
            src={content.media}
            alt={content.title || content.username}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
      </div>

      {/* Actions */}
      <CardFooter className="p-3 flex flex-col space-y-2">
        <div className="flex justify-between w-full">
          <div className="flex space-x-4">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <FiHeart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <FiMessageSquare className="h-5 w-5" />
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <FiBookmark className="h-5 w-5" />
          </Button>
        </div>

        {/* Likes */}
        {content.likesCount > 0 && (
          <div className="text-sm font-medium">
            {content.likesCount.toLocaleString()} likes
          </div>
        )}

        {/* Description */}
        <div className="text-sm">
          <span className="font-medium mr-1">{content.author.username}</span>
          {content.description || content.bio}
        </div>

        {/* Tags */}
        {content.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {content.tags.slice(0, 3).map(tag => (
              <Link
                key={tag}
                to={`/explore/tags/${tag}`}
                className="text-sm text-blue-500 hover:underline"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className="text-xs text-gray-500">
          {new Date(content.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </div>
      </CardFooter>
    </Card>
  );

  // User Card Component
  const UserCard = ({ user }) => (
    <Card className="border-none rounded-lg overflow-hidden p-4 flex items-center space-x-3">
      <Avatar className="h-14 w-14">
        <AvatarImage src={user.profileUrl} />
        <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <Link
          to={`/profile/${user.username}`}
          className="font-medium hover:underline block"
        >
          {user.username}
        </Link>
        <p className="text-sm text-gray-500">{user.name}</p>
      </div>
      <Button variant="outline" size="sm" className="rounded-full">
        Follow
      </Button>
    </Card>
  );

  // Skeleton Loader
  const ContentSkeleton = () => (
    <Card className="border-none rounded-lg overflow-hidden">
      <CardHeader className="p-3 flex items-center space-x-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </CardHeader>
      <Skeleton className="aspect-square w-full" />
      <CardFooter className="p-3 space-y-2">
        <div className="flex justify-between">
          <div className="flex space-x-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-20" />
      </CardFooter>
    </Card>
  );

  return (
    <div className="max-w-2xl mx-auto pb-16">
      {/* Search Bar */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-3">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search content, tags, or people..."
            className="pl-9 pr-9 py-5 text-base rounded-full"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5"
              onClick={clearSearch}
            >
              <FiX className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-14 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-3">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
          disabled={isSearching}
        >
          <TabsList className="grid grid-cols-4 w-full bg-transparent">
            <TabsTrigger value="trending" className="flex-col h-14">
              <RiFireFill className="h-5 w-5 mb-1" />
              <span className="text-xs">Trending</span>
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex-col h-14">
              <RiTimeFill className="h-5 w-5 mb-1" />
              <span className="text-xs">Recent</span>
            </TabsTrigger>
            <TabsTrigger value="popular" className="flex-col h-14">
              <RiUserStarFill className="h-5 w-5 mb-1" />
              <span className="text-xs">Popular</span>
            </TabsTrigger>
            <TabsTrigger value="random" className="flex-col h-14">
              <RiShuffleFill className="h-5 w-5 mb-1" />
              <span className="text-xs">Random</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="px-3 space-y-4">
        {error ? (
          <div className="text-center py-10">
            <p className="text-red-500 mb-4">{error}</p>
            <Button
              onClick={() => {
                setError(null);
                fetchContent();
              }}
            >
              Retry
            </Button>
          </div>
        ) : (
          <>
            {/* Search Results */}
            {isSearching && results.some(item => item.type === 'user') && (
              <div className="space-y-3">
                <h3 className="font-medium">People</h3>
                {results
                  .filter(item => item.type === 'user')
                  .map((user, index) => (
                    <UserCard key={`user-${user.id}-${index}`} user={user} />
                  ))}
                <h3 className="font-medium pt-4">Posts</h3>
              </div>
            )}

            {/* Content Grid */}
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence>
                {results
                  .filter(item => !isSearching || item.type === 'blog')
                  .map((item, index) => (
                    <motion.div
                      key={`${item.type}-${item.id}-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      ref={index === results.length - 1 ? lastResultRef : null}
                    >
                      {item.type === 'blog' ? (
                        <ContentCard content={item} />
                      ) : null}
                    </motion.div>
                  ))}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(3)].map((_, index) => (
              <ContentSkeleton key={`skeleton-${index}`} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && !error && (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium mb-2">
              {isSearching ? 'No results found' : 'No content available'}
            </h3>
            <p className="text-muted-foreground">
              {isSearching
                ? 'Try different search terms'
                : 'Check back later for new posts'}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t flex justify-around py-3">
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <FiHome className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <FiCompass className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <FiPlusSquare className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <FiUser className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default DiscoveryPage;
