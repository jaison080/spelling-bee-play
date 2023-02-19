import React from "react";
import styles from "./Footer.module.css";
import Image from "next/image";
import excelmainlogo from "../../assets/excelmainlogo.svg";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";

function Footer() {
  return (
    <>
      <div className={styles.footer_container}>
        <a href="https://excelmec.org/">
          <Image
            src={excelmainlogo}
            alt="Excel Logo"
            className={styles.excellogo}
          />
        </a>

        <div className={styles.footer_text}>Made with ❤️ Excel 2022</div>
        <div className={styles.footer_icons}>
          <a href="https://www.facebook.com/excelmec" target="_blank">
            <FaFacebookF className={styles.footer_icon} />
          </a>
          <a href="https://twitter.com/excelmec">
            <FaTwitter className={styles.footer_icon} />
          </a>
          <a href="https://www.instagram.com/excelmec/">
            <FaInstagram className={styles.footer_icon} />
          </a>
          <a href="https://www.linkedin.com/company/excelmec/">
            <FaLinkedinIn className={styles.footer_icon} />
          </a>
          <a href="https://www.youtube.com/excelmec">
            <FaYoutube className={styles.footer_icon} />
          </a>
        </div>
      </div>
    </>
  );
}

export default Footer;
