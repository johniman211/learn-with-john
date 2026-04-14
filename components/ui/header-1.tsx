'use client';
import React from 'react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';
import { createPortal } from 'react-dom';
import { GraduationCap } from 'lucide-react';

export function Header1() {
	const [open, setOpen] = React.useState(false);
	const scrolled = useScroll(10);

	const links = [
		{ label: 'Courses', href: '/courses' },
		{ label: 'About', href: '/about' },
		{ label: 'Contact', href: '/contact' },
	];

	React.useEffect(() => {
		if (open) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [open]);

	return (
		<header
			className={cn('sticky top-0 z-50 w-full border-b border-transparent', {
				'bg-[#0A1628]/95 supports-[backdrop-filter]:bg-[#0A1628]/80 border-white/10 backdrop-blur-lg':
					scrolled,
			})}
		>
			<nav className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
				<Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
					<GraduationCap className="h-7 w-7 text-[#1D6FF2]" />
					<div>
						<span className="text-lg font-bold text-white">Learn With John</span>
						<span className="hidden sm:block text-[10px] text-white/50 -mt-1">
							South Sudan&apos;s Digital Skills Platform
						</span>
					</div>
				</Link>
				<div className="hidden items-center gap-1 md:flex">
					{links.map((link) => (
						<Link
							key={link.label}
							className={cn(
								buttonVariants({ variant: 'ghost' }),
								'text-white/70 hover:text-white hover:bg-white/10'
							)}
							href={link.href}
						>
							{link.label}
						</Link>
					))}
					<div className="ml-2 flex items-center gap-2">
						<Link href="/sign-in">
							<Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
								Sign In
							</Button>
						</Link>
						<Link href="/sign-up">
							<Button className="bg-[#1D6FF2] hover:bg-[#1858D0] text-black font-semibold">
								Get Started
							</Button>
						</Link>
					</div>
				</div>
				<Button
					size="icon"
					variant="outline"
					onClick={() => setOpen(!open)}
					className="md:hidden border-white/20 text-white hover:bg-white/10 bg-transparent"
					aria-expanded={open}
					aria-controls="mobile-menu"
					aria-label="Toggle menu"
				>
					<MenuToggleIcon open={open} className="size-5" duration={300} />
				</Button>
			</nav>
			<MobileMenu open={open} className="flex flex-col justify-between gap-2">
				<div className="grid gap-y-1">
					{links.map((link) => (
						<Link
							key={link.label}
							className={cn(
								buttonVariants({
									variant: 'ghost',
									className: 'justify-start text-white/80 hover:text-white hover:bg-white/10',
								}),
							)}
							href={link.href}
							onClick={() => setOpen(false)}
						>
							{link.label}
						</Link>
					))}
				</div>
				<div className="flex flex-col gap-2">
					<Link href="/sign-in" onClick={() => setOpen(false)}>
						<Button variant="outline" className="w-full bg-transparent border-white/20 text-white hover:bg-white/10">
							Sign In
						</Button>
					</Link>
					<Link href="/sign-up" onClick={() => setOpen(false)}>
						<Button className="w-full bg-[#1D6FF2] hover:bg-[#1858D0] text-black font-semibold">
							Get Started
						</Button>
					</Link>
				</div>
			</MobileMenu>
		</header>
	);
}

type MobileMenuProps = React.ComponentProps<'div'> & {
	open: boolean;
};

function MobileMenu({ open, children, className, ...props }: MobileMenuProps) {
	if (!open || typeof window === 'undefined') return null;

	return createPortal(
		<div
			id="mobile-menu"
			className={cn(
				'bg-[#0A1628]/95 supports-[backdrop-filter]:bg-[#0A1628]/80 backdrop-blur-lg',
				'fixed top-16 right-0 bottom-0 left-0 z-40 flex flex-col overflow-hidden border-y border-white/10 md:hidden',
			)}
		>
			<div
				data-slot={open ? 'open' : 'closed'}
				className={cn(
					'data-[slot=open]:animate-in data-[slot=open]:zoom-in-97 ease-out',
					'size-full p-4',
					className,
				)}
				{...props}
			>
				{children}
			</div>
		</div>,
		document.body,
	);
}
