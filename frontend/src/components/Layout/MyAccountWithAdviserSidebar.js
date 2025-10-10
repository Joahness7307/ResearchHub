import React from "react";
import ResearchAdviserLayout from "../Layout/ResearchAdviserLayout";
import MyAccount from "../Dashboard/MyAccount";

const MyAccountWithAdviserSidebar = () => (
  <ResearchAdviserLayout>
    <MyAccount />
  </ResearchAdviserLayout>
);

export default MyAccountWithAdviserSidebar;