import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Loader from "../components/Loader/loader";
import useAuthStore from "../utils/store";

// Fetch all magazine types - this will always show all magazines regardless of articles
const fetchAllMagazines = async () => {
    try {
        // Get publications from the store
        const publications = useAuthStore.getState().publications;
        
        // Filter only active publications and map them to the required format
        const allMagazines = publications
            .filter(pub => pub.status === 'Active')
            .map(pub => ({
                id: pub.id,
                title: pub.display_name || pub.name,
                cover_image: pub.cover_image,
                publish_date: 'All Issues',
                magazine_type: pub.name,
                description: pub.description
            }));
        
        return allMagazines;
        
    } catch (error) {
        console.error("Error fetching magazines:", error);
        return [];
    }
};



const HilalArchives = () => {
  // Get publications from store
  const publications = useAuthStore((state) => state.publications);
  const loadingPublications = useAuthStore((state) => state.loadingPublications);
  
  const { data: archiveData = [], isLoading, error } = useQuery({
    queryKey: ["allMagazines", publications.length], // Include publications length to refetch when publications change
    queryFn: fetchAllMagazines,
    enabled: !loadingPublications && publications.length > 0, // Only run when publications are loaded
  });

  if (isLoading || loadingPublications) return <Loader />;
  if (error) return <p>Error fetching archives</p>;

  return (
    <>
      <div className="bg-white">
        {/* Header */}
        <div className="px-3 sm:px-6 pt-3 sm:pt-4">
          <h1 className="text-lg sm:text-2xl font-medium uppercase tracking-tight text-[#DF1600] font-[Poppins] mt-1 sm:mt-2">
            HILAL MAGAZINES
          </h1>
        </div>

        {/* Grid + Red Line */}
        <div className="px-3 sm:px-6 py-3 sm:py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
            {/* Red Line */}
            <div className="col-span-full border-t-[3px] border-[#DF1600] mb-1 sm:mb-2" />

            {/* Magazine Items */}
            {archiveData.length === 0 ? (
              <p className="text-center text-gray-500 font-poppins text-lg col-span-full">
                No magazines found.
              </p>
            ) : (
              archiveData.map((magazine) => (
                <Link
                  key={magazine.id}
                  to={`/magazines?publication=${encodeURIComponent(magazine.magazine_type)}`}
                  className="border border-gray-200 shadow-sm bg-white overflow-hidden transform transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={magazine.cover_image}
                      alt={magazine.title}
                      className="w-full aspect-[3/4] object-cover"
                    />
                  </div>
                  <div className="p-1.5 sm:p-2">
                    <h3 className="text-xs sm:text-sm font-medium text-gray-800 text-center leading-tight">
                      {magazine.title}
                    </h3>
                    <p className="text-xs text-gray-500 text-center mt-0.5">
                      {magazine.description}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HilalArchives;