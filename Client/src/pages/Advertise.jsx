import React from "react";

const Advertise = () => {
  return (
    <div className="bg-white min-h-screen px-4 sm:px-6 py-6 sm:py-8">
      {/* Red Line */}
      <div className="w-full h-0 border-t-[2px] sm:border-t-[3px] border-[#DF1600] mb-2" />

      {/* Our Contributors Title */}
      <h1 className="text-[#DF1600] font-medium text-lg sm:text-2xl tracking-tight uppercase font-poppins mb-4 sm:mb-6">
        ADVERTISEMENT
      </h1>

      {/* Inquiry Text */}
      <p className="text-[#292D32] font-poppins text-sm sm:text-[19.32px] capitalize mb-4 sm:mb-6 leading-relaxed">
        To inquire about advertising opportunities, please contact:
      </p>

      {/* Muhammad Bilal Section */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-[#292D32] font-poppins font-bold text-lg sm:text-2xl capitalize mb-2">
          Muhammad Bilal
        </h2>
        <p className="text-[#292D32] font-poppins italic text-sm sm:text-[19.32px] capitalize leading-relaxed">
          Assistant Manager Outreach & Marketing
        </p>
        <p className="mt-3 sm:mt-4 text-[#292D32] font-poppins text-sm sm:text-[19.32px] capitalize leading-relaxed">
          The Pakistan Armed Forces Magazine, Inter-Services Public Relations
          Hilal Road, Rawalpindi.
        </p>
      </div>

      {/* To Advertise Section */}
      <div className="mb-6">
        <h3 className="text-[#DF0404] font-poppins font-bold text-sm sm:text-[19.32px] capitalize mb-3 sm:mb-4">
          To advertise with us:
        </h3>

        <div className="space-y-3 sm:space-y-2 mb-4">
          <p className="text-[#292D32] font-poppins text-sm sm:text-[19.32px] capitalize break-all sm:break-normal leading-relaxed">
            For info:{" "}
            <span
              className="underline hover:text-[#DF1600] transition-colors cursor-pointer"
              onClick={() =>
                (window.location.href = "mailto:chbilal.hilal@gmail.com")
              }
            >
              chbilal.hilal@gmail.com
            </span>
          </p>
          <p className="text-[#292D32] font-poppins text-sm sm:text-[19.32px] capitalize break-all sm:break-normal leading-relaxed">
            For Ad submission:{" "}
            <span
              className="underline hover:text-[#DF1600] transition-colors cursor-pointer"
              onClick={() =>
                (window.location.href = "mailto:hilal.ads786@gmail.com")
              }
            >
              hilal.ads786@gmail.com
            </span>
          </p>
        </div>

        {/* Phone Icon and Number */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="#DF1600"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            className="sm:w-6 sm:h-6 flex-shrink-0"
          >
            <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1c-9.39 0-17-7.61-17-17a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
          </svg>

          <span className="text-[#292D32] font-poppins text-sm sm:text-[19.32px] capitalize">
            051-6104118
          </span>
        </div>
      </div>

      {/* Footer Note */}
      <p className="mt-6 sm:mt-8 text-[#676767] font-poppins text-xs sm:text-[19.32px] capitalize leading-relaxed">
        (Ad Hilal Magazines Title Pages Mock-ups or other options for designing)
      </p>
    </div>
  );
};

export default Advertise;
