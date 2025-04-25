import { useContext, useEffect, useRef, useState } from "react";
import { Button } from "react-bootstrap";
import logo from "../../assets/images/logo.png";
import { Sidebar as MenuBar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { Link } from "react-router-dom";
import {
  MdOutlineClose,
  MdHome,
  MdLogout,
  MdOutlinePermContactCalendar,
} from "react-icons/md";
import { RiTeamFill, RiContactsBookLine, RiFileListLine, RiLockLine } from "react-icons/ri";
import { FiUsers, FiList, FiFileText, FiUploadCloud } from "react-icons/fi";
import {
  AiOutlineAppstoreAdd,
  AiOutlineProject,
} from "react-icons/ai";
import { BsNewspaper, BsBuilding, BsChatSquareQuote } from "react-icons/bs";
import { FaRegNewspaper } from "react-icons/fa";
import "./Sidebar.scss";
import { SidebarContext } from "../../context/SidebarContext";
import { TitleContext } from "../../context/TitleContext";
import { IoIosOptions, IoIosPeople } from "react-icons/io";

import cv from './icons/cv.png'
import gallery from './icons/gallery.png'
import project from './icons/project.png'
import contact from './icons/contact.png'

// Sidebar menu structure
const SidebarMenu = [
  {
    menu: "Home",
    url: "/dashboard",
    mainIcon: <MdHome size={24} />,
    subMenu: [
      {
        subMenus: "Header Contact",
        url: "/headercontact",
        icon: <RiContactsBookLine style={{ color: "black" }} size={24} />,
      },
      {
        subMenus: "Social Contacts",
        url: "/social-contact",
        icon: <RiContactsBookLine style={{ color: "black" }} size={24} />,
      },
      {
        subMenus: "Home Sliding Media",
        url: "/carousal",
        icon: <RiFileListLine style={{ color: "black" }} size={24} />,
      },
      // {
      //   subMenus: "Image Slider",
      //   url: "/homeslider",
      //   icon: <AiOutlineProject style={{ color: "black" }} size={24} />,
      // },
      {
        subMenus: "Testimonial",
        url: "/testimonial",
        icon: <BsChatSquareQuote style={{ color: "black" }} size={24} />,
      },
    ],
  },
  {
    menu: "About",
    url: "/about",
    mainIcon: <RiTeamFill size={24} />,
    subMenu: [
      // {
      //   subMenus: "About",
      //   url: "/about",
      //   icon: <BsBuilding style={{ color: "black" }} size={24} />,
      // },
      // {
      //   subMenus: "Services",
      //   url: "/infrastructure",
      //   icon: <BsBuilding style={{ color: "black" }} size={24} />,
      // },
      // {
      //   subMenus: "Leadership",
      //   url: "/leadership",
      //   icon: <FiUsers style={{ color: "black" }} size={24} />,
      // },
      {
        subMenus: "Our Team",
        url: "/ourteam",
        icon: <FiUsers style={{ color: "black" }} size={24} />,
      },
    ],
  },
  // {
  //   menu: "Product",
  //   url: "/product",
  //   mainIcon: <FiList size={24} />,
  //   subMenu: [
  //     {
  //       subMenus: "Product Details",
  //       url: "/productdetails",
  //       icon: <IoIosOptions style={{ color: "black" }} size={24} />,
  //     },
  //     {
  //       subMenus: "Product Images",
  //       url: "/productimages",
  //       icon: <IoIosOptions style={{ color: "black" }} size={24} />,
  //     },
  //     {
  //       subMenus: "Models",
  //       url: "/technicaldata",
  //       icon: <FiFileText style={{ color: "black" }} size={24} />,
  //     },
  //     {
  //       subMenus: "Accessories & Optional",
  //       url: "/optionsdata",
  //       icon: <IoIosOptions style={{ color: "black" }} size={24} />,
  //     },
  //     // {
  //     //   subMenus: "Material Data",
  //     //   url: "/materialdata",
  //     //   icon: <RiFileListLine style={{ color: "black" }} size={24} />,
  //     // },
  //     {
  //       subMenus: "Application Data",
  //       url: "/applicationdata",
  //       icon: <RiFileListLine style={{ color: "black" }} size={24} />,
  //     },
  //   ],
  // },
  // {
  //   menu: "Blog",
  //   url: "/blog",
  //   mainIcon: <FaRegNewspaper size={24} />,
  //   subMenu: [
  //     {
  //       subMenus: "Blog Details",
  //       url: "/blogdetails",
  //       icon: <FaRegNewspaper style={{ color: "black" }} size={24} />,
  //     },
  //   ],
  // },
  
  // {
  //   menu: "News and Event",
  //   url: "/newsandevent",
  //   mainIcon: <BsNewspaper size={24} />,
  //   subMenu: [
  //     {
  //       subMenus: "News",
  //       url: "/news",
  //       icon: <BsNewspaper style={{ color: "black" }} size={24} />,
  //     },
  //     {
  //       subMenus: "Events",
  //       url: "/events",
  //       icon: <BsNewspaper style={{ color: "black" }} size={24} />,
  //     },
  //   ],
  // },
  // {
  //   menu: "Contact Us",
  //   url: "/contactus",
  //   mainIcon: <MdOutlinePermContactCalendar size={24} />,
  //   subMenu: [
  //     {
  //       subMenus: "Contact Sales Person",
  //       url: "/contactsalesperson",
  //       icon: <AiOutlineAppstoreAdd style={{ color: "black" }} size={24} />,
  //     },
  //     {
  //       subMenus: "Our Offices",
  //       url: "/office",
  //       icon: <BsBuilding style={{ color: "black" }} size={24} />,
  //     },
  //   ],
  // },
  // {
  //   menu: "Contact Person Details",
  //   url: "/contactus",
  //   mainIcon: <MdOutlinePermContactCalendar size={24} />,
  //   subMenu: [
  //     {
  //       subMenus: "User Data List",
  //       url: "/carousalform",
  //       icon: <RiFileListLine style={{ color: "black" }} size={24} />,
  //     },
  //     {
  //       subMenus: "Cv List",
  //       url: "/uploadcv",
  //       icon: <FiUploadCloud style={{ color: "black" }} size={24} />,
  //     },
  //     {
  //       subMenus: "Subscriber List",
  //       url: "/subscribe",
  //       icon: <RiContactsBookLine style={{ color: "black" }} size={24} />,
  //     },
  //   ],
  // },
  // New Option

  {
    menu: "Project Master",
    url: "/projectmaster",
    // mainIcon: <RiTeamFill size={24} />,
    mainIcon: <img src={project} alt="upload-icon" style={{ color: "black" }} className="img-fluid" size={24} />,
    subMenu: [
      {
        subMenus: "Project Category Master",
        url: "/category",
        icon: <RiFileListLine style={{ color: "black" }} size={24} />,
      },
      // {
      //   subMenus: "Project Master",
      //   url: "/projectName",
      //   icon: <RiFileListLine style={{ color: "black" }} size={24} />,
      // },
      {
        subMenus: "Project Details Master",
        url: "/projectDetails",
        icon: <RiFileListLine style={{ color: "black" }} size={24} />,
      },
      {
        subMenus: "Project Images Master",
        url: "/projectDetailsWithImages",
        // icon: <RiFileListLine style={{ color: "black" }} size={24} />,
        icon: <img src={gallery} alt="upload-icon" style={{ color: "black" }} className="img-fluid" size={24} />,
      },

    ],
  },

  {
    menu: "Gallery Master",
    url: "/gallerymaster",
    // mainIcon: <RiTeamFill size={24} />,
    mainIcon: <img src={gallery} alt="upload-icon" style={{ color: "black" }} className="img-fluid" size={24} />,
    subMenu: [
      {
        subMenus: "Gallery Category Master",
        url: "/galleryDetails",
        icon: <RiFileListLine style={{ color: "black" }} size={24} />,
      },
      {
        subMenus: "Gallery Images Master",
        url: "/galleryDetailsWithImages",
        // icon: <RiFileListLine style={{ color: "black" }} size={24} />,
        icon: <img src={gallery} alt="upload-icon" style={{ color: "black" }} className="img-fluid" size={24} />,
      },
    ],
  },


  {
    menu: "Cv List",
    url: "/uploadcv",
    // mainIcon: <FiUploadCloud style={{ color: "black" }} size={24} />,
    mainIcon: <img src={cv} alt="upload-icon" style={{ color: "black" }} className="img-fluid" size={24} />,
    subMenu: [],
  },
  {
    menu: "Contact Us",
    url: "/carousalform",
    // mainIcon: <RiFileListLine style={{ color: "black" }} size={24} />,
    mainIcon: <img src={contact} alt="upload-icon" style={{ color: "black" }} className="img-fluid" size={24} />,
    subMenu: [],
  },
  {
    menu: "Change Password",
    url: "/changepassword",
    mainIcon: <RiLockLine style={{ color: "black" }} size={24} />,
    subMenu: [],
  },
  {
    menu: "Logout",
    url: "/logout",
    mainIcon: <MdLogout size={24} />,
    subMenu: [],
  },
];

// Sidebar Component
const Sidebar = () => {
  const { isSidebarOpen, closeSidebar } = useContext(SidebarContext);
  const navbarRef = useRef(null);
  const { setTitle } = useContext(TitleContext);
  const [activeMenu, setActiveMenu] = useState("");
  const [activeSubMenu, setActiveSubMenu] = useState("");

  // Close sidebar on clicking outside
  const handleClickOutside = (event) => {
    if (
      navbarRef.current &&
      !navbarRef.current.contains(event.target) &&
      event.target.className !== "sidebar-open-btn"
    ) {
      closeSidebar();
    }
  };

  // Close sidebar on window resize
  const handleResize = () => {
    if (window.innerWidth <= 1200) {
      closeSidebar();
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Handle main menu click
  const handleMenuClick = (menu) => {
    setActiveMenu(activeMenu === menu ? "" : menu); // Toggle active menu
    setActiveSubMenu(""); // Close any open sub menu when a main menu is clicked
    setTitle(menu); // Set the title context
  };

  // Handle sub menu click
  const handleSubMenuClick = (subMenu) => {
    setActiveSubMenu(subMenu); // Set active sub menu
  };

  return (
    <nav ref={navbarRef} className={`sidebar ${isSidebarOpen ? "sidebar-show" : ""}`}>
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <img className="w-25" src={logo} alt="Logo" />
          <span className="sidebar-brand-text">
            VAD Architects
          </span>
        </div>
        <Button
          variant="outline-danger"
          className="sidebar-close-btn"
          onClick={closeSidebar}
        >
          <MdOutlineClose size={24} />
        </Button>
      </div>
      <div className="sidebar-body">
        <div className="sidebar-menu">
          <MenuBar>
            <Menu>
              {SidebarMenu.map((item, id) => (
                <div key={id}>
                  {item.subMenu.length > 0 ? (
                    <SubMenu
                      className={`menu-link-text bg-white ${
                        activeMenu === item.menu ? "active" : ""
                      }`}
                      icon={item.mainIcon}
                      label={item.menu}
                      open={activeMenu === item.menu}
                      onClick={() => handleMenuClick(item.menu)}
                    >
                      {item.subMenu.map((subItem, subId) => (
                        <MenuItem
                          key={subId}
                          component={<Link to={subItem.url} />}
                          icon={subItem.icon}
                          className={`menu-link-text bg-white ${
                            activeSubMenu === subItem.subMenus ? "active" : ""
                          }`}
                          onClick={() => handleSubMenuClick(subItem.subMenus)}
                        >
                          {subItem.subMenus}
                        </MenuItem>
                      ))}
                    </SubMenu>
                  ) : (
                    <MenuItem
                      icon={item.mainIcon}
                      className={`menu-link-text bg-white ${
                        activeMenu === item.menu ? "active" : ""
                      }`}
                      onClick={() => {
                        handleMenuClick(item.menu);
                        closeSidebar(); // Close sidebar on menu item click
                      }}
                      component={<Link to={item.url} />}
                    >
                      {item.menu}
                    </MenuItem>
                  )}
                </div>
              ))}
            </Menu>
          </MenuBar>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;