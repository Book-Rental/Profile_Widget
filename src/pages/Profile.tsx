import { useEffect } from "react";
import ProfileForm from "../components/ProfileForm";
import AddressSelector from "../components/Addressselector";

const Profile = () => {
  const userId = window.HOST_USER_INFO?._id;

  useEffect(() => {
    const event = new CustomEvent("widget-loading-status", {
      detail: false,
    });
    window.dispatchEvent(event);
  }, []);

  return (
    <div className="flex w-full justify-center px-4 py-12">
      <div className="w-full max-w-[760px] space-y-3">
        <ProfileForm userId={userId} />
        <AddressSelector userId={userId} />
      </div>
    </div>
  );
};

export default Profile;