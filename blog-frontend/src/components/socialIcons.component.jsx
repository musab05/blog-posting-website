// components/SocialIcons.jsx
import { Link } from 'react-router-dom';

// components/SocialIcons.jsx
import { FaTwitter, FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa';

const SocialIcons = ({ socialLinks }) => {
  if (!socialLinks) return null;

  const socialPlatforms = [
    {
      name: 'twitter',
      icon: <FaTwitter className="w-5 h-5" />,
      baseUrl: 'https://twitter.com/',
    },
    {
      name: 'instagram',
      icon: <FaInstagram className="w-5 h-5" />,
      baseUrl: 'https://instagram.com/',
    },
    {
      name: 'linkedin',
      icon: <FaLinkedin className="w-5 h-5" />,
      baseUrl: 'https://linkedin.com/in/',
    },
    {
      name: 'github',
      icon: <FaGithub className="w-5 h-5" />,
      baseUrl: 'https://github.com/',
    },
  ];

  return (
    <div className="flex gap-4 mt-3">
      {socialPlatforms.map(platform => {
        const url = socialLinks[platform.name];
        if (!url) return null;

        return (
          <a
            key={platform.name}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-primary transition-colors"
            title={`View on ${platform.name}`}
          >
            {platform.icon}
          </a>
        );
      })}
    </div>
  );
};


export default SocialIcons;
