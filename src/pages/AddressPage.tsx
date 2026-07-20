import { useEffect, useState } from "react";
import AddressSelector from "../components/Addressselector";

const AddressPage = () => {
    const userId = window.HOST_USER_INFO?._id;

    const [currentAddressId, setCurrentAddressId] = useState<string | undefined>();
    useEffect(() => {
        const event = new CustomEvent("widget-loading-status", {
            detail: false
        });
        window.dispatchEvent(event);
    }, []);
    return (
        <div className="profile-page">
            <div className="profile-container">
                <AddressSelector
                    userId={userId}
                    showActions={false}
                    showAddButton={false}
                    selectedAddressId={currentAddressId}
                    onSelect={(addr) => setCurrentAddressId(addr?._id)}
                />
            </div>
        </div>
    );
};

export default AddressPage;