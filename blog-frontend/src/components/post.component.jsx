import axios from 'axios';
import PostCard from './postCard.component';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const PostCards = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const LIMIT = 9;

  const fetchPosts = async pageNum => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_SERVER_DOMAIN
        }/blogs/all/published/post?page=${pageNum}&limit=${LIMIT}`
      );
      const newPosts = response.data.blogs;
      if (newPosts.length < LIMIT) {
        setHasMore(false);
      }
      setPosts(prev => [...prev, ...newPosts]);
      setInitialLoad(false);
    } catch (err) {
      toast.error('Failed to fetch posts');
      setInitialLoad(false);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const handleShowMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-6">Latest Posts</h1>

      {!initialLoad && posts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">No posts published yet.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {posts.map(post => (
              <Link to={`/blogs/${post.id}`} key={post.id}>
                <PostCard {...post} />
              </Link>
            ))}
          </div>

          {hasMore && posts.length > 0 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={handleShowMore}
                className="border px-6 py-2 rounded-md hover:bg-gray-100"
              >
                Show More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PostCards;
