import { useEffect, useState } from "react";
import AddressSelector from "../components/Addressselector";
import { Address } from "../types/user";

const AddressPage = () => {
    const userId = window.HOST_USER_INFO?._id;
    const [currentAddressId, setCurrentAddressId] = useState<string | undefined>();

    useEffect(() => {
        const event = new CustomEvent("widget-loading-status", {
            detail: false,
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
        <div className="flex w-full justify-center p-4">
            <div className="w-full max-w-[760px]">
                <AddressSelector
                    userId={userId}
                    showActions={false}
                    // showAddButton={false}
                    selectedAddressId={currentAddressId}
                    onSelect={handleAddressSelect}
                    layout="column"
                />
            </div>
        </div>
    );
};

export default AddressPage;