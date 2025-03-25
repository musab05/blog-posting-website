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

  useEffect(() => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + '/blogs/all/published')
      .then(response => {
        const allPosts = response.data;

        const shuffled = allPosts.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 5);
        setTopPosts(selected);
      })
      .catch(err => {
        toast.error('Failed to fetch posts');
      });
  }, []);

  return (
    <div className="relative w-full h-auto m-0 px-0">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        slidesPerView={1}
        autoplay={{ delay: 2000, disableOnInteraction: false }}
        loop={topPosts.length > 3}
        navigation
        pagination={{ clickable: true }}
        className="w-full h-full"
        spaceBetween={20}
      >
        {topPosts.map(post => (
          <SwiperSlide
            key={post.id}
            className="flex justify-center items-center w-full h-full"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="w-full h-full text-center"
            >
              <Link to={`/blogs/${post.id}`}>
                <TopPost
                  title={post.title}
                  user={post.author}
                  imgSrc={post.banner}
                  tag={
                    post.tags && post.tags.length > 0
                      ? post.tags[Math.floor(Math.random() * post.tags.length)]
                      : 'General'
                  }
                  createdAt={post.createdAt}
                />
              </Link>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Carousel;
