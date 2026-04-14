"use client"

import { motion } from "motion/react"
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1"

const testimonials = [
  {
    text: "Finally, a platform that speaks my language — not just English, but our situation. I got my first freelance client 3 weeks after finishing the web design course.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    name: "James M.",
    role: "Freelancer, Juba",
  },
  {
    text: "I used to think tech was only for people abroad. John proved me wrong. Now I run my own digital marketing side hustle from my phone.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop",
    name: "Grace A.",
    role: "Digital Marketer, Juba",
  },
  {
    text: "The courses are practical and straight to the point. No jargon, no fluff — just skills I can use immediately to earn money.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    name: "David K.",
    role: "Student, Malakal",
  },
  {
    text: "I built my first website after just one week of learning. The AI tools course saved me hours of work every single day. Highly recommend!",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop",
    name: "Sarah N.",
    role: "Entrepreneur, Juba",
  },
  {
    text: "John's teaching style is so clear. I went from zero knowledge to building client websites in under a month. Life-changing.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
    name: "Peter L.",
    role: "Web Designer, Juba",
  },
  {
    text: "The AI tools course is incredible. I now use ChatGPT to write proposals and Canva AI for designs. My productivity has doubled.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
    name: "Mary T.",
    role: "Content Creator, Wau",
  },
  {
    text: "Being able to pay with mobile money was a game-changer. No bank card needed. I signed up in 2 minutes and started learning immediately.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
    name: "Samuel A.",
    role: "Student, Bor",
  },
  {
    text: "I recommended this to my entire team at work. The freelancing course helped three of us land remote clients within a month.",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    name: "Rebecca O.",
    role: "Team Lead, Juba",
  },
  {
    text: "The certificate I got after completing the course impressed my employer. I got promoted to handle all our digital marketing.",
    image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=200&auto=format&fit=crop",
    name: "Daniel M.",
    role: "Marketing Officer, Juba",
  },
]

const firstColumn = testimonials.slice(0, 3)
const secondColumn = testimonials.slice(3, 6)
const thirdColumn = testimonials.slice(6, 9)

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-[#0A1628] relative">
      <div className="container z-10 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <div className="flex justify-center">
            <div className="border border-[#1D6FF2]/30 text-[#1D6FF2] py-1 px-4 rounded-lg text-sm font-medium">
              Testimonials
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tighter mt-5 text-white text-center">
            What Our Students Say
          </h2>
          <p className="text-center mt-5 text-white/60">
            Real stories from South Sudanese students who transformed their
            careers with digital skills.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:block"
            duration={19}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            duration={17}
          />
        </div>
      </div>
    </section>
  )
}
