import {
    ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FaEnvelope, FaMap, FaPhoneAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { footerSections } from "../utils/constants";

const bottomLinks = ["Home", "FAQ", "Support"];

const DateTimeBox = () => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const intervalId = setInterval(() => setNow(new Date()), 60 * 1000);
        return () => clearInterval(intervalId);
    }, []);

    const datePart = now.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    const timePart = now.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });

    return (
        <div className="inline-block border border-red-500 rounded-sm px-1 py-1 bg-red-600 text-white font-semibold text-sm">
            {datePart} {timePart}
        </div>
    );
};

const ListItem = ({ text, link }) => (
    <li className="flex items-center text-gray-300 hover:text-white cursor-pointer">
        <ChevronRight className="w-3 h-3 mr-2" />
        {link ? (
            typeof link === 'string' ? (
                link.startsWith('http') ? (
                    <a href={link} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                        {text}
                    </a>
                ) : (
                    <Link to={link} className="hover:text-white">
                        {text}
                    </Link>
                )
            ) : (
                text
            )
        ) : (
            text
        )}
    </li>
);

const FooterSection = ({ title, icon, links }) => (
    <div>
        <h3 className="text-lg font-semibold mb-4 border-t   flex justify-between  pt-4  items-center">
            {title}
            {icon && <span className="ml-2 w-4 h-4 text-sm">{icon}</span>}
        </h3>
        <ul className="space-y-2 text-sm opacity-70">
            {links.map((link, idx) => (
                <ListItem key={idx} text={link.text || link} link={link.link} />
            ))}
        </ul>
    </div>
);

export default function Footer() {
    return (
        <footer className="bg-black text-white pt-6 pb-2 px-6">
            <div className="ml-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                    {/* About Us */}
                    <div>
                        <div className="flex mb-4 border-t pt-4 justify-between">
                            <h3 className="text-lg font-semibold  border-gray-600">ABOUT US</h3>
                            <h3 className="text-lg font-semibold  border-gray-600">⛶</h3>
                        </div>

                        <p className="text-gray-200 opacity-70 text-sm leading-relaxed mb-4">
                            ISPR Publications started as weekly Urdu Magazine in 1948 under the name 'Mujahid' that holds the
                            distinction of featuring congratulatory messages from the Founder of Pakistan and other prominent civil
                            and military leaders in its early editions.
                        </p>
                        {/* <button className="text-gray-200 opacity-70 text-sm  mb-4 flex items-center">
                            Read More
                            <span className="flex items-center ml-1">
                                <span>{'>'}</span>
                                <span>{'>'}</span>
                            </span>
                        </button> */}

                        <div className="space-y-2 text-sm text-white ">
                            {[
                                { text: "Hilal Road, Rawalpindi, PK", icon: <FaMap className="w-4 h-4 mr-2" /> },
                                { text: "hilalengish@gmail.com", icon: <FaEnvelope className="w-4 h-4 mr-2" /> },
                                { text: "051-5104118", icon: <FaPhoneAlt className="w-4 h-4 mr-2" /> },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center">
                                    <span className="opacity-100"> {item.icon}</span>
                                    <span className="opacity-70"> {item.text}</span>

                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Other Sections */}
                    {footerSections.map((section, idx) => (
                        <FooterSection
                            key={idx}
                            title={section.title}
                            icon={section.icon}
                            links={section.links}
                        />
                    ))}
                </div>

                {/* Bottom Footer */}
                <div className=" border-gray-600  flex flex-col md:flex-row justify-between items-center">
                    <div className="flex items-center flex-wrap text-sm text-gray-300 ">
                        <span className="text-white mr-2  text-2xl">©</span>
                        <span className="text-red-500 mr-1">2017</span>
                        <span className="text-red-500 mr-1">Hilal Publications</span>
                        <span>All Rights Reserved</span>
                    </div>

                    <div className="flex flex-col md:flex-row items-center md:space-x-4 w-full md:w-auto mt-4 md:mt-0">
                        <div className="mb-2 md:mb-0">
                            <DateTimeBox />
                        </div>
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-300 mb-2 md:mb-0">
                            {bottomLinks.map((link, idx) => (
                                <span key={idx} className="flex items-center space-x-2">
                                    {idx > 0 && <span>|</span>}
                                    <a href="#" className="hover:text-white">
                                        {link}
                                    </a>
                                </span>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </footer>
    );
}
