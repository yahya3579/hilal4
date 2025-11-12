import React from "react";
import { useContributorsByPublication } from "../hooks/useContributors";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const OurContributors = () => {
  const { data: contributorsData, isLoading, error } = useContributorsByPublication();

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading contributors...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-red-600">Error loading contributors: {error.message}</div>
        </div>
      </div>
    );
  }

  const getImageUrl = (coverImage) => {
    if (!coverImage) return null;
    return `${API_BASE_URL}/media/uploads/hilalteam/${coverImage}`;
  };

  const isUrduOrUrduKidsPublication = (publication) => {
    const text = `${publication?.name || ''} ${publication?.display_name || ''}`.toLowerCase();
    return (
      text.includes('urdu') ||
      text.includes('kids-urdu') ||
      text.includes('urdu-kids') ||
      text.includes('atfaal')
    );
  };

  return (
    <div className="bg-white min-h-screen px-4 sm:px-6 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-[#DF1600] font-poppins font-medium text-2xl sm:text-3xl mb-4">Hilal Magazine Team</h1>
      {contributorsData?.publications_with_contributors?.map((pubData) => (
        <div key={pubData.publication.id} className="mb-8">
          <h2 className="text-[#DF1600] font-poppins font-medium text-lg sm:text-xl uppercase mb-4">
            {pubData.publication.display_name}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {pubData.contributors.map((contributor) => (
              <div key={contributor.id} className="group rounded-xl border border-[#DF1600] bg-white overflow-hidden hover:shadow-md transition-all duration-200">
                <div className="w-full h-[160px] sm:h-[200px] bg-white overflow-hidden p-1 sm:p-2">
                  {contributor.cover_image ? (
                    <img
                      src={getImageUrl(contributor.cover_image)}
                      alt={contributor.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No Image
                    </div>
                  )}
                </div>
                <div className="px-3 py-2 border-t border-gray-100">
                  <span className="block w-8 h-0.5 bg-[#DF1600] mx-auto mb-2"></span>
                  <p
                    className={`text-center text-xs sm:text-sm ${isUrduOrUrduKidsPublication(pubData.publication) ? 'font-urdu-nastaliq-sm' : 'font-poppins'} text-gray-900`}
                    dir={isUrduOrUrduKidsPublication(pubData.publication) ? "rtl" : "ltr"}
                  >
                    {contributor.name}
                  </p>
                  {contributor.designation && (
                    <p
                      className={`text-center text-[11px] ${isUrduOrUrduKidsPublication(pubData.publication) ? 'font-urdu-nastaliq-sm' : 'font-poppins'} text-gray-500 mt-0.5`}
                      dir={isUrduOrUrduKidsPublication(pubData.publication) ? "rtl" : "ltr"}
                    >
                      {contributor.designation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Our Contributors Sections */}

       {/* Red Line */}
       <div className="w-full h-0 border-t-[2px] sm:border-t-[3px] border-[#DF1600] mb-2" />
      
{/* Our Contributors Title */}
<h1
  className="text-[#DF1600] font-medium text-2xl sm:text-[48px] leading-tight sm:leading-[100%] tracking-tight sm:tracking-[-0.03em] uppercase font-poppins text-center max-w-full sm:w-[459px] sm:h-[72px] mx-auto mb-4 sm:mb-6"
>
  OUR CONTRIBUTORS
</h1>

      {/* HILAL ENGLISH Submission Guidelines */}
<div className="mb-8">
  <h2 className="text-[#DF1600] font-poppins font-medium text-lg sm:text-xl uppercase mb-4">
    HILAL ENGLISH
  </h2>

  <p className="text-[#292D32] font-poppins text-sm sm:text-[19.32px] mb-4 leading-relaxed">
    PROSPECTIVE WRITERS ARE INVITED TO SUBMIT THEIR MANUSCRIPTS TO THE FOLLOWING EMAIL ADDRESSES:
  </p>

  {/* Updated Email Lines */}
  <div className="mb-6 space-y-2">
    <p className="text-[#292D32] font-poppins text-sm sm:text-[19.32px] leading-relaxed break-words">
      <span className="font-bold">HILAL ENGLISH:</span>{" "}
      <a href="mailto:hilal.english@gmail.com" className="underline hover:text-[#DF1600]">hilal.english@gmail.com</a>
    </p>
    <p className="text-[#292D32] font-poppins text-sm sm:text-[19.32px] leading-relaxed break-words">
      <span className="font-bold">HILAL URDU:</span>{" "}
      <a href="mailto:hilal.urdu@gmail.com" className="underline hover:text-[#DF1600]">hilal.urdu@gmail.com</a>
    </p>
    <p className="text-[#292D32] font-poppins text-sm sm:text-[19.32px] leading-relaxed break-words">
      <span className="font-bold">HILAL FOR HER:</span>{" "}
      <a href="mailto:hilal.forher@gmail.com" className="underline hover:text-[#DF1600]">hilal.forher@gmail.com</a>
    </p>
    <p className="text-[#292D32] font-poppins text-sm sm:text-[19.32px] leading-relaxed break-words">
      <span className="font-bold">HILAL FOR KIDS:</span>{" "}
      <a href="mailto:hilal.forkids@gmail.com" className="underline hover:text-[#DF1600]">hilal.forkids@gmail.com</a>
    </p>
  </div>

  {/* Submission Guidelines Heading (Black & Bold) */}
  <h3 className="text-black font-poppins font-bold text-base sm:text-lg uppercase mb-3">
    SUBMISSION REQUIREMENTS AND GUIDELINES:
  </h3>

  <ul className="text-[#292D32] font-poppins text-sm sm:text-[19.32px] leading-relaxed space-y-3 mb-6 list-disc pl-5">
    <li>WE ENCOURAGE ORIGINAL CONTENT EXCLUSIVELY WRITTEN FOR HILAL MAGAZINE. PREVIOUSLY PUBLISHED PIECES OR THOSE UNDER CONSIDERATION BY ANOTHER PUBLICATION WILL NOT BE ACCOMMODATED.</li>
    <li>DUE TO OUR MONTHLY SUBMISSION SCHEDULE, FREQUENCY, ARTICLES SHOULD BE WRITTEN AND SUBMITTED A MONTH IN ADVANCE. PLEASE CONSIDER THIS TIME FRAME ACCORDINGLY.</li>
    <li>LIMIT YOUR SUBMISSIONS TO ONE ARTICLE PER MONTH TO MAINTAIN EDITORIAL BALANCE.</li>
    <li>THE ARTICLE/REPORT/FEATURE/OPINION PIECE SHOULD BE CONCISE, CLEAR, AND WRITTEN IN A GRAMMATICALLY CORRECT MANNER.</li>
    <li>INCLUDE AN OUTLINE IN 70-80 WORDS HIGHLIGHTING THE SALIENT POINTS OF THE ARTICLE IN THE EMAIL.</li>
    <li>PROVIDE A SHORT BIOGRAPHY, A CLEAR PASSPORT-SIZED PICTURE OF THE AUTHOR SUPPORTING HIGH-RESOLUTION PHOTOGRAPHS FOR THE PIECE, AND CONTACT INFORMATION.</li>
  </ul>

  <h3 className="text-[#DF1600] font-poppins font-medium text-base sm:text-lg uppercase mb-3">
    RIGHTS AND REGULATIONS:
  </h3>

  <p className="text-[#292D32] font-poppins text-sm sm:text-[19.32px] leading-relaxed mb-6">
    WRITERS RETAIN INTELLECTUAL PROPERTY RIGHTS TO THEIR ORIGINAL CONTENT. HOWEVER, THE EDITORIAL TEAM RESERVES THE RIGHT TO EDIT ARTICLES TO MEET EDITORIAL POLICIES. SUBMISSION ALONE DOES NOT GUARANTEE PUBLICATION. BY CONTRIBUTING, AUTHORS AGREE TO THESE TERMS.
  </p>
</div>
{/* HILAL URDU Submission Guidelines */}
<div className="mb-8">
  <h2 className="text-[#DF1600] font-poppins font-medium text-lg sm:text-xl uppercase mb-4">
    HILAL URDU
  </h2>

  <p className="text-[#292D32] font-poppins text-sm sm:text-[19.32px] mb-4 leading-relaxed">
    IF YOU INTEND TO WRITE FOR HILAL MAGAZINE, DISCUSS THE TOPIC WITH EDITOR BY SENDING EMAIL AT HILALURDU@GMAIL.COM
  </p>

  {/* Black Bold Heading */}
  <h3 className="text-black font-poppins font-bold text-base sm:text-lg uppercase mb-3">
    SUBMISSION TIPS:
  </h3>

  <ul className="text-[#292D32] font-poppins text-sm sm:text-[19.32px] leading-relaxed space-y-3 mb-6 list-disc pl-5">
    <li>CONTENT TO BE SUBMITTED IN INPAGE / MS WORD (URDU).</li>
    <li>ARTICLES SHOULD NOT LESS THAN 1500 WORDS.</li>
    <li>PLEASE INCLUDE A SHORT BIOGRAPHY AND CONTACT INFORMATION WITH EACH SUBMISSION.</li>
    <li>PHOTOS FILE SIZE SHOULD BE AT LEAST 1 MB AND SIZE.</li>
  </ul>

  {/* Black Bold Heading */}
  <h3 className="text-black font-poppins font-bold text-base sm:text-lg uppercase mb-3">
    RIGHTS
  </h3>

  <p className="text-[#292D32] font-poppins text-sm sm:text-[19.32px] leading-relaxed mb-6">
    AUTHORS RETAIN ALL RIGHTS TO THEIR ORIGINAL MATERIAL. HOWEVER, WE RESERVE THE RIGHT TO EDIT ARTICLES TO MEET THE SPACE AND POLICY REQUIREMENTS. ARTICLE SUBMISSION DOES NOT GUARANTEE PUBLICATION. ORGANIZATION RESERVES THE RIGHT TO PUBLISH OR NOT TO PUBLISH ANY CONTENT SUBMITTED. BY CONTRIBUTING TO HILAL, YOU AGREE TO THESE TERMS.
  </p>

  {/* Black Bold Heading */}
  <h3 className="text-black font-poppins font-bold text-base sm:text-lg uppercase mb-3">
    CATEGORIES OF MAGAZINE:
  </h3>

  <div className="text-[#292D32] font-poppins text-sm sm:text-[19.32px] leading-relaxed space-y-2 mb-6">
    <p>EDITORIAL</p>
    <p>NATIONAL AND INTERNATIONAL ISSUES</p>
    <p>GHAZI-O-SHAHUDA</p>
    <p>YOUNG-E-PAKISTAN</p>
    <p>YOUNG-E-AZADI</p>
    <p>MAHAOITAT (ENVIRONMENT)</p>
    <p>BIAG-E-TORIAL</p>
    <p>BIAG-E-QUAD</p>
    <p>YOUNG-E-DEFEND (DEFENSE DAY)</p>
    <p>INTERVIEWS</p>
    <p>SHER-O-ADAB</p>
    <p>HEALTH</p>
    <p>MUTAFARIQAT (MISCELLANEOUS)</p>
  </div>
</div>


{/* HILAL FOR HER Section */}
<div className="mb-8">
  <h2 className="text-[#DF1600] font-poppins font-medium text-xl sm:text-2xl uppercase leading-tight mb-4">
    Hilal for Her
  </h2>
  <p className="text-[#000000] font-poppins text-sm sm:text-[19.32px] font-normal leading-relaxed tracking-tight whitespace-pre-line">
    Empowerment in its raw form doesn't mean to give power to someone but to understand the factors which hamper women's progress and gives them enough strength, support and to help them achieve what they deserve. Thanks to the institution of motherhood, and the willingness on part of their male partners; women have withstood difficulties and paved their way through challenging environments. Today's woman is greatly contributing to actually revolutionizing and bringing positive fortune to the society. Now she is in every field; she is a banker, a soldier, an artist, an astronaut etc. We have women excelling and outshining in the defence forces, law enforcement & intelligence agencies, government and semi-government organizations, private and industrial sectors, IT and communication, media and transport and more importantly, at home.

    Hilal for Her is a tribute to this fact of life. Pakistan Armed Forces are providing women full representation and opportunity of a career. We believe in encouraging them, promoting and protecting their sense of identity and conviction, galvanizing their talent and potential through education and knowledge. Hilal for Her is just one part of the role the Armed Forces are playing in contributing to the cause. We are confident that this will inspire and educate our womenfolk, who can play an effective and vibrant role towards bringing a progressive change in the society. In our efforts, Quaid's vision provides guiding inspiration: "There are two powers in the world; one is the sword and the other is the pen. There is a great competition and rivalry between the two. There is a third power stronger than both, that of the women."

    The objectives of Hilal For Her is about celebrating the role that women of our country have played in its creation, educating and inspiring the youth of today about the importance of the role of women in the evolution and advancement of society, increasing awareness that women have it in them to change the course not only of their own lives but that of history, creation of cognizance among women that empowerment is to realize one's potential and garner support and encouragement to achieve greatness, proved to be in line with the pulse of the society, as demonstrated by the rave reviews we got.

    It needs mention here, that despite what the name of the magazine might lead one to believe, the target readership comprises both women and men, because the issues that will be highlighted are societal and not limited to any one particular gender.
    Hilal For Her is an endeavor to celebrate, educate with inspiration, and increase awareness about the power of women by highlighting many achievements of the women of Pakistan. The importance of hard work, determination, passion and the will to rise despite the many hurdles, is the focus of the articles contained in this issue.

    It is heartening to see that the Pakistani society is readier than ever, to evolve and advance by embracing the accomplishments of its women in every field and empowering those who are still in the shadows waiting to realize their potential. We hope for a future, where there will be abundant opportunities and every person, be it man or woman, will be able to grow and be who they want, commensurate with their potential, making use of the talents they are bestowed with, and become productive citizens of this great nation of ours.
  </p>
</div>

{/* HILAL FOR KIDS Section */}
<div className="mb-8">
  <h2 className="text-[#DF1600] font-poppins font-medium text-xl sm:text-2xl uppercase leading-tight mb-4">
    Hilal for Kids
  </h2>
  <p className="text-[#000000] font-poppins text-sm sm:text-[19.32px] font-normal leading-relaxed tracking-tight whitespace-pre-line">
    Hilal Publications is proudly publishing now five separately combined monthly magazines - Hilal English, Hilal Urdu, Hilal for Her, Hilal for Kids (English) - Hilal braey Atfaal (Urdu), and Monthly Press Review (MPR) (English). The main Hilal (English) and Hilal (Urdu) cover subjects of security concerns and other motivational stories for the consumption of national as well as international readership. Hilal for Her addresses the women related subjects highlighting their interests, latest trends and fashions, besides the issues and problems they are facing in various capacities. Hilal for Kids (English portion) focuses on the children as well as youth between 5 to 18 years of age while Hilal braey Atfaal (Urdu portion) addresses children of age between 4 to 12 years.

    Hilal for Kids have covered a number of unique and untouched issues relating to the health, education, sport, physical and mental training, skill and technological learning and career oriented subjects. The mission statement of Hilal for Kids fundamentally includes how to cope with the information deluge, how to sift useful information and use it into our own benefit, and how to convert that information into positive knowledge in order to enhance capacity of brain, its receptibility and reflection, and the IQ level. It is aimed to shift the mindset from soft understanding to learning hardcore useful and implementable scientific and high-tech knowledge into the domains that reach underground, underwater, on-ground, in-air, space and beyond in the constellation and cosmos. From human intelligence to artificial intelligence, cyberspace to hybrid warfare and from handwriting to e-writing and brail-reading it has to be adopted not only meticulously but also mathematically.
  </p>
</div>
      </div>
    </div>
  );
};

export default OurContributors;