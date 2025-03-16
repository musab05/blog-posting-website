import PostCard from './postCard.component';
import avatar1 from '../assets/avatar.png';
import avatar2 from '../assets/avatar.png';
import avatar3 from '../assets/avatar.png';
import card1 from '../assets/header.png';
import card2 from '../assets/header.png';
import card3 from '../assets/header.png';
import card4 from '../assets/header.png';
import card5 from '../assets/header.png';
import card6 from '../assets/header.png';
import card7 from '../assets/header.png';
import card8 from '../assets/header.png';
import card9 from '../assets/header.png';

const posts = [
  {
    image: card1,
    category: 'Technology',
    title:
      'The Impact of Technology on the Workplace: How Technology is Changing',
    author: 'Tracey Wilson',
    date: 'August 20, 2022',
    avatar: avatar1,
  },
  {
    image: card2,
    category: 'Technology',
    title:
      'The Impact of Technology on the Workplace: How Technology is Changing',
    author: 'Jason Francisco',
    date: 'August 20, 2022',
    avatar: avatar2,
  },
  {
    image: card3,
    category: 'Technology',
    title:
      'The Impact of Technology on the Workplace: How Technology is Changing',
    author: 'Elizabeth Slavin',
    date: 'August 20, 2022',
    avatar: avatar3,
  },
  {
    image: card4,
    category: 'Technology',
    title:
      'The Impact of Technology on the Workplace: How Technology is Changing',
    author: 'Ernie Smith',
    date: 'August 20, 2022',
    avatar: avatar1,
  },
  {
    image: card5,
    category: 'Technology',
    title:
      'The Impact of Technology on the Workplace: How Technology is Changing',
    author: 'Eric Smith',
    date: 'August 20, 2022',
    avatar: avatar2,
  },
  {
    image: card6,
    category: 'Technology',
    title:
      'The Impact of Technology on the Workplace: How Technology is Changing',
    author: 'Tracey Wilson',
    date: 'August 20, 2022',
    avatar: avatar3,
  },
  {
    image: card7,
    category: 'Technology',
    title:
      'The Impact of Technology on the Workplace: How Technology is Changing',
    author: 'Jason Francisco',
    date: 'August 20, 2022',
    avatar: avatar1,
  },
  {
    image: card8,
    category: 'Technology',
    title:
      'The Impact of Technology on the Workplace: How Technology is Changing',
    author: 'Elizabeth Slavin',
    date: 'August 20, 2022',
    avatar: avatar2,
  },
  {
    image: card9,
    category: 'Technology',
    title:
      'The Impact of Technology on the Workplace: How Technology is Changing',
    author: 'Ernie Smith',
    date: 'August 20, 2022',
    avatar: avatar3,
  },
];

const PostCards = () => {
  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-6">Latest Post</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <PostCard key={index} {...post} />
        ))}
      </div>
      <div className="flex justify-center mt-6">
        <button className="border px-6 py-2 rounded-md hover:bg-gray-100">
          View All Post
        </button>
      </div>
    </div>
  );
};

export default PostCards;
