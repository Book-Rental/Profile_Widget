
import AddressList from "../components/AddressList";

const AddressPage = () => {
    const userId = window.HOST_USER_INFO._id;


    return (
        <div className="profile-page">
            <div className="profile-container">
                <AddressList userId={userId} />
            </div>
        </div>
    );
};

export default AddressPage;