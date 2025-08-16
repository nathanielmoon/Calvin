export function ContentContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 justify-center items-start overflow-hidden py-4">
      <div className="w-full h-full max-w-full md:max-w-7xl">{children}</div>
    </div>
  );
}
