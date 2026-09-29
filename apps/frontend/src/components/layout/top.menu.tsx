'use client';

import { FC, ReactNode } from 'react';
import {
  Home,
  Calendar,
  Bot,
  MessageSquare,
  TrendingUp,
  Folder,
  Image,
  Megaphone,
  CreditCard,
  Settings,
} from 'lucide-react';
import { useUser } from '@postmill-ai/frontend/components/layout/user.context';
import { useVariables } from '@postmill-ai/react/helpers/variable.context';
import { useT } from '@postmill-ai/react/translation/get.transation.service.client';
import { MenuItem } from '@postmill-ai/frontend/components/new-layout/menu-item';
import { usePermissions } from '@postmill-ai/frontend/components/layout/use-permissions';

interface MenuItemInterface {
  name: string;
  icon: ReactNode;
  path: string;
  hide?: boolean;
  requireBilling?: boolean;
  onClick?: () => void;
}

export const useMenuItem = () => {
  const { isGeneral } = useVariables();
  const t = useT();
  const permissions = usePermissions();

  const firstMenu = [
    {
      name: t('home', 'Home'),
      icon: <Home size={20} strokeWidth={1.5} />,
      path: '/dashboard',
    },
    {
      name: isGeneral ? t('posts', 'Posts') : t('launches', 'Launches'),
      icon: <Calendar size={20} strokeWidth={1.5} />,
      path: '/posts',
    },
    {
      name: t('agent', 'Agent'),
      icon: <Bot size={20} strokeWidth={1.5} />,
      path: '/agents',
    },
    {
      name: t('replies', 'Replies'),
      icon: <MessageSquare size={20} strokeWidth={1.5} />,
      path: '/replies',
    },
    {
      name: t('analytics', 'Analytics'),
      icon: <TrendingUp size={20} strokeWidth={1.5} />,
      path: '/analytics',
    },
    {
      name: t('files', 'Files'),
      icon: <Folder size={20} strokeWidth={1.5} />,
      path: '/files',
      hide:
        permissions.isResolved &&
        !permissions.hasPermission('media', 'read'),
    },
    {
      name: t('media', 'Media'),
      icon: <Image size={20} strokeWidth={1.5} />,
      path: '/media',
      hide:
        permissions.isResolved &&
        !permissions.hasPermission('media', 'read'),
    },
    {
      name: t('campaigns', 'Campaigns'),
      icon: <Megaphone size={20} strokeWidth={1.5} />,
      path: '/campaigns',
    },
  ] satisfies MenuItemInterface[] as MenuItemInterface[];

  const secondMenu = [
    {
      name: t('billing', 'Billing'),
      icon: <CreditCard size={20} strokeWidth={1.5} />,
      path: '/billing',
      requireBilling: true,
      // Owner/admin only (billing:read is seeded to those roles); same
      // optimistic-while-loading pattern as the Settings entry below.
      hide:
        permissions.isResolved &&
        !permissions.hasPermission('billing', 'read'),
    },
    {
      name: t('settings', 'Settings'),
      icon: <Settings size={20} strokeWidth={1.5} />,
      path: '/settings',
      // R5: hidden for members whose role lacks settings:read. Shown
      // optimistically while permissions load (no flash for allowed users);
      // the /settings route guard + backend 403s backstop denied members.
      hide:
        permissions.isResolved &&
        !permissions.hasPermission('settings', 'read'),
    },
  ] satisfies MenuItemInterface[] as MenuItemInterface[];

  firstMenu.sort((a, b) => a.name.localeCompare(b.name));
  const homeIndex = firstMenu.findIndex((item) => item.path === '/dashboard');
  if (homeIndex > 0) {
    const [home] = firstMenu.splice(homeIndex, 1);
    firstMenu.unshift(home);
  }

  return {
    all: [...firstMenu, ...secondMenu],
    firstMenu,
    secondMenu,
  };
};

export const TopMenu: FC = () => {
  const user = useUser();
  const { firstMenu, secondMenu } = useMenuItem();
  const { billingEnabled } = useVariables();
  const t = useT();
  return (
    <>
      <div className="flex flex-1 flex-col minCustom:gap-[16px] blurMe">
        {
          // @ts-ignore
          user?.orgId &&
            firstMenu
              .filter((f) => {
                if (f.hide) {
                  return false;
                }
                if (f.requireBilling && !billingEnabled) {
                  return false;
                }
                return true;
              })
              .map((item, index) => {
                const path =
                  item.name === 'Billing' && user?.isLifetime
                    ? '/billing/lifetime'
                    : item.path;
                const label =
                  item.name === 'Billing' && user?.isLifetime
                    ? t('lifetime', 'Lifetime')
                    : item.name;
                return (
                  <MenuItem
                    path={path}
                    label={label}
                    icon={item.icon}
                    key={item.name}
                    onClick={item.onClick}
                  />
                );
              })
        }

      </div>
      <div className="flex flex-col minCustom:gap-[20px] custom:gap-[8px] blurMe">
        {secondMenu
          .filter((f) => {
            if (f.hide) {
              return false;
            }
            if (f.requireBilling && !billingEnabled) {
              return false;
            }
            return true;
          })
          .map((item, index) => {
            const path =
              item.name === 'Billing' && user?.isLifetime
                ? '/billing/lifetime'
                : item.path;
            const label =
              item.name === 'Billing' && user?.isLifetime
                ? t('lifetime', 'Lifetime')
                : item.name;
            return (
              <MenuItem
                path={path}
                label={label}
                icon={item.icon}
                key={item.name}
                onClick={item.onClick}
              />
            );
          })}
      </div>
    </>
  );
};
