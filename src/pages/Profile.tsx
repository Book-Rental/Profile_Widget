
import ProfileForm from "../components/ProfileForm";
// import AddressList from "../components/AddressList";
import { useEffect } from "react";
import AddressSelector from "../components/Addressselector";

const Profile = () => {
  const userId = window.HOST_USER_INFO?._id;


  useEffect(() => {
    const event = new CustomEvent("widget-loading-status", {
      detail: false
    });
    window.dispatchEvent(event);
  }, []);
  return (
    <div className="profile-page">
      <div className="profile-container">
        <ProfileForm userId={userId} />
        {/* <AddressList userId={userId} /> */}
        <AddressSelector userId={userId} />
      </div>
    </div>
  );
};

export default Profile;