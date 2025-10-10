import React, { useState } from "react";
import HeadAdminLayout from "../Layout/HeadAdminLayout";
import MyAccount from ".././Dashboard/MyAccount";
import HeadAdminDashboard from ".././Dashboard/HeadAdminDashboard";
import NotificationPage from ".././Dashboard/NotificationPage";

const MyAccountWithHeadAdminSidebar = () => {
  const [selectedCard, setSelectedCard] = useState("my-account");
  const handleNavClick = (section) => setSelectedCard(section);

  // Render main content based on selectedCard
  let mainContent;
  if (selectedCard === "dashboard") mainContent = <HeadAdminDashboard />;
  else if (selectedCard === "pending") mainContent = <HeadAdminDashboard selectedCard="pending" />;
  else if (selectedCard === "approved") mainContent = <HeadAdminDashboard selectedCard="approved" />;
  else if (selectedCard === "revision") mainContent = <HeadAdminDashboard selectedCard="revision" />;
  else if (selectedCard === "repository") mainContent = <HeadAdminDashboard selectedCard="repository" />;
  else if (selectedCard === "notifications") mainContent = <NotificationPage />;
  else mainContent = <MyAccount />; // Default to MyAccount

  return (
    <HeadAdminLayout onNavClick={handleNavClick} selectedCard={selectedCard}>
      {mainContent}
    </HeadAdminLayout>
  );
};

export default MyAccountWithHeadAdminSidebar;