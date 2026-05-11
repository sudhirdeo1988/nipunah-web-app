import React, { useState, useMemo, useCallback, memo } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import { Avatar, Drawer, Popover, Space } from "antd";
import Icon from "../Icon";
import { useAuth } from "@/utilities/AuthContext";
import { useLogout } from "@/hooks/useLogout";
import { useRole } from "@/hooks/useRole";
import { useAppSelector } from "@/store/hooks";
import "./HeaderBeta.scss";

/**
 * Derive display fields for header / profile popover from Redux user object.
 * Row 1: First name + Last name · Row 2: Role · Row 3: Email
 * Avatar initial: first letter of first name only.
 */
function getHeaderUserDisplay(user) {
  const empty = {
    line1: "User",
    roleLabel: "Member",
    email: "",
    initials: "U",
    avatarUrl: null,
  };

  if (!user || typeof user !== "object") {
    return empty;
  }

  let firstName =
    user.first_name != null ? String(user.first_name).trim() : "";
  let lastName = user.last_name != null ? String(user.last_name).trim() : "";

  if (!firstName && !lastName && user.name) {
    const parts = String(user.name).trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      firstName = parts[0];
      lastName = parts.slice(1).join(" ");
    } else if (parts.length === 1) {
      firstName = parts[0];
    }
  }

  if (!firstName && !lastName) {
    const company = user.companyName || user.company_name;
    if (company) {
      firstName = String(company).trim();
    } else if (user.username) {
      firstName = String(user.username).trim();
    } else if (user.email) {
      firstName = String(user.email).split("@")[0];
    }
  }

  const line1 =
    [firstName, lastName].filter(Boolean).join(" ").trim() || "User";

  const rawRole = user.role || user.type || user.userType || user.user_type;
  const roleLabel = rawRole
    ? String(rawRole)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : "Member";

  const email = user.email ? String(user.email).trim() : "";

  // Single initial: first character of first name (first name only)
  const initials = firstName ? firstName.charAt(0).toUpperCase() : "U";

  const avatarUrl =
    user.logoUrl ||
    user.logo_url ||
    user.avatar ||
    user.avatarUrl ||
    user.profilePicture ||
    user.profile_image_url ||
    null;

  return {
    line1,
    roleLabel,
    email,
    initials,
    avatarUrl:
      typeof avatarUrl === "string" && avatarUrl.trim()
        ? avatarUrl.trim()
        : null,
  };
}

/**
 * Navigation items configuration for the header
 * @constant {Array<{label: string, href: string}>} navItems
 */
const navItems = [
  { label: "Home", href: ROUTES.PUBLIC.HOME },
  { label: "About Us", href: ROUTES.PUBLIC.ABOUT },
  { label: "Companies", href: ROUTES.PUBLIC.COMPANIES },
  { label: "Equipment", href: ROUTES.PUBLIC.EQUIPMENT },
  { label: "Experts", href: ROUTES.PUBLIC.EXPERTS },
  { label: "Pricing", href: ROUTES.PUBLIC.SUBSCRIPTION },
];

/**
 * Settings submenu items (shown on hover of Settings in profile dropdown).
 * Change password → /app/changepassword; Subscription details → /app/subscription-details.
 */
const SETTINGS_SUBMENU_ITEMS = [
  { label: "Change password", routeKey: "CHANGE_PASSWORD", icon: "lock_reset" },
  { label: "Subscription details", routeKey: "SUBSCRIPTION_DETAILS", icon: "subscriptions" },
];

/**
 * User settings dropdown component.
 * Displays user profile and actions: Profile, Settings (hover submenu: Change password, Subscription details), Logout.
 *
 * Note: the "Subscription details" entry is hidden for the regular `user`
 * role — subscriptions are a company/expert/admin concept only.
 */
const UserSettingsDropdown = memo(({ onClose }) => {
  const router = useRouter();
  const { logout } = useLogout();
  const { isUser } = useRole();
  const user = useAppSelector((state) => state.user.user);
  const { line1, roleLabel, email, initials, avatarUrl } = useMemo(
    () => getHeaderUserDisplay(user),
    [user]
  );

  const visibleSettingsItems = useMemo(() => {
    const hiddenForUser = new Set(isUser() ? ["SUBSCRIPTION_DETAILS"] : []);
    return SETTINGS_SUBMENU_ITEMS.filter(
      (item) => !hiddenForUser.has(item.routeKey)
    );
  }, [isUser]);

  const handleAction = useCallback(
    (route) => {
      onClose?.();
      if (route) router.push(route);
    },
    [onClose, router]
  );

  const handleLogout = useCallback(() => {
    onClose?.();
    logout();
  }, [onClose, logout]);

  const handleSubmenuClick = useCallback(
    (routeKey) => {
      const route = ROUTES.PRIVATE?.[routeKey];
      if (route) handleAction(route);
    },
    [handleAction]
  );

  return (
    <div className="userSettings-dropdown">
      <div className="userSettings-dropdown__profile">
        <Avatar
          src={avatarUrl || undefined}
          style={{ backgroundColor: "#1677ff", verticalAlign: "middle" }}
          size={44}
          className="userSettings-dropdown__avatar"
        >
          {!avatarUrl ? initials : null}
        </Avatar>
        <div className="userSettings-dropdown__info">
          <span className="userSettings-dropdown__name" title={line1}>
            {line1}
          </span>
          <span className="userSettings-dropdown__role" title={roleLabel}>
            {roleLabel}
          </span>
          {email ? (
            <span className="userSettings-dropdown__email" title={email}>
              {email}
            </span>
          ) : null}
        </div>
      </div>
      <div className="userSettings-dropdown__menu userSettings-actions">
          <button
            type="button"
            className="userSettings-dropdown__item C-button is-link"
            onClick={() => handleAction(ROUTES.PRIVATE.PROFILE)}
          >
            <Icon name="person" />
            <span>Profile</span>
          </button>
          <div className="userSettings-settingsWrap">
            <div className="userSettings-settingsTrigger userSettings-dropdown__item">
              <Space size={8}>
                <Icon name="settings" />
                <span>Settings</span>
              </Space>
              <Icon name="chevron_right" className="userSettings-chevron" />
            </div>
            <div className="userSettings-submenu" role="menu">
              {visibleSettingsItems.map((item) => (
                <button
                  key={item.routeKey}
                  type="button"
                  className="userSettings-dropdown__subitem C-button is-link"
                  onClick={() => handleSubmenuClick(item.routeKey)}
                  role="menuitem"
                >
                  <Icon name={item.icon} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="userSettings-dropdown__divider" />
          <button
            type="button"
            className="userSettings-dropdown__item userSettings-dropdown__item--logout C-button is-link"
            onClick={handleLogout}
          >
            <Icon name="logout" />
            <span>Logout</span>
          </button>
      </div>
    </div>
  );
});

UserSettingsDropdown.displayName = "UserSettingsDropdown";

/**
 * HeaderBeta Component
 *
 * A responsive header component with navigation, user authentication, and mobile menu.
 * Features performance optimizations including memoization and component extraction.
 *
 * @component
 * @returns {JSX.Element} The header component
 */
const HeaderBeta = memo(() => {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const user = useAppSelector((state) => state.user.user);
  const { initials: headerInitials, avatarUrl: headerAvatarUrl } = useMemo(
    () => getHeaderUserDisplay(user),
    [user]
  );
  const [open, setOpen] = useState(false);
  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false);

  // Memoized drawer toggle handlers
  const handleDrawerOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setOpen(false);
  }, []);

  const closeProfilePopover = useCallback(() => {
    setProfilePopoverOpen(false);
  }, []);

  // Popover content reads Redux inside UserSettingsDropdown; pass stable onClose only
  const userSettingsContent = useMemo(
    () => <UserSettingsDropdown onClose={closeProfilePopover} />,
    [closeProfilePopover]
  );

  // Memoized navigation items to prevent recreation
  const navigationItems = useMemo(() => {
    const items = isLoggedIn
      ? [...navItems, { label: "Dashboard", href: ROUTES.PRIVATE.DASHBOARD }]
      : navItems;
    return items.map(({ label, href }) => (
        <li className="d-block" key={label}>
          <Link
            href={href}
            className={`navLink ${pathname === href ? "active" : ""}`}
          >
            {label}
          </Link>
        </li>
      ));
  }, [pathname, isLoggedIn]);

  /**
   * Renders the main navigation menu bar
   * Optimized with memoized components and callbacks
   * @returns {JSX.Element} Navigation menu items
   */
  const renderMenuBar = useCallback(
    () => (
      <>
        {navigationItems}

        {/* Login/Signup Popover - Only show if user is not logged in */}
        {!isLoggedIn && (
          <li>
            <button
              className="C-button is-bordered"
              onClick={() => router.push(ROUTES.PUBLIC.LOGIN)}
            >
              Login
            </button>
          </li>
        )}

        {/* User Account Dropdown - Only show if user is logged in */}
        {isLoggedIn && (
          <li>
            <Popover
              content={userSettingsContent}
              placement="bottomRight"
              open={profilePopoverOpen}
              onOpenChange={setProfilePopoverOpen}
              trigger="click"
              overlayClassName="userSettings-popover"
            >
              <button
                type="button"
                className="userAccount rounded-pill text-left p-1"
                aria-label="User menu"
              >
                <Avatar
                  src={headerAvatarUrl || undefined}
                  style={{ backgroundColor: "#1677ff", verticalAlign: "middle" }}
                  size={36}
                >
                  {!headerAvatarUrl ? headerInitials : null}
                </Avatar>
              </button>
            </Popover>
          </li>
        )}
      </>
    ),
    [
      navigationItems,
      userSettingsContent,
      isLoggedIn,
      router,
      profilePopoverOpen,
      headerInitials,
      headerAvatarUrl,
    ]
  );

  const isSecurePage = pathname?.startsWith("/app");
  const containerClass = isSecurePage ? "container-fluid" : "container";

  return (
    <>
      {/* Main Header */}
      <header className="c-headerBeta">
        <div className={containerClass}>
          <div className="row align-items-center">
            {/* Logo and Mobile Menu Button */}
            <div className="col-xl-3 col-md-4 col-sm-12">
              <Space>
                <button
                  className="C-settingButton is-clean d-sm-block d-md-none"
                  onClick={handleDrawerOpen}
                  aria-label="Open mobile menu"
                >
                  <Icon name="menu" />
                </button>
                <button
                  className="C-button is-clean p-0 border-0 d-flex align-items-center"
                  onClick={() => router.push(ROUTES.PUBLIC.HOME)}
                >
                  <Image
                    src="/assets/images/logo.png"
                    alt="Nipunah Logo"
                    width={164}
                    height={50}
                    priority // Optimize logo loading
                  />
                </button>
              </Space>
            </div>

            {/* Desktop Navigation */}
            <div className="col-xl-9 col-md-8 d-none d-md-block text-right">
              <nav
                className="headerNav"
                role="navigation"
                aria-label="Main navigation"
              >
                <ul className="gap-2 mb-0 align-items-center d-none d-sm-none d-md-flex justify-content-end">
                  {renderMenuBar()}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <Drawer
        title="Menu"
        placement="left"
        onClose={handleDrawerClose}
        open={open}
        key="left"
        closable
        className="mobile-menu-drawer"
      >
        <nav
          className="nav-links forMobile"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <ul className="d-flex d-sm-flex d-md-none gap-4 mb-0 flex-column">
            {renderMenuBar()}
          </ul>
        </nav>
      </Drawer>
    </>
  );
});

// Set display name for debugging
HeaderBeta.displayName = "HeaderBeta";

export default HeaderBeta;
