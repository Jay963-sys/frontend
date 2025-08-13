export default function ResponsiveDashboardLayout({ children }) {
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 md:px-8 lg:px-10 xl:px-12 max-w-screen-xl mx-auto w-full">
      {children}
    </div>
  );
}
