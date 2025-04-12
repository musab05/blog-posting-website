import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { motion } from 'framer-motion';
import TopPost from './topPost.component';
import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Carousel = () => {
  const [topPosts, setTopPosts] = useState([]);
  const [hasPosts, setHasPosts] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + '/blogs/all/published')
      .then(response => {
        const allPosts = response.data;
        if (allPosts.length > 0) {
          const shuffled = allPosts.sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, 5);
          setTopPosts(selected);
          setHasPosts(true);
        }
        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to fetch posts');
        setLoading(false);
      });
  }, []);

  if (loading) return null;
  if (!hasPosts) return null;

  return (
    <div className="relative w-full h-auto m-0 px-0">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        slidesPerView={1.3}
        centeredSlides={true}
        autoplay={{ delay: 2000, disableOnInteraction: false }}
        loop={topPosts.length > 3}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={20}
        className="w-full h-full"
      >
        {topPosts.map((post, index) => (
          <SwiperSlide
            key={post.id}
            className="flex justify-center items-center"
          >
            {({ isActive }) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{
                  opacity: 1,
                  scale: isActive ? 1 : 0.9,
                }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className={`w-full text-center p-2 rounded-lg transition-all ${
                  isActive ? '' : 'scale-90'
                }`}
              >
                <Link to={`/blogs/${post.id}`}>
                  <TopPost
                    title={post.title}
                    user={post.author}
                    imgSrc={post.banner}
                    tag={
                      post.tags?.length > 0
                        ? post.tags[
                            Math.floor(Math.random() * post.tags.length)
                          ]
                        : 'General'
                    }
                    createdAt={post.createdAt}
                  />
                </Link>
              </motion.div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Carousel;
