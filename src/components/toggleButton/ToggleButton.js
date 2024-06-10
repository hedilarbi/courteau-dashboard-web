import React from "react";
import styles from "./ToggleButton.module.css";
const ToggleButton = ({ isToggled, setIsToggled }) => {
  const handleChange = () => {
    setIsToggled(!isToggled);
  };

  return (
    <button
      onClick={handleChange}
      className={`${styles.toggleButton} ${isToggled ? styles.on : styles.off}`}
    >
      <div className={styles.circle}></div>
    </button>
  );
};

export default ToggleButton;
