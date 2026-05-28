import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, CalendarPlus, Compass, KeyRound, PlusCircle } from "lucide-react";

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
        className="font-heading text-4xl md:text-5xl font-bold mb-12 text-center tracking-tight text-navy"
      >
        What would you like to do?
      </motion.h1>

      {/* Events Section */}
      <div className="w-full max-w-4xl mb-12">
        <motion.h2
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="font-heading text-lg font-bold mb-6 text-navy/80 tracking-widest uppercase border-b border-soft pb-2"
        >
          Events & Activities
        </motion.h2>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
        >
          {[
            { to: "/choice", title: "Participate", desc: "Register for exciting campus events and contests.", icon: Trophy },
            { to: "/new-events-hosted", title: "Host", desc: "Create and manage your own coding or sports events.", icon: CalendarPlus },
          ].map(({ to, title, desc, icon: Icon }) => (
            <motion.div key={to} variants={itemVariants} className="h-full">
              <Link
                to={to}
                className="card flex flex-col items-center justify-between h-full p-8 text-center group relative overflow-hidden bg-surface border-base transition-all duration-300"
              >
                {/* Gold gradient top line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="flex flex-col items-center">
                  {/* Icon wrapper with gold styling */}
                  <div className="p-4 rounded-2xl bg-surface-2 border border-base text-[var(--color-gold)] mb-5 group-hover:bg-[var(--color-gold)] group-hover:text-white transition-all duration-300 shadow-sm group-hover:scale-110">
                    <Icon className="h-7 w-7" aria-hidden="true" />
                  </div>
                  
                  <h3 className="font-heading text-2xl font-bold mb-3 text-navy group-hover:gradient-text transition-colors duration-300">
                    {title}
                  </h3>
                  
                  <p className="text-sm text-secondary leading-relaxed max-w-xs">
                    {desc}
                  </p>
                </div>

                {/* Action indicator at bottom */}
                <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-[var(--color-gold)] group-hover:translate-x-1 transition-transform duration-300">
                  <span>Get Started</span>
                  <span>→</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Clubs Section */}
      <div className="w-full max-w-6xl">
        <motion.h2
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="font-heading text-lg font-bold mb-6 text-navy/80 tracking-widest uppercase border-b border-soft pb-2"
        >
          Clubs & Communities
        </motion.h2>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
        >
          {[
            { to: "/clubs", title: "Browse Clubs", desc: "Discover and join campus clubs that match your interests.", icon: Compass },
            { to: "/clubs/join", title: "Join a Club", desc: "Have a club code? Join any public or private club instantly.", icon: KeyRound },
            { to: "/clubs/create", title: "Create a Club", desc: "Found a new campus club and build your community.", icon: PlusCircle },
          ].map(({ to, title, desc, icon: Icon }) => (
            <motion.div key={to} variants={itemVariants} className="h-full">
              <Link
                to={to}
                className="card flex flex-col items-center justify-between h-full p-8 text-center group relative overflow-hidden bg-surface border-base transition-all duration-300"
              >
                {/* Gold gradient top line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="flex flex-col items-center">
                  {/* Icon wrapper with gold styling */}
                  <div className="p-4 rounded-2xl bg-surface-2 border border-base text-[var(--color-gold)] mb-5 group-hover:bg-[var(--color-gold)] group-hover:text-white transition-all duration-300 shadow-sm group-hover:scale-110">
                    <Icon className="h-7 w-7" aria-hidden="true" />
                  </div>
                  
                  <h3 className="font-heading text-2xl font-bold mb-3 text-navy group-hover:gradient-text transition-colors duration-300">
                    {title}
                  </h3>
                  
                  <p className="text-sm text-secondary leading-relaxed max-w-xs">
                    {desc}
                  </p>
                </div>

                {/* Action indicator at bottom */}
                <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-[var(--color-gold)] group-hover:translate-x-1 transition-transform duration-300">
                  <span>Get Started</span>
                  <span>→</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
