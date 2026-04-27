import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Body() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="pt-12 pb-20 min-h-screen flex flex-col items-center px-4 bg-page">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="font-heading text-4xl md:text-5xl font-bold mb-16 text-center tracking-tight text-navy"
      >
        What would you like to do?
      </motion.h1>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full"
      >
        {[
          { to: "/choice",       title: "Participate",   desc: "Register for exciting campus events and contests." },
          { to: "/new-events-hosted", title: "Host",      desc: "Create and manage your own coding or sports events." },
          { to: "/clubs",        title: "Browse Clubs",   desc: "Discover and join campus clubs that match your interests." },
          { to: "/clubs/join",   title: "Join a Club",    desc: "Have a club code? Join any public or private club instantly." },
          { to: "/clubs/create", title: "Create a Club",  desc: "Found a new campus club and build your community." },
        ].map(({ to, title, desc }, idx) => (
          <motion.div key={to} variants={itemVariants} className="h-full">
            <Link
              to={to}
              className="card flex flex-col items-center justify-center h-full p-8 text-center group"
            >
              <div
                className="h-1 rounded-full mb-6 transition-all duration-300 w-12 group-hover:w-24 bg-gold"
              />
              <h2 className="font-heading text-2xl font-semibold mb-3 text-navy group-hover:gradient-text transition-colors duration-300">
                {title}
              </h2>
              <p className="text-secondary leading-relaxed">
                {desc}
              </p>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
