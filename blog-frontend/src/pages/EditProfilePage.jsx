import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../AuthProvider';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

// Form validation schema
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  isPrivate: z.boolean(),
  socialLinks: z
    .object({
      twitter: z.string().url('Invalid URL').or(z.literal('')).optional(),
      instagram: z.string().url('Invalid URL').or(z.literal('')).optional(),
      linkedin: z.string().url('Invalid URL').or(z.literal('')).optional(),
      github: z.string().url('Invalid URL').or(z.literal('')).optional(),
    })
    .optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const EditProfilePage = () => {
  const { user: currentUser, login, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileImage, setProfileImage] = useState(
    currentUser?.profileUrl || ''
  );
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    control, // Add this
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser?.name || '',
      username: currentUser?.username || '',
      bio: currentUser?.bio || '',
      isPrivate: currentUser?.isPrivate || false,
      socialLinks: currentUser?.socialLinks || {},
    },
  });

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          import.meta.env.VITE_SERVER_DOMAIN + '/profile/me'
        );
        setProfileData(response.data);
        setProfileImage(response.data.profileUrl);
      } catch (error) {
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser?.id) {
      fetchUserData();
    }
  }, [currentUser]);

  useEffect(() => {
    if (profileData) {
      resetProfile({
        name: profileData.name,
        username: profileData.username,
        bio: profileData.bio || '',
        isPrivate: profileData.isPrivate || false,
        socialLinks: profileData.socialLinks || {},
      });
      setProfileImage(profileData.profileUrl);
    }
  }, [profileData, resetProfile]);

  const handleImageUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(
        import.meta.env.VITE_SERVER_DOMAIN + '/api/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setProfileImage(response.data.url);
      toast.success('Profile image updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload profile image');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitProfile = async data => {
    try {
      console.log('Profile data:', data);
      setIsLoading(true);
      const response = await axios.put(
        import.meta.env.VITE_SERVER_DOMAIN + '/profile',
        {
          ...data,
          profileUrl: profileImage,
        }
      );

      // Update auth context with new user data
      login(response.data.token, response.data.user);
      toast.success('Profile updated successfully');
      navigate(`/profile/${response.data.user.username}`);
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitPassword = async data => {
    try {
      setIsLoading(true);
      await axios.put(
        import.meta.env.VITE_SERVER_DOMAIN + '/profile/password',
        {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }
      );

      toast.success('Password changed successfully');
      setIsPasswordModalOpen(false);
      resetPassword();
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to change password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || !currentUser) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleProfileSubmit(onSubmitProfile)}
            className="space-y-6"
          >
            {/* Profile Image */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profileImage} alt="Profile" />
                <AvatarFallback>{currentUser.username}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-center gap-2">
                <Label htmlFor="profileImage" className="cursor-pointer">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() =>
                      document.getElementById('profileImage').click()
                    }
                  >
                    Change Profile Image
                  </Button>
                  <Input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isLoading}
                  />
                </Label>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  {...registerProfile('name')}
                  placeholder="Your name"
                  disabled={isLoading}
                />
                {profileErrors.name && (
                  <p className="text-sm text-red-500">
                    {profileErrors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  {...registerProfile('username')}
                  placeholder="Your username"
                  disabled={isLoading}
                />
                {profileErrors.username && (
                  <p className="text-sm text-red-500">
                    {profileErrors.username.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  {...registerProfile('bio')}
                  placeholder="Tell us about yourself"
                  disabled={isLoading}
                  rows={3}
                />
                {profileErrors.bio && (
                  <p className="text-sm text-red-500">
                    {profileErrors.bio.message}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Controller
                  name="isPrivate"
                  control={control} // Add this to your useForm destructuring
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  )}
                />
                <Label htmlFor="isPrivate">Private Account</Label>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="font-medium">Social Links</h3>

              <div>
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  {...registerProfile('socialLinks.twitter')}
                  placeholder="https://twitter.com/username"
                  disabled={isLoading}
                />
                {profileErrors.socialLinks?.twitter && (
                  <p className="text-sm text-red-500">
                    {profileErrors.socialLinks.twitter.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  {...registerProfile('socialLinks.instagram')}
                  placeholder="https://instagram.com/username"
                  disabled={isLoading}
                />
                {profileErrors.socialLinks?.instagram && (
                  <p className="text-sm text-red-500">
                    {profileErrors.socialLinks.instagram.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  {...registerProfile('socialLinks.linkedin')}
                  placeholder="https://linkedin.com/in/username"
                  disabled={isLoading}
                />
                {profileErrors.socialLinks?.linkedin && (
                  <p className="text-sm text-red-500">
                    {profileErrors.socialLinks.linkedin.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="github">GitHub</Label>
                <Input
                  id="github"
                  {...registerProfile('socialLinks.github')}
                  placeholder="https://github.com/username"
                  disabled={isLoading}
                />
                {profileErrors.socialLinks?.github && (
                  <p className="text-sm text-red-500">
                    {profileErrors.socialLinks.github.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPasswordModalOpen(true)}
                disabled={isLoading}
              >
                Change Password
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Password Change Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handlePasswordSubmit(onSubmitPassword)}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...registerPassword('currentPassword')}
                    disabled={isLoading}
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-sm text-red-500">
                      {passwordErrors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...registerPassword('newPassword')}
                    disabled={isLoading}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-red-500">
                      {passwordErrors.newPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...registerPassword('confirmPassword')}
                    disabled={isLoading}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {passwordErrors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsPasswordModalOpen(false);
                      resetPassword();
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Changing...' : 'Change Password'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EditProfilePage;
