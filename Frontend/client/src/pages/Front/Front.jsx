import { useRef } from "react";
import Top from "./Top";
import Features from "./Features";
import Foot from "./Foot";

export default function Front() {
  const featuresRef = useRef(null);

  const handleScrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="font-sans">
      <Top onGetStartedClick={handleScrollToFeatures} />
      <div ref={featuresRef}>
        <Features />
      </div>
      <Foot />
    </div>
  );
}
