"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnimatedHeroProps {
  titles?: string[];
  heading?: string;
  description?: string;
  primaryButton?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
  secondaryButton?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
  badgeText?: string;
}

function Hero({
  titles = ["amazing", "new", "wonderful", "beautiful", "smart"],
  heading = "This is something",
  description = "Managing a small business today is already tough. Avoid further complications by ditching outdated, tedious trade methods. Our goal is to streamline SMB trade, making it easier and faster than ever.",
  primaryButton = {
    label: "Sign up here",
    href: "#",
    icon: <MoveRight className="w-4 h-4" />,
  },
  secondaryButton = {
    label: "Jump on a call",
    href: "#",
    icon: <PhoneCall className="w-4 h-4" />,
  },
  badgeText = "Read our launch article",
}: AnimatedHeroProps) {
  const [titleNumber, setTitleNumber] = useState(0);
  const memoTitles = useMemo(() => titles, [titles]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === memoTitles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, memoTitles]);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          {badgeText && (
            <div>
              <Button variant="outline" size="sm" className="gap-4 border-white/20 text-white/80 hover:text-white hover:bg-white/10" asChild>
                <a href={primaryButton.href}>
                  {badgeText} <MoveRight className="w-4 h-4" />
                </a>
              </Button>
            </div>
          )}
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              <span>{heading}</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {memoTitles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
              {description}
            </p>
          </div>
          <div className="flex flex-row gap-3">
            {secondaryButton && (
              <Button size="lg" className="gap-4 border-white/20 text-white hover:bg-white/10" variant="outline" asChild>
                <a href={secondaryButton.href}>
                  {secondaryButton.label} {secondaryButton.icon}
                </a>
              </Button>
            )}
            {primaryButton && (
              <Button size="lg" className="gap-4 bg-[#1D6FF2] hover:bg-[#1858D0] text-black font-semibold" asChild>
                <a href={primaryButton.href}>
                  {primaryButton.label} {primaryButton.icon}
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
