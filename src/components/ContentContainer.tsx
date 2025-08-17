export function ContentContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 justify-center items-start overflow-hidden py-4 px-0 md:px-4">
      <div className="w-full h-full max-w-full md:max-w-7xl md:border md:shadow-lg md:rounded-lg md:bg-white">
        {children}
      </div>
    </div>
  );
}
