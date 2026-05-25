import React, { useState } from "react";
import ResearchCoordinatorLayout from "./ResearchCoordinatorLayout";
import MyAccount from "../Dashboard/MyAccount";
import ResearchCoordinatorDashboard from "../Dashboard/ResearchCoordinatorDashboard";
import NotificationPage from "../Dashboard/NotificationPage";

const MyAccountWithResearchCoordinatorSidebar = () => {
  const [selectedCard, setSelectedCard] = useState("my-account");
  const handleNavClick = (section) => setSelectedCard(section);

  // Render main content based on selectedCard
  let mainContent;
  if (selectedCard === "dashboard") mainContent = <ResearchCoordinatorDashboard />;
  else if (selectedCard === "pending") mainContent = <ResearchCoordinatorDashboard selectedCard="pending" />;
  else if (selectedCard === "approved") mainContent = <ResearchCoordinatorDashboard selectedCard="approved" />;
  else if (selectedCard === "revision") mainContent = <ResearchCoordinatorDashboard selectedCard="revision" />;
  else if (selectedCard === "repository") mainContent = <ResearchCoordinatorDashboard selectedCard="repository" />;
  else if (selectedCard === "notifications") mainContent = <NotificationPage />;
  else mainContent = <MyAccount />; // Default to MyAccount

  return (
    <ResearchCoordinatorLayout onNavClick={handleNavClick} selectedCard={selectedCard}>
      {mainContent}
    </ResearchCoordinatorLayout>
  );
};

export default MyAccountWithResearchCoordinatorSidebar;