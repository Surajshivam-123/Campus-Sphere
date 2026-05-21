const Footer = () => {
  return (
    <footer className="w-full bg-gray-900 text-gray-400 py-6 mt-auto border-t border-gray-800">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-2 px-4">
        <p className="text-white font-semibold text-sm tracking-wide">
          Campus Sphere
        </p>

        <nav className="flex gap-6 text-sm">
          <a
            href="/about"
            className="hover:text-white transition-colors duration-200"
          >
            About
          </a>

          <a
            href="https://github.com/Surajshivam-123/Campus-Sphere"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors duration-200"
          >
            GitHub
          </a>

          <a
            href="/contact"
            className="hover:text-white transition-colors duration-200"
          >
            Contact
          </a>
        </nav>

        <p className="text-xs text-gray-600">
          © {new Date().getFullYear()} Campus Sphere. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
