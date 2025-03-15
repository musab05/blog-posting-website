import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { motion } from 'framer-motion';
import TopPost from './topPost.component';

const topPosts = [
  { id: 1, title: 'Post 1', content: 'This is post 1.' },
  { id: 2, title: 'Post 2', content: 'This is post 2.' },
  { id: 3, title: 'Post 3', content: 'This is post 3.' },
  { id: 4, title: 'Post 4', content: 'This is post 4.' },
  { id: 5, title: 'Post 5', content: 'This is post 5.' },
];

const Carousel = () => {
  return (
    <div className="relative w-full h-auto m-0 px-0">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        slidesPerView={1}
        autoplay={{ delay: 2000, disableOnInteraction: false }}
        loop={true}
        navigation
        pagination={{ clickable: true }}
        className="w-full h-full"
      >
        {topPosts.map(post => (
          <SwiperSlide
            key={post.id}
            className="flex justify-center items-center w-full h-full"
          >
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="w-full h-full text-center"
            >
              <TopPost title={post.title} content={post.content} />
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Carousel;
