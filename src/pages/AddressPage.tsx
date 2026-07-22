import { useEffect, useState } from "react";
import AddressSelector from "../components/Addressselector";
import { Address } from "../types/user";

const AddressPage = () => {
    const userId = window.HOST_USER_INFO?._id;

    console.log("userId:", userId);
    const [currentAddressId, setCurrentAddressId] = useState<string | undefined>();
    useEffect(() => {
        //   console.log("AddressPage mounted");
        // console.log("HOST_USER_INFO inside useEffect:", window.HOST_USER_INFO);
        // console.log("userId inside useEffect:", userId);
        const event = new CustomEvent("widget-loading-status", {
            detail: false
        });
        window.dispatchEvent(event);
    }, []);
    const handleAddressSelect = (addr: Address) => {
        if (!addr?._id) return;

        setCurrentAddressId(addr._id);

        window.dispatchEvent(
            new CustomEvent("profile-address-selected", {
                detail: addr,
            })
        );
    };
    return (
   <div className="profile-page profile-page--embedded">
            <div className="profile-container">
                <AddressSelector
                    userId={userId}
                    showActions={false}
                    showAddButton={false}
                    selectedAddressId={currentAddressId}
                    onSelect={handleAddressSelect}
                />
            </div>
        </div>
    );
};

export default AddressPage;