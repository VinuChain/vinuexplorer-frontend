import { Flex } from '@chakra-ui/react';
import React from 'react';

import type { TokenSocials } from 'types/api/token';
import type { IconName } from 'public/icons/name';

import { Link } from 'toolkit/chakra/link';
import { Tooltip } from 'toolkit/chakra/tooltip';
import IconSvg from 'ui/shared/IconSvg';

interface Props {
  socials: TokenSocials | null | undefined;
}

type SocialEntry = {
  key: keyof TokenSocials;
  label: string;
} & (
  | { icon: IconName }
  | { icon: null }
);

const SOCIAL_CONFIG: Array<SocialEntry> = [
  { key: 'website', label: 'Website', icon: 'globe' },
  { key: 'twitter', label: 'X (Twitter)', icon: 'social/twitter_filled' },
  { key: 'telegram', label: 'Telegram', icon: 'social/telegram_filled' },
  { key: 'discord', label: 'Discord', icon: 'social/discord_filled' },
  { key: 'github', label: 'GitHub', icon: 'social/github_filled' },
  { key: 'medium', label: 'Medium', icon: 'social/medium_filled' },
  { key: 'linkedin', label: 'LinkedIn', icon: 'social/linkedin_filled' },
  { key: 'facebook', label: 'Facebook', icon: 'social/facebook_filled' },
  { key: 'reddit', label: 'Reddit', icon: 'social/reddit_filled' },
  { key: 'coinmarketcap', label: 'CoinMarketCap', icon: 'social/coinmarketcap' },
];

const TokenSocialLinks = ({ socials }: Props) => {
  if (!socials) {
    return null;
  }

  const items = SOCIAL_CONFIG.filter(({ key }) => Boolean(socials[key]));

  if (items.length === 0) {
    return null;
  }

  return (
    <Flex columnGap={ 2 } alignItems="center">
      { items.map(({ key, label, icon }) => {
        const href = socials[key] as string;

        if (icon === null) {
          return (
            <Link key={ key } external href={ href } noIcon textStyle="sm" flexShrink={ 0 }>
              { label }
            </Link>
          );
        }

        return (
          <Tooltip key={ key } content={ label }>
            <Link external href={ href } noIcon display="flex" alignItems="center" flexShrink={ 0 } color="icon.secondary" _hover={{ color: 'link.primary' }}>
              <IconSvg name={ icon } boxSize={ 5 }/>
            </Link>
          </Tooltip>
        );
      }) }
    </Flex>
  );
};

export default React.memo(TokenSocialLinks);
