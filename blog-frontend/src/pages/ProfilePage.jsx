import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '../AuthProvider';
import BlogCard from '../components/blogCards.component';
import SocialIcons from '../components/socialIcons.component';

const ProfilePage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: loggedInUser, isLoading: authLoading, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('blogs');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStatus, setFollowStatus] = useState(null);
  const [isPrivateProfile, setIsPrivateProfile] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch profile data
        const profileResponse = await axios.get(
          import.meta.env.VITE_SERVER_DOMAIN + `/profile/${username}`
        );
        const profileData = profileResponse.data;
        setProfile(profileData);
        setIsPrivateProfile(profileData.isPrivate);

        if (loggedInUser && loggedInUser.username !== username) {
          try {
            console.log('Checking follow status for:', profileData, profile);
            const followResponse = await axios.get(
              import.meta.env.VITE_SERVER_DOMAIN + `/profile/follow/status`,
              {
                params: {
                  followingId: profileData.id,
                },
                headers: {
                  Authorization: token,
                },
              }
            );
            setIsFollowing(followResponse.data.isFollowing);
            setFollowStatus(followResponse.data.status);
          } catch (err) {
            console.error('Error checking follow status:', err);
          }
        }

        await fetchTabData(activeTab, profileResponse.data.id);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(err.response?.data?.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    const fetchTabData = async (tab, userId) => {
      try {
        switch (tab) {
          case 'blogs':
            const blogsResponse = await axios.get(
              import.meta.env.VITE_SERVER_DOMAIN + `/profile/${username}/blogs`
            );
            setBlogs(blogsResponse.data);
            break;
          case 'followers':
            const followersResponse = await axios.get(
              import.meta.env.VITE_SERVER_DOMAIN +
                `/profile/${username}/followers`
            );
            setFollowers(followersResponse.data);
            break;
          case 'following':
            const followingResponse = await axios.get(
              import.meta.env.VITE_SERVER_DOMAIN +
                `/profile/${username}/following`
            );
            setFollowing(followingResponse.data);
            break;
          default:
            break;
        }
      } catch (err) {
        console.error(`Error fetching ${tab} data:`, err);
        setError(`Failed to load ${tab} data`);
      }
    };

    fetchProfileData();
  }, [username, authLoading, loggedInUser, activeTab]);

  const handleTabChange = async tab => {
    setActiveTab(tab);
    if (profile) {
      try {
        switch (tab) {
          case 'blogs':
            if (blogs.length === 0) {
              const blogsResponse = await axios.get(
                import.meta.env.VITE_SERVER_DOMAIN +
                  `/profile/${username}/blogs`
              );
              setBlogs(blogsResponse.data);
            }
            break;
          case 'followers':
            if (followers.length === 0) {
              const followersResponse = await axios.get(
                import.meta.env.VITE_SERVER_DOMAIN +
                  `/profile/${username}/followers`
              );
              setFollowers(followersResponse.data);
            }
            break;
          case 'following':
            if (following.length === 0) {
              const followingResponse = await axios.get(
                import.meta.env.VITE_SERVER_DOMAIN +
                  `/profile/${username}/following`
              );
              setFollowing(followingResponse.data);
            }
            break;
          default:
            break;
        }
      } catch (err) {
        console.error(`Error fetching ${tab} data:`, err);
      }
    }
  };

  const handleFollow = async () => {
    if (!loggedInUser) {
      navigate('/signin');
      return;
    }

    try {
      if (isFollowing) {
        // Unfollow or cancel request
        await axios.delete(
          import.meta.env.VITE_SERVER_DOMAIN + `/profile/follow/${profile.id}`,
          {
            headers: {
              Authorization: token,
            },
          }
        );
        setIsFollowing(false);
        setFollowStatus(null);

        // Update followers count
        setProfile(prev => ({
          ...prev,
          followerCount: Math.max(0, prev.followerCount - 1),
        }));

        // Remove from followers list if not private or if was accepted
        if (!isPrivateProfile || followStatus === 'accepted') {
          setFollowers(prev => prev.filter(f => f.id !== loggedInUser.id));
        }
      } else {
        // Follow or send request
        const response = await axios.post(
          import.meta.env.VITE_SERVER_DOMAIN + `/profile/follow/${profile.id}`,
          {},
          {
            headers: {
              Authorization: token,
            },
          }
        );
        setIsFollowing(true);
        setFollowStatus(response.data.status);

        // Update followers count
        setProfile(prev => ({
          ...prev,
          followerCount: prev.followerCount + 1,
        }));

        // Add to followers list if not private or if already accepted
        if (!isPrivateProfile || response.data.status === 'accepted') {
          setFollowers(prev => [
            ...prev,
            {
              id: loggedInUser.id,
              name: loggedInUser.name,
              username: loggedInUser.username,
              profileUrl: loggedInUser.profileUrl,
            },
          ]);
        }
      }
    } catch (err) {
      console.error('Error handling follow:', err);
      setError(err.response?.data?.message || 'Failed to update follow status');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-10">Profile not found</div>;
  }

  const isOwnProfile = loggedInUser?.username === username;

  const shouldShowPrivateContent = () => {
    return (
      isOwnProfile ||
      !isPrivateProfile ||
      (isFollowing && followStatus === 'accepted')
    );
  };

  const getFollowButtonText = () => {
    if (!loggedInUser) return 'Follow';
    if (isOwnProfile) return 'Share Profile';

    if (!isFollowing) {
      return 'Follow';
    } else {
      if (isPrivateProfile) {
        return followStatus === 'pending' ? 'Requested' : 'Following';
      }
      return 'Following';
    }
  };

  const getFollowButtonVariant = () => {
    if (isOwnProfile) return 'outline';
    if (isFollowing) {
      if (isPrivateProfile && followStatus === 'pending') {
        return 'outline';
      }
      return 'default';
    }
    return 'default';
  };

  const isFollowDisabled = () => {
    return (
      isOwnProfile ||
      (isPrivateProfile && isFollowing && followStatus === 'pending')
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <Card className="p-4 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <img
            src={profile.profileUrl}
            alt={`${profile.name}'s profile`}
            className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-primary"
          />
          <div className="text-center md:text-left">
            <h1 className="text-xl md:text-2xl font-bold">{profile.name}</h1>
            <p className="text-gray-600">@{profile.username}</p>
            <p className="mt-2 text-sm text-gray-700">
              {profile.bio || 'No bio yet'}
            </p>
            <SocialIcons socialLinks={profile.socialLinks} />
            <div className="flex gap-2 mt-4 justify-center md:justify-start">
              {isOwnProfile && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/settings/edit-profile')}
                >
                  Edit Profile
                </Button>
              )}
              {!isOwnProfile && (
                <Button
                  variant={getFollowButtonVariant()}
                  size="sm"
                  onClick={handleFollow}
                  disabled={isFollowDisabled()}
                >
                  {getFollowButtonText()}
                </Button>
              )}
              <Button variant="outline" size="sm">
                Share Profile
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-6">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="blogs">Blogs</TabsTrigger>
          <TabsTrigger value="followers">
            Followers ({profile.followerCount || followers.length})
          </TabsTrigger>
          <TabsTrigger value="following">
            Following ({profile.followingCount || following.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blogs" className="mt-4">
          {shouldShowPrivateContent() ? (
            blogs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {isOwnProfile
                    ? 'You have no blogs yet'
                    : 'No blogs posted yet'}
                </p>
                {isOwnProfile && (
                  <Button className="mt-4" onClick={() => navigate('/editor')}>
                    Create Your First Blog
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {blogs.map(blog => (
                  <Link to={`/blogs/${blog.id}`} key={blog.id}>
                    <BlogCard {...blog} />
                  </Link>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                This account is private. Follow to view their blogs.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Followers Tab */}
        <TabsContent value="followers" className="mt-4">
          {shouldShowPrivateContent() ? (
            followers.length === 0 ? (
              <p className="text-center py-8 text-gray-500">
                {isOwnProfile
                  ? 'You have no followers yet'
                  : 'No followers yet'}
              </p>
            ) : (
              <div className="grid gap-3">
                {followers.map(user => (
                  <Link to={`/profile/${user.username}`} key={user.id}>
                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                      <img
                        src={user.profileUrl}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          ) : (
            <p className="text-center py-8 text-gray-500">
              This account is private. Follow to view their followers.
            </p>
          )}
        </TabsContent>

        {/* Following Tab */}
        <TabsContent value="following" className="mt-4">
          {shouldShowPrivateContent() ? (
            following.length === 0 ? (
              <p className="text-center py-8 text-gray-500">
                {isOwnProfile
                  ? "You're not following anyone yet"
                  : 'Not following anyone yet'}
              </p>
            ) : (
              <div className="grid gap-3">
                {following.map(user => (
                  <Link to={`/profile/${user.username}`} key={user.id}>
                    <div className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg">
                      <img
                        src={user.profileUrl}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          ) : (
            <p className="text-center py-8 text-gray-500">
              This account is private. Follow to view who they follow.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
