import { useEffect, useState } from "react";

const About = () => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const teamMembers = [
    {
      name: "Ni Gusti Ayu Mutiara Indriyani",
      role: "Project Manager",
      kelas: "FC-32",
      image: "/images/Muti.jpg",
      campus: "Universitas Gunadarma",
      linkedin:
        "https://linkedin.com/in/ni-gusti-ayu-mutiara-indriyani-88447620b/",
    },
    {
      name: "Galih Bayu Pamungkas",
      role: "Frontend Developer",
      kelas: "FC-35",
      image: "/images/Galih.jpg",
      campus: "Universitas Gunadarma",
      linkedin: "https://linkedin.com/in/galih-bayu-pamungkas-3856b42b5",
    },
    {
      name: "Fadiah Ahmad",
      role: "Backend Developer",
      kelas: "FC-29",
      image: "/images/Fadiah.jpg",
      campus: "Universitas Gunadarma",
      linkedin: "https://linkedin.com/in/fadiahmd/",
    },
    {
      name: "Masahiro Gerarudo Yamazaki",
      role: "Machine Learning Engineer",
      kelas: "MC-12",
      image: "/images/Hiro.jpg",
      campus: "Universitas Gunadarma",
      linkedin: "https://linkedin.com/in/masayama240303/",
    },
    {
      name: "Jessica Theresia",
      role: "Machine Learning Engineer",
      kelas: "MC-51",
      image: "/images/jj.jpg",
      campus: "Universitas Gunadarma",
      linkedin: "https://linkedin.com/in/jessica-trs/",
    },
    {
      name: "Fadilah Kurniawan Hadi",
      role: "Machine Learning Engineer",
      kelas: "MC-35",
      image: "/images/L.jpg",
      campus: "Universitas Gunadarma",
      linkedin: "https://linkedin.com/in/fadilah-kurniawan-h-a59349218/",
    },
  ];

  const openModal = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMember(null);
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="bg-gradient-to-br from-derma-cream to-derma-peach py-20 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-derma-rose rounded-full opacity-60 animate-pulse"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-derma-salmon rounded-full opacity-40"></div>
        <div className="absolute bottom-16 left-1/4 w-12 h-12 bg-primary-300 rounded-full opacity-50"></div>
        <div className="absolute bottom-10 right-10 w-24 h-24 bg-derma-peach rounded-full opacity-30"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent">
                Dermalyze
              </span>{" "}
              Super Team
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Berikut adalah orang-orang hebat di balik Dermalyze, yang
              berkomitmen menghadirkan solusi analisis kulit berbasis AI terbaik
              untuk Anda.
            </p>
          </div>
        </div>
      </header>

      {/* Team Section */}
      <section
        className="py-20 bg-gradient-to-b from-white to-derma-cream/20"
        aria-label="Team members"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            role="list"
          >
            {teamMembers.map((member, index) => (
              <article
                key={index}
                className="text-center cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl rounded-xl p-6 bg-gradient-to-br from-white to-derma-cream border border-primary-100 hover:border-primary-300"
                role="listitem"
                onClick={() => openModal(member)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openModal(member);
                  }
                }}
                aria-label={`Lihat detail profil ${member.name}`}
              >
                <figure className="mb-4">
                  <img
                    src={member.image}
                    alt={`Foto profil ${member.name}`}
                    className="w-48 h-48 rounded-full mx-auto object-cover border-4 border-primary-200 transition-all duration-300 hover:border-primary-400"
                  />
                </figure>
                <header>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {member.name}
                  </h3>
                  <p className="text-primary-500 font-medium mb-3" role="text">
                    {member.role}
                  </p>
                </header>
                <div className="mt-4 px-4 py-2 bg-primary-50 rounded-full border border-primary-200">
                  <p className="text-primary-600 text-sm font-medium">
                    Klik untuk detail
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Profile Preview Modal */}
      {isModalOpen && selectedMember && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="bg-gradient-to-br from-white to-derma-cream/70 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transform transition-all duration-300 scale-100 border-2 border-primary-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                aria-label="Tutup modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 text-center">
              {/* Profile Image */}
              <div className="mb-6">
                <img
                  src={selectedMember.image}
                  alt={`Foto profil ${selectedMember.name}`}
                  className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-primary-200 shadow-lg"
                />
              </div>

              {/* Member Info */}
              <div className="space-y-4">
                <div>
                  <h2
                    id="modal-title"
                    className="text-2xl font-bold text-gray-900 mb-2"
                  >
                    {selectedMember.name}
                  </h2>
                  <p className="text-primary-500 font-semibold text-lg">
                    {selectedMember.role}
                  </p>
                  {selectedMember.kelas && (
                    <p className="text-gray-600 font-medium text-base mt-1">
                      {selectedMember.kelas}
                    </p>
                  )}
                </div>

                <div className="bg-gradient-to-r from-derma-cream to-derma-peach/50 rounded-lg p-4 border border-primary-100">
                  <div className="flex items-center justify-center mb-2">
                    <svg
                      className="w-5 h-5 text-gray-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-2 4h2M7 7h2v2H7V7zm0 4h2v2H7v-2z"
                      />
                    </svg>
                    <span className="text-gray-700 font-medium">Kampus</span>
                  </div>
                  <p className="text-gray-600">{selectedMember.campus}</p>
                </div>

                <div className="pt-4">
                  <a
                    href={selectedMember.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    LinkedIn Profile
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default About;
