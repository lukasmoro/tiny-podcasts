import React from 'react';
import bmcButton from '../../assets/img/bmc-button.png';

function BuyMeACoffeeButton() {
  return (
    <a
      href="https://www.buymeacoffee.com/lukasmoro"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        userSelect: 'none',
        WebkitUserDrag: 'none',
        KhtmlUserDrag: 'none',
        MozUserDrag: 'none',
        OUserDrag: 'none',
      }}
    >
      <img
        style={{
          paddingTop: '0.9rem',
          height: '40px',
          userSelect: 'none',
          WebkitUserDrag: 'none',
          KhtmlUserDrag: 'none',
          MozUserDrag: 'none',
          OUserDrag: 'none',
        }}
        alt="Buy Me a Coffee Widget"
        src={bmcButton}
      />
    </a>
  );
}

export default BuyMeACoffeeButton;
