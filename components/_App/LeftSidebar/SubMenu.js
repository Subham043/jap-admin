import React, { useState, useEffect } from "react";
import { styled } from "@mui/material/styles";
import Link from "next/link";
import styles from "@/components/_App/LeftSidebar/SubMenu.module.css";
import { useRouter } from "next/router";

const SidebarLabel = styled("span")(({ theme }) => ({
  position: "relative",
  top: "-3px",
}));

const SubMenu = ({ item }) => {
  const [subnav, setSubnav] = useState(false);
  const showSubnav = () => setSubnav(!subnav);
  const [currentPath, setCurrentPath] = useState("");
  const router = useRouter();
  // console.log(router.asPath)

  useEffect(() => {
    setCurrentPath(router.asPath);
  }, [router]);

  return (
    <>
      <Link
        href={item.path}
        onClick={
          item.subNav
            ? (e) => {
                e.stopPropagation();
                e.preventDefault();
                showSubnav();
              }
            : undefined
        }
        className={`${styles.sidebarLink} ${
          ((currentPath === "/" &&
            item.path === "/" &&
            currentPath === item.path) ||
            (currentPath !== "/" &&
              item.path !== "/" &&
              currentPath.includes(item.path))) &&
          "sidebarLinkActive"
        }`}
      >
        <div>
          {item.icon}
          <SidebarLabel className="ml-1">{item.title}</SidebarLabel>
        </div>
        <div>
          {item.subNav && subnav
            ? item.iconOpened
            : item.subNav
            ? item.iconClosed
            : null}
        </div>
      </Link>
      {subnav &&
        item.subNav.map((itm, index) => {
          return (
            <Link
              href={itm.path}
              key={index}
              className={`${styles.sidebarLink2} ${
                currentPath.includes(itm.path) && "sidebarLinkActive2"
              }`}
            >
              {itm.icon}
              {itm.title}
            </Link>
          );
        })}
    </>
  );
};

export default SubMenu;
