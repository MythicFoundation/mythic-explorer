import SearchBar from "@/components/SearchBar";

export default function NotFound() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
      <div className="w-16 h-16 mx-auto bg-[#39FF14]/[0.06] border border-[#39FF14]/20 flex items-center justify-center mb-6">
        <span className="font-display font-bold text-[1.2rem] text-[#39FF14]">404</span>
      </div>
      <h1 className="font-display font-bold text-[1.4rem] tracking-[0.04em] text-white">Not Found</h1>
      <p className="font-mono text-[0.65rem] text-[#555568] max-w-md mx-auto">
        The transaction, address, or block you are looking for could not be found on the network.
      </p>
      <div className="max-w-xl mx-auto pt-4">
        <SearchBar />
      </div>
    </div>
  );
}
