import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';

export default function ArticleCard({ title, user, tag, createdAt }) {
  return (
    <Card className="w-full max-w-md mx-auto p-4 shadow-lg rounded-2xl border">
      <CardContent>
        <Badge className="bg-blue-600 text-white px-3 py-1 rounded-md">
          {tag}
        </Badge>
        <h2 className="text-xl font-semibold mt-3">{title}</h2>
        <div className="flex items-center mt-4 text-gray-600 text-sm">
          <Avatar className="w-8 h-8 mr-2">
            <AvatarImage src={user?.profileUrl} alt={user?.username} />
            <AvatarFallback>
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span>{user?.username}</span>
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
