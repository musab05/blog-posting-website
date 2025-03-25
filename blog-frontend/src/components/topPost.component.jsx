import ArticleCard from './card.component';

const TopPost = ({ title, user, imgSrc, tag, createdAt }) => {
  return (
    <div className="relative flex justify-center items-center my-4 pb-15">
      <div className="w-full max-w-[1100px] relative">
        {imgSrc ? (
          <img
            className="hidden md:block w-full h-auto rounded-xl object-cover"
            src={imgSrc}
            alt={title}
          />
        ) : (
          <div className="hidden md:block w-full h-[300px] bg-gray-200 rounded-xl animate-pulse"></div>
        )}

        <div className="block md:absolute md:bottom-[-10%] left-6">
          <ArticleCard
            title={title}
            user={user}
            tag={tag}
            createdAt={createdAt}
          />
        </div>
      </div>
    </div>
  );
};

export default TopPost;
