import React, { useEffect } from "react";

const Redirect = () => {

    useEffect(() => {
        const openGoogleHomepage = () => {
            window.open('https://www.google.com', '_self');
        };
        openGoogleHomepage();
    }, []);

    return (
        <div></div>
    );
}

export default Redirect;

