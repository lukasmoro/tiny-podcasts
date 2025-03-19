import React from 'react';
import bmcButton from '../../assets/img/bmc-button.png';
import './BuyMeACoffeeButton.css';

function BuyMeACoffeeButton() {
  return (
    <a
      href="https://www.buymeacoffee.com/lukasmoro"
      target="_blank"
      rel="noopener noreferrer"
      className="bmc-link"
    >
      <img className="bmc-img" alt="Buy Me a Coffee Widget" src={bmcButton} />
    </a>
  );
}

export default BuyMeACoffeeButton;
