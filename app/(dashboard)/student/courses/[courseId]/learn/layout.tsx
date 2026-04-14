export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-[#0A1628] flex flex-col">
      {children}
    </div>
  );
}
