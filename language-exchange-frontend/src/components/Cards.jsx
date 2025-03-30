import React from "react";
import { motion } from "framer-motion";
import { FaGlobe, FaComments, FaLanguage } from "react-icons/fa"; // Import icons
import "./styles/Cards.css";

const Cards = () => {
    const cardsData = [
        { title: "Learn with Natives", text: "Practice with native speakers! 🌍", icon: <FaGlobe />, className: "card-left" },
        { title: "Real-Time Conversations", text: "Join live sessions! 🎧", icon: <FaComments />, className: "card-center" },
        { title: "Multiple Languages", text: "Spanish, French, German & more! 🏆", icon: <FaLanguage />, className: "card-right" }
    ];

    return (
        <div className="container mt-3">
            <div className="row justify-content-center g-0"> {/* ✅ Reduce Bootstrap Grid Gap */}
                {cardsData.map((card, index) => (
                    <motion.div
                        key={index}
                        className="col-lg-4 col-md-5 col-sm-12 d-flex justify-content-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: index * 0.2 }}
                    >
                        <div className={`card shadow-lg p-2 bg-white rounded text-center card-hover ${card.className}`}>
                            <div className="card-body">
                                <div className="icon">{card.icon}</div>
                                <h5 className="card-title fw-bold">{card.title}</h5>
                                <p className="card-text">{card.text}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Cards;
