import { Wifi, CreditCard, Laptop, Globe, Smartphone, ShieldAlert } from 'lucide-react'

interface FeatureItem {
    icon: React.ElementType
    title: string
    description: string
}

interface Features4Props {
    heading?: string
    subheading?: string
    features?: FeatureItem[]
}

export function Features4({
    heading = "The foundation for creative teams management",
    subheading = "Lyra is evolving to be more than just the models.",
    features = [
        {
            icon: Wifi,
            title: "Slow Internet",
            description: "Most platforms assume fast WiFi. In South Sudan, you're often on 3G or shared data.",
        },
        {
            icon: CreditCard,
            title: "No Bank Card",
            description: "International platforms need Visa or Mastercard. You only have mobile money.",
        },
        {
            icon: Laptop,
            title: "No Laptop Required",
            description: "They assume you have a computer. You might only have a phone — and that's enough.",
        },
        {
            icon: Globe,
            title: "Wrong Context",
            description: "Examples about Silicon Valley don't help when you're building a business in Juba.",
        },
        {
            icon: Smartphone,
            title: "Not Mobile-First",
            description: "Most course platforms are designed for desktops. You need something built for your phone.",
        },
        {
            icon: ShieldAlert,
            title: "No Local Support",
            description: "When you're stuck, there's no one who understands your situation to help you.",
        },
    ],
}: Features4Props) {
    return (
        <section className="py-12 md:py-20">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
                    <h2 className="text-balance text-4xl font-medium lg:text-5xl">{heading}</h2>
                    <p className="text-white/60">{subheading}</p>
                </div>

                <div className="relative mx-auto grid max-w-2xl lg:max-w-4xl divide-x divide-y border border-white/10 divide-white/10 *:p-12 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => {
                        const Icon = feature.icon
                        return (
                            <div key={index} className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Icon className="size-4 text-[#1D6FF2]" />
                                    <h3 className="text-sm font-medium">{feature.title}</h3>
                                </div>
                                <p className="text-sm text-white/60">{feature.description}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
