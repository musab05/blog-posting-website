import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function PostCard({
  image,
  category,
  title,
  author,
  date,
  avatar,
}) {
  return (
    <Card className="w-full shadow-md rounded-xl overflow-hidden border">
      <img className="w-full h-48 object-cover" src={image} alt="card img" />
      <CardContent>
        <Badge className="bg-blue-600 text-white px-3 py-1 rounded-md">
          {category}
        </Badge>
        <h2 className="text-base font-semibold mt-3 leading-tight">{title}</h2>
        <div className="flex items-center mt-4 text-gray-600 text-sm">
          <Avatar className="w-8 h-8 mr-2">
            <AvatarImage src={avatar} alt={author} />
            <AvatarFallback>
              {author.split(' ')[0][0]}
              {author.split(' ')[1][0]}
            </AvatarFallback>
          </Avatar>
          <span>{author}</span>
          <span className="mx-2">•</span>
          <span>{date}</span>
        </div>
      </CardContent>
    </Card>
  );
}
