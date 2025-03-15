import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';

export default function ArticleCard() {
  return (
    <Card className="w-full max-w-md mx-auto p-4 shadow-lg rounded-2xl border">
      <CardContent>
        <Badge className="bg-blue-600 text-white px-3 py-1 rounded-md">
          Technology
        </Badge>
        <h2 className="text-xl font-semibold mt-3">
          The Impact of Technology on the Workplace: How Technology is Changing
        </h2>
        <div className="flex items-center mt-4 text-gray-600 text-sm">
          <Avatar className="w-8 h-8 mr-2" />
          <span>Jason Francisco</span>
          <span className="mx-2">•</span>
          <span>August 20, 2022</span>
        </div>
      </CardContent>
    </Card>
  );
}
