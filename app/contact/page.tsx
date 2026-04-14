import { Card } from "@/components/ui/card";
import {
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { Header1 } from "@/components/ui/header-1";
import { ContactForm } from "@/components/contact-form";

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0A1628] text-white">
      <Header1 />

      <main className="flex-1">
        <section className="py-20 md:py-28">
          <div className="container max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm font-medium tracking-widest text-[#1D6FF2] mb-4">
                GET IN TOUCH
              </p>
              <h1 className="text-4xl md:text-5xl font-extrabold">
                Contact Us
              </h1>
              <p className="mt-4 text-lg text-white/60">
                Have a question? We&apos;d love to hear from you.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold mb-6">
                    Reach Out Anytime
                  </h2>
                  <p className="text-white/60 leading-relaxed">
                    Whether you have a question about courses, pricing, payments,
                    or anything else — our team is ready to answer all your questions.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1D6FF2]/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-[#1D6FF2]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Location</h3>
                      <p className="text-sm text-white/60">
                        Gudele 2, Juba, South Sudan
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1D6FF2]/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-5 w-5 text-[#1D6FF2]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Email</h3>
                      <a href="mailto:learnwithjohn17@gmail.com" className="text-sm text-white/60 hover:text-[#1D6FF2] transition-colors">
                        learnwithjohn17@gmail.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#1D6FF2]/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-[#1D6FF2]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">WhatsApp</h3>
                      <a href="https://wa.me/211929385157" target="_blank" rel="noopener noreferrer" className="text-sm text-white/60 hover:text-[#1D6FF2] transition-colors">
                        +211 929 385 157
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <Card className="bg-white/5 border-white/10">
                <ContactForm />
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8">
        <div className="container text-center text-xs text-white/30">
          &copy; {new Date().getFullYear()} Learn With John. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
