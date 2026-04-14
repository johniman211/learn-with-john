"use client";

import React from "react";

interface ServiceItem {
  title: string;
  image: string;
  overlayImage: string;
}

interface ServicesSectionProps {
  heading?: string;
  subheading?: string;
  services?: ServiceItem[];
}

const ServicesSection = ({
  heading = "How Can I Help?",
  subheading = "Let's turn your vision into something amazing.",
  services = [
    {
      title: "Web Development",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=512&auto=format&fit=crop",
      overlayImage: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=512&auto=format&fit=crop",
    },
    {
      title: "Creative Design",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=512&auto=format&fit=crop",
      overlayImage: "https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=512&auto=format&fit=crop",
    },
    {
      title: "Branding",
      image: "https://images.unsplash.com/photo-1634942537034-2531766767d1?q=80&w=512&auto=format&fit=crop",
      overlayImage: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?q=80&w=512&auto=format&fit=crop",
    },
    {
      title: "Product Design",
      image: "https://images.unsplash.com/photo-1581291518633-83b4eef1d2fa?q=80&w=512&auto=format&fit=crop",
      overlayImage: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?q=80&w=512&auto=format&fit=crop",
    },
  ],
}: ServicesSectionProps) => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 w-full">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 tracking-tight">
            {heading}
          </h2>
          <p className="text-lg sm:text-xl font-light opacity-60">
            {subheading}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group bg-white/5 rounded-3xl p-6 flex flex-col h-[320px] transition-all duration-300 hover:bg-white/10"
            >
              {/* Image Container */}
              <div className="relative flex-grow flex items-center justify-center mb-4">
                <img
                  src={service.image}
                  alt={`${service.title} showcase`}
                  className="absolute w-44 h-auto rounded-lg shadow-md transform -rotate-6 transition-all duration-400 ease-in-out group-hover:rotate-[-10deg] group-hover:scale-105"
                />
                <img
                  src={service.overlayImage}
                  alt={`${service.title} example`}
                  className="absolute w-44 h-auto rounded-lg shadow-lg transform rotate-3 transition-all duration-400 ease-in-out group-hover:rotate-[5deg] group-hover:scale-105"
                />
              </div>

              {/* Service Title */}
              <h3 className="text-left text-lg font-medium mt-auto">
                {service.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
