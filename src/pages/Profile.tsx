
import ProfileForm from "../components/ProfileForm";
import AddressList from "../components/AddressList";

const Profile = () => {
  const userId = "6a50d6d4716eb54b96411946";

  return (
    <div className="profile-page">
      <div className="profile-container">
        <ProfileForm userId={userId} />
        <AddressList userId={userId} />
      </div>
    </div>
  );
};

export default Profile;