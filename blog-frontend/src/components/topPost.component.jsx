import HeaderImg from '../assets/header.png';
import ArticleCard from './card.component';

const TopPost = () => {
  return (
    <div className="relative flex justify-center items-center my-4 pb-15">
      <div className="w-full max-w-[1212px] relative">
        <img
          className="hidden md:block w-full h-auto rounded-xl object-cover"
          src={HeaderImg}
          alt="header img"
        />

        <div className="block md:absolute md:bottom-[-10%] left-6">
          <ArticleCard />
        </div>
      </div>
    </div>
  );
};

export default TopPost;
