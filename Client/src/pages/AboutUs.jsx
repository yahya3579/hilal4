
import React from 'react';

const AboutUs = () => {
  return (
    <div className="min-h-screen px-6 py-10 bg-white sm:px-6 md:px-8 lg:px-12 xl:px-16">
      {/* Red Line */}
      <div className="w-full h-0 border-t-[3px] border-[#DF1600] mb-2" />

      {/* About Us Title */}
      <h1 className="text-[#DF1600] font-medium text-xl sm:text-2xl uppercase mb-6 sm:mb-8">
        About Us
      </h1>

      {/* Main Content */}
      <div className="text-base sm:text-[19.32px] font-[400] text-[#292D32] leading-[160%] tracking-[-0.03em] capitalize font-poppins space-y-6 sm:space-y-8">
        <p>
          ISPR Publications started as weekly Urdu Magazine in 1948 under the name 'Mujahid', that holds the distinction of featuring congratulatory messages from the Founder of Pakistan and other prominent civil and military leaders in its early editions. The magazine's evolution mirrors the trajectory of Pakistan, capturing historical events from the 1948 onwards. The archives of magazine offer a unique window into events that might have otherwise faded from historical memory. In 1951, another magazine with the name of Hilal started its publication as a bi-weekly frequency. It briefly became a daily publication in October 1952 before returning to a weekly format in 1964 where as `Mujahid` stopped its publication in 1952.
        </p>

        <p>
          In August 2007, Hilal expanded its horizons by introducing an English edition alongside its Urdu counterpart, publishing both as a single monthly bilingual magazine. Since November 2014, Hilal English and Hilal Urdu have been published as separate magazines.
        </p>

        <p>
          Hilal Urdu and English serve as a platform advocating for the men and women in uniform who proudly serve the country. It simultaneously addresses national security interests and promotes awareness of the vital role played by the Pakistan Armed Forces in the past, present, and future. The editorial team focuses on identifying critical issues, publishing precise and timely analyses, offering diverse perspectives on national and international matters, geopolitics, the evolving security landscape, strategic concerns, human security, and the economy. Hilal aims to inform, educate, motivate, and instruct readers through analytical articles, providing insights from subject-matter experts.
        </p>

        <p>
          In 2018, Hilal extended its reach further by launching Hilal for Her in English and Hilal for Kids in both English and Urdu. Hilal for Her pays tribute to the women of the Armed Forces, encouraging, promoting, and protecting their identity and convictions. The magazine aims to inspire and educate women to play an effective and vibrant role in bringing about progressive change in society. Hilal for Kids covers various issues related to health, education, sports, physical and mental training, skills, and technological learning, fostering a mindset shift from soft understanding to acquiring hardcore, useful, and implementable knowledge.
        </p>

        <p>
          Hilal Publications also houses a Book Section responsible for publishing books on subjects ranging from history and the ideology of Pakistan to the sacrifices of the Armed Forces, the 1965 War, and the War on Terror. Several books have been published and are available across Pakistan at various bookstores.
        </p>

        <p>
          Throughout its more than three-quarters of a century legacy, Hilal has grown steadily in terms of circulation, scope, and influence. As a premier defense print publication, it remains dedicated to delivering trustworthy, comprehensive analysis and information related to Pakistan. In a rapidly evolving world shaped by technological advancements and increasing complexity, Hilal continues to adapt and develop, playing a central role in preserving national identity and fostering cohesion while providing open-source intelligence to its audience
        </p>
      </div>
    </div>
  );
};

export default AboutUs;