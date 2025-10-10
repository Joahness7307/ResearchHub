import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import AdminSideNavbar from "../Layout/AdminSideNavbar";
import MyAccount from "./MyAccount";

const MyAccountWithSidebar = () => {
  const { user } = useContext(AuthContext);
  const [activeSection, setActiveSection] = React.useState("my-account");

  if (user && user.role === "admin") {
    return (
      <div style={{ display: "flex" }}>
        <AdminSideNavbar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
        <div
          style={{
            marginLeft: 260,
            width: "calc(100% - 260px)",
            minHeight: "100vh",
            padding: "2.5rem 2rem 2rem 2rem",
            background: "#f9f9ff"
          }}
        >
          <MyAccount />
        </div>
      </div>
    );
  }
  // For students, just show the normal MyAccount page
  return <MyAccount />;
};

export default MyAccountWithSidebar;