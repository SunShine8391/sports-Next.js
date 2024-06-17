import { Instagram, Twitter, Youtube } from "lucide-react";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <div className="bg-primary text-white py-8">
      <div className="mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between">
        <div>
          <p className="text-xl tracking-tight font-gothic font-extrabold text-center md:text-left">
            Sports Stakes
          </p>
          <p className="my-2 text-sm text-gray-300">
            © {new Date(Date.now()).getFullYear()} Sports Stakes. All rights
            reserved.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Link className="bg-white p-3 rounded-full" href="#">
            <svg
              width="20"
              height="18"
              viewBox="0 0 20 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.2719 0.586426H18.0831L11.9414 7.606L19.1666 17.1581H13.5093L9.07834 11.3648L4.00827 17.1581H1.19534L7.76451 9.64984L0.833313 0.586426H6.63424L10.6395 5.8817L15.2719 0.586426ZM14.2852 15.4754H15.843L5.78781 2.1807H4.1162L14.2852 15.4754Z"
                fill="#040512"
              />
            </svg>

            <span className="sr-only">X</span>
          </Link>

          <Link
            className="bg-white p-3 rounded-full"
            href="https://www.instagram.com/footiestakes/"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z"
                stroke="#040512"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 15.5C13.933 15.5 15.5 13.933 15.5 12C15.5 10.067 13.933 8.5 12 8.5C10.067 8.5 8.5 10.067 8.5 12C8.5 13.933 10.067 15.5 12 15.5Z"
                stroke="#040512"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.6361 7H17.6477"
                stroke="#040512"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <span className="sr-only">Instagram</span>
          </Link>

          <Link className="bg-white p-3 rounded-full" href="#">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17 20H7C4 20 2 18 2 15V9C2 6 4 4 7 4H17C20 4 22 6 22 9V15C22 18 20 20 17 20Z"
                stroke="#040512"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11.4 9.50006L13.9 11.0001C14.8 11.6001 14.8 12.5001 13.9 13.1001L11.4 14.6001C10.4 15.2001 9.59998 14.7001 9.59998 13.6001V10.6001C9.59998 9.30006 10.4 8.90006 11.4 9.50006Z"
                stroke="#040512"
                strokeWidth="1.5"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <span className="sr-only">YouTube</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Footer;
