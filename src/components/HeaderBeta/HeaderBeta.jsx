import React, { useState, useMemo, useCallback, memo } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import Link from "next/link";
import { Avatar, Drawer, Popover, Space } from "antd";
import Icon from "../Icon";
import "./HeaderBeta.scss";

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
 * Signup popover content component
 * Displays signup options for different user types
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onNavigate - Navigation handler function
 * @returns {JSX.Element} Signup popover content
 */
const SignupPopoverContent = memo(({ onNavigate }) => {
  const signupOptions = [
    {
      icon: "bi bi-person-badge-fill",
      title: "Browse Listing",
      description: "Explore companies, experts, Jobs and much more.",
      route: `${ROUTES?.PUBLIC?.SIGNUP}?for=user`,
    },
    {
      icon: "bi bi-person-lines-fill",
      title: "Create expert profile",
      description: "Showcase your expertise and get discovered.",
      route: `${ROUTES?.PUBLIC?.SIGNUP}?for=expert`,
    },
    {
      icon: "bi bi-building-fill-check",
      title: "List my company",
      description: "Subscribe and get listed your company",
      route: `${ROUTES?.PUBLIC?.SIGNUP}?for=company`,
    },
  ];

  return (
    <div className="signupPopover text-center">
      <span className="C-heading size-6 text-center semiBold color-light mb-3">
        Sign up to access more features.
      </span>
      <div className="row g-2 mb-4">
        {signupOptions.map((option, index) => (
          <div className="col" key={index}>
            <div
              className="signupCard p-2 h-100 text-center rounded-3"
              role="button"
              onClick={() => onNavigate(option.route)}
            >
              <div className="profile rounded-circle">
                <i className={option.icon}></i>
              </div>
              <span className="C-heading size-6 extraBold mb-2 color-white">
                {option.title}
              </span>
              <span className="C-heading size-xs color-light mb-0 color-white">
                {option.description}
              </span>
            </div>
          </div>
        ))}
      </div>
      <Link href={ROUTES.PUBLIC.LOGIN} className="C-button is-link mb-1 p-0">
        <Space>
          <Icon name="login" />
          Login to access your account
        </Space>
      </Link>
    </div>
  );
});

SignupPopoverContent.displayName = "SignupPopoverContent";

/**
 * User settings dropdown component
 * Displays user profile information and action buttons
 * @component
 * @param {Object} props - Component props
 * @param {string} props.userName - User's display name
 * @param {string} props.userRole - User's role/title
 * @returns {JSX.Element} User settings dropdown content
 */
const UserSettingsDropdown = memo(
  ({ userName = "Sudhir Deolalikar", userRole = "Marine Engineer Expert" }) => {
    const userActions = [
      { icon: "dashboard", label: "Dashboard", className: "text-secondary" },
      { icon: "settings", label: "Settings" },
      { icon: "logout", label: "Logout" },
    ];

    return (
      <div
        className="d-flex flex-column align-items-center"
        style={{ width: "220px" }}
      >
        <Avatar
          style={{ backgroundColor: "#1677ff", verticalAlign: "middle" }}
          size={36}
          className="mb-1"
        >
          {userName.charAt(0)}
        </Avatar>
        <span className="C-heading size-6 bold color-dark mb-0">
          {userName}
        </span>
        <span className="C-heading size-xs color-light semiBold mb-2">
          {userRole}
        </span>
        <div className="border-top w-100">
          {userActions.map((action, index) => (
            <button
              key={index}
              className={`C-button is-link p-0 py-2 small w-100 text-left ${
                action.className || ""
              }`}
            >
              <Space>
                <Icon name={action.icon} />
                <span>{action.label}</span>
              </Space>
            </button>
          ))}
        </div>
      </div>
    );
  }
);

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
  const [open, setOpen] = useState(false);

  // Memoized navigation handler to prevent unnecessary re-renders
  const handleNavigation = useCallback(
    (route) => {
      router.push(route);
    },
    [router]
  );

  // Memoized drawer toggle handlers
  const handleDrawerOpen = useCallback(() => {
    setOpen(true);
  }, []);

  const handleDrawerClose = useCallback(() => {
    setOpen(false);
  }, []);

  // Memoized signup popover content to prevent recreation on every render
  const signupPopoverContent = useMemo(
    () => <SignupPopoverContent onNavigate={handleNavigation} />,
    [handleNavigation]
  );

  // Memoized user settings dropdown content
  const userSettingsContent = useMemo(() => <UserSettingsDropdown />, []);

  // Memoized navigation items to prevent recreation
  const navigationItems = useMemo(
    () =>
      navItems.map(({ label, href }) => (
        <li className="d-block" key={label}>
          <Link
            href={href}
            className={`navLink ${pathname === href ? "active" : ""}`}
          >
            {label}
          </Link>
        </li>
      )),
    [pathname]
  );

  /**
   * Renders the main navigation menu bar
   * Optimized with memoized components and callbacks
   * @returns {JSX.Element} Navigation menu items
   */
  const renderMenuBar = useCallback(
    () => (
      <>
        {navigationItems}

        {/* Login/Signup Popover */}
        <li>
          <Popover content={signupPopoverContent} placement="bottomRight">
            <button className="navLink is-clean">
              <Space size={2}>
                Login / Sign up
                <Icon name="arrow_drop_down" className="color-primary" />
              </Space>
            </button>
          </Popover>
        </li>

        {/* User Account Dropdown */}
        <li>
          <Popover content={userSettingsContent} placement="bottomRight">
            <button className="userAccount rounded-pill text-left p-1">
              <Avatar
                style={{ backgroundColor: "#1677ff", verticalAlign: "middle" }}
                size={36}
              >
                S
              </Avatar>
            </button>
          </Popover>
        </li>
      </>
    ),
    [navigationItems, signupPopoverContent, userSettingsContent]
  );

  return (
    <>
      {/* Main Header */}
      <header className="c-headerBeta">
        <div className="container">
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
                <Image
                  src="/assets/images/logo.png"
                  alt="Nipunah Logo"
                  width={164}
                  height={50}
                  priority // Optimize logo loading
                />
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
