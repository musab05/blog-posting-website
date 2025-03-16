import Carousel from '../components/carousel.component';
import PostCards from '../components/post.component';

const HomePage = () => {
  return (
    <div className="w-full p-0 m-0">
      <Carousel />
      <PostCards />
    </div>
  );
};

export default HomePage;
