import SearchBar from "@/components/SearchBar";

export default function NotFound() {
  return (
    <div className="space-y-6 text-center py-12">
      <h1 className="font-heading font-bold text-3xl text-white">Not Found</h1>
      <p className="text-mythic-muted">
        The transaction, address, or block you are looking for could not be found.
      </p>
      <div className="max-w-xl mx-auto">
        <SearchBar />
      </div>
    </div>
  );
}
