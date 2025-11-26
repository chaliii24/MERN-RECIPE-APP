import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext";
import { FaUtensils } from "react-icons/fa";
import { Handshake, Hand } from "lucide-react";

const AboutUs = () => {
  const { user } = useContext(AuthContext);

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a1a2e] to-black px-6 py-12 text-gray-200 font-sans"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <motion.div
        className="flex flex-col items-center mb-10 text-center"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex justify-center items-center gap-3 mb-4">
          <FaUtensils className="text-5xl text-pink-500 animate-wiggle" />
          <h1
            className="text-5xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 font-bold tracking-tight"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            ReciPedia
          </h1>
        </div>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full mb-4"></div>
        <p className="text-gray-400 max-w-2xl">
          Discover the heart of Recipedia — a recipe sharing hub built for food lovers, chefs, and everyday cooks.
        </p>
      </motion.div>

      {/* Info Section */}
      <motion.div
        className="bg-[#1e1e2f] bg-opacity-90 shadow-lg rounded-xl p-8 mb-16 border border-[#2a2a40] max-w-3xl mx-auto text-gray-300"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <p className="text-lg leading-relaxed">
          <span className="font-semibold text-pink-400 text-xl">Recipedia</span> is your ultimate destination for discovering and sharing
          <span className="font-medium text-white"> delicious recipes</span> from around the world. Whether you're a
          <span className="italic"> home cook</span>, a <span className="italic">professional chef</span>, or just exploring the kitchen,
          Recipedia helps you find the perfect dish for every occasion.
        </p>
        <p className="text-lg mt-4 leading-relaxed">
          With features like <span className="font-semibold text-pink-400">category filtering</span>,
          <span className="font-semibold text-pink-400"> smart search</span>, and
          <span className="font-semibold text-pink-400"> recipe management</span>, Recipedia makes cooking
          <span className="text-green-400 font-medium"> fun</span>,
          <span className="text-yellow-400 font-medium"> social</span>, and
          <span className="text-red-400 font-medium"> easy to explore</span>.
        </p>
        <p className="text-lg mt-4 leading-relaxed">
          Built with the <span className="text-purple-400 font-semibold">MERN stack</span> and styled using
          <span className="text-pink-400 font-semibold"> Tailwind CSS</span>, Recipedia is designed for a seamless, responsive experience.
        </p>
      </motion.div>

      {/* Team Section */}
      <motion.div
        className="max-w-7xl mx-auto text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 flex items-center justify-center gap-3 mb-2">
          <Handshake className="w-8 h-8 text-pink-400 drop-shadow-md animate-wiggle" />
          Meet the Team
        </h2>

        <div className="w-20 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-full mx-auto mb-4"></div>
        <p className="text-gray-400 mb-10 max-w-xl mx-auto">
          Get to know the passionate individuals who brought <span className="font-semibold text-pink-400">Recipedia</span> to life.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 px-4">
          {[
            {
              name: "Charles Darius Arradaza",
              role: "Developer",
              img: "/images/Charles.jpg",
              desc: "As the developer of Recipedia, I was responsible for building the core functionality of the website using the MERN stack — MongoDB, Express.js, React.js, and Node.js. From creating the user interface with Tailwind CSS to developing secure backend APIs and database integration, I ensured the platform runs smoothly and efficiently.",
            },
            {
              name: "Shelou Pacala",
              role: "Tester",
              img: "/images/shelou.jpg",
              desc: "I handled the testing and validation of Recipedia to ensure a bug-free and user-friendly experience. I performed functional testing, UI checks, and edge-case validations to confirm that all features perform as expected and remain reliable.",
            },
            {
              name: "Sophia Mae Valle",
              role: "Product Owner",
              img: "/images/sophia.jpg",
              desc: "As the product owner of Recipedia, I defined the project vision and coordinated the team to ensure that our goals and deadlines were met. My role focused on aligning the platform with our users' needs and delivering a complete and polished app experience.",
            },
          ].map((member, index) => (
            <motion.div
              key={index}
              className="bg-[#2a2a40] shadow-md rounded-2xl p-6 text-center transition-all duration-300 transform text-gray-200"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.2, duration: 0.5 }}
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(236, 72, 153, 0.4)" }}
            >
              <img
                src={member.img}
                alt={member.name}
                className="w-28 h-28 mx-auto rounded-full object-cover mb-4 border-4 border-pink-500"
              />
              <h3 className="text-xl font-bold text-pink-400">{member.name}</h3>
              <p className="text-sm text-gray-400 italic mb-2">{member.role}</p>
              <p className="text-sm text-gray-300 text-justify">{member.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        className="text-center mt-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {user ? (
          <div className="flex justify-center items-center gap-2 mb-2">
            <Hand className="text-pink-400 w-7 h-7 animate-wave" />
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
              Hello, {user.username}!
            </h2>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-semibold text-pink-400 mb-2">
              Want to be part of our journey?
            </h3>
            <p className="text-gray-400 mb-4">
              Join us in shaping the future of recipe sharing and food discovery.
            </p>
            <Link to="/register">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-[2px] transition duration-300 cursor-pointer"
              >
                <button className="cursor-pointer bg-gradient-to-br from-gray-900 via-[#1a1a2e] to-black hover:from-[#23233a] hover:via-[#2a2a44] hover:to-[#1a1a2e] text-white font-semibold rounded-full px-6 py-2 w-full h-full transition duration-300">
                  Get Started
                </button>
              </motion.div>
            </Link>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AboutUs;
