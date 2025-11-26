import React from "react";
import { motion } from "framer-motion";

const backdropVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.8, y: "-50%", x: "-50%" },
  visible: { opacity: 1, scale: 1, y: "-50%", x: "-50%" },
  exit: { opacity: 0, scale: 0.8, y: "-50%", x: "-50%" },
};

const LoginPromptModal = ({ onClose, message = "Please log in to like a recipe" }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <motion.div
        className="bg-[#1e1e2f] p-6 rounded-lg shadow-xl w-80 text-center absolute top-1/2 left-1/2"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <h2 className="text-xl font-semibold text-white mb-4">Heads up!</h2>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-4 py-2 rounded"
          >
            OK
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoginPromptModal;
