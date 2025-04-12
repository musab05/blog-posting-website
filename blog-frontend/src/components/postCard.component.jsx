import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function PostCard({ banner, tags, title, author, createdAt }) {
  return (
    <Card className="w-full shadow-md rounded-xl overflow-hidden border">
      <img className="w-full h-48 object-cover" src={banner} alt="card img" />
      <CardContent>
        <Badge className="bg-blue-600 text-white px-3 py-1 rounded-md">
          {tags && tags.length > 0
            ? tags[Math.floor(Math.random() * tags.length)]
            : 'General'}
        </Badge>
        <h2 className="text-base font-semibold mt-3 leading-tight">{title}</h2>
        <div className="flex items-center mt-4 text-gray-600 text-sm">
          <Avatar className="w-8 h-8 mr-2">
            <AvatarImage src={author.profileUrl} alt={author.profileUrl} />
            <AvatarFallback>
              {author.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span>{author.username}</span>
          <span className="mx-2">•</span>
          <span>
            {new Date(createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
