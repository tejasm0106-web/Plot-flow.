export const INITIAL_PROJECTS = [
  {
    id: 'ts_01',
    name: 'Prestige Sanctuary Greens',
    developer: 'Prestige Plotted Townships',
    developerId: 'dev_prestige',
    tagline: 'Ultra-Luxury Plotted Enclave overlooking Nandi Hills Corridor',
    location: 'Devanahalli, North Bengaluru',
    city: 'Bengaluru',
    totalAcres: '45 Acres',
    totalPlots: 120,
    availablePlots: 34,
    pricePerSqFt: 4850,
    priceRange: '₹58.2 Lakh - ₹1.45 Cr',
    approvalAuthority: 'BDA & BIAPPA Sanctioned',
    reraApproved: true,
    reraId: 'PRM/KA/RERA/1250/303/PR/210324/004055',
    reraDate: '2024-03-24',
    possessionDate: 'Ready for Registration (Phase 1) / Dec 2026 (Phase 2)',
    rating: 4.9,
    reviewsCount: 128,
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Prestige Sanctuary Greens is an expansive 45-acre master-planned plotted enclave situated on the high-growth STRR and Kempegowda International Airport economic corridor. Boasting 40ft asphalt roads, 100% underground cabling, high-yield soil landscaping, and an Olympic-sized central clubhouse.',
    amenities: [
      'Grand 25,000 sq.ft Clubhouse',
      'Olympic Length Swimming Pool',
      '100% Underground Cabling & FTTH',
      '40ft & 60ft Internal Asphalt Roads',
      '3-Tier 24/7 Security with Smart Boom Barriers',
      'EV Charging Stations across Avenue Roads',
      'Jogging & Cycling Track (2.4 km Loop)',
      'Sewage Treatment Plant & Rainwater Harvesting'
    ],
    distanceBenchmarks: [
      { place: 'Kempegowda Intl. Airport (BLR)', distance: '14 Mins (11.2 km)' },
      { place: 'Devanahalli SEZ & Aerospace Park', distance: '8 Mins (6.5 km)' },
      { place: 'STRR 6-Lane Expressway Exit', distance: '3 Mins (1.8 km)' },
      { place: 'Hebbal Flyover / Outer Ring Road', distance: '28 Mins (24 km)' }
    ],
    plots: [
      {
        id: 'p_101',
        number: 'P-101',
        sizeSqFt: 1500,
        dimension: '30 x 50 ft',
        facing: 'East',
        vastuScore: 96,
        priceNumber: 7275000,
        price: '₹72.75 Lakh',
        status: 'Available', // 'Available' | 'Reserved' | 'Booked'
        elevation: 'Park Facing with Sunrise View',
        roadWidth: '40ft Internal Asphalt Road',
        cornerPlot: false,
        amenitiesDistance: '40m to Central Clubhouse'
      },
      {
        id: 'p_102',
        number: 'P-102',
        sizeSqFt: 1200,
        dimension: '30 x 40 ft',
        facing: 'North',
        vastuScore: 94,
        priceNumber: 5820000,
        price: '₹58.20 Lakh',
        status: 'Available',
        elevation: 'North-East Kuber Vastu Alignment',
        roadWidth: '40ft Avenue Road',
        cornerPlot: true,
        amenitiesDistance: '80m to Tennis Court'
      },
      {
        id: 'p_103',
        number: 'P-103',
        sizeSqFt: 2400,
        dimension: '40 x 60 ft',
        facing: 'East',
        vastuScore: 98,
        priceNumber: 11640000,
        price: '₹1.16 Cr',
        status: 'Reserved',
        elevation: 'Clubhouse View & Dual Corner Access',
        roadWidth: '60ft Boulevard',
        cornerPlot: true,
        amenitiesDistance: 'Direct Promenade Access'
      },
      {
        id: 'p_104',
        number: 'P-104',
        sizeSqFt: 1800,
        dimension: '30 x 60 ft',
        facing: 'West',
        vastuScore: 88,
        priceNumber: 8730000,
        price: '₹87.30 Lakh',
        status: 'Available',
        elevation: 'Overlooking Sunset Eco Lake',
        roadWidth: '40ft Internal Road',
        cornerPlot: false,
        amenitiesDistance: '120m to Main Gate'
      },
      {
        id: 'p_105',
        number: 'P-105',
        sizeSqFt: 1500,
        dimension: '30 x 50 ft',
        facing: 'North-East',
        vastuScore: 99,
        priceNumber: 7450000,
        price: '₹74.50 Lakh',
        status: 'Booked',
        elevation: 'Prime Ishanya Corner with Green Verge',
        roadWidth: '40ft Road',
        cornerPlot: true,
        amenitiesDistance: '60m to Children Play Area'
      },
      {
        id: 'p_106',
        number: 'P-106',
        sizeSqFt: 2400,
        dimension: '40 x 60 ft',
        facing: 'North',
        vastuScore: 95,
        priceNumber: 11800000,
        price: '₹1.18 Cr',
        status: 'Available',
        elevation: 'Grand Boulevard Frontage',
        roadWidth: '60ft Boulevard Road',
        cornerPlot: false,
        amenitiesDistance: '100m to Clubhouse'
      },
      {
        id: 'p_107',
        number: 'P-107',
        sizeSqFt: 4000,
        dimension: '50 x 80 ft',
        facing: 'East',
        vastuScore: 97,
        priceNumber: 19800000,
        price: '₹1.98 Cr',
        status: 'Available',
        elevation: 'Estate Villa Plot with Hilltop Panorama',
        roadWidth: '60ft Boulevard',
        cornerPlot: true,
        amenitiesDistance: 'Private Cul-de-sac Entrance'
      },
      {
        id: 'p_108',
        number: 'P-108',
        sizeSqFt: 1200,
        dimension: '30 x 40 ft',
        facing: 'South',
        vastuScore: 82,
        priceNumber: 5650000,
        price: '₹56.50 Lakh',
        status: 'Available',
        elevation: 'Quiet Residential Loop',
        roadWidth: '30ft Internal Road',
        cornerPlot: false,
        amenitiesDistance: '150m to Clubhouse'
      }
    ]
  },
  {
    id: 'ts_02',
    name: 'Green Valley Eco Enclave',
    developer: 'Green Valley Developers Pvt Ltd',
    developerId: 'dev_greenvalley',
    tagline: 'Sustainable Plotted Community with 30-Year Clean Title Guarantee',
    location: 'Sarjapur Extn, East Bengaluru',
    city: 'Bengaluru',
    totalAcres: '28 Acres',
    totalPlots: 85,
    availablePlots: 18,
    pricePerSqFt: 3650,
    priceRange: '₹43.8 Lakh - ₹87.6 Lakh',
    approvalAuthority: 'BMRDA & RERA Approved',
    reraApproved: true,
    reraId: 'PRM/KA/RERA/1251/308/PR/220815/005120',
    reraDate: '2022-08-15',
    possessionDate: 'Immediate Registration',
    rating: 4.8,
    reviewsCount: 94,
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Green Valley Eco Enclave brings together tranquil botanical surroundings and rapid tech corridor connectivity. Located off Sarjapur road, this layout is fully certified with nil-encumbrance records spanning 30 years and instant bank pre-approvals from SBI & HDFC.',
    amenities: [
      'Solar Powered Street Lighting',
      'Organic Fruit Orchard & Butterfly Garden',
      'Multi-purpose Badminton & Pickleball Courts',
      'Rainwater Percolation Pits every 30m',
      'Automated Underground Drip Irrigation',
      'Perimeter Electric Fencing & CCTV Grid'
    ],
    distanceBenchmarks: [
      { place: 'Wipro Kodathi SEZ Campus', distance: '18 Mins (12.4 km)' },
      { place: 'Sarjapur Town Center', distance: '6 Mins (3.8 km)' },
      { place: 'Carmelaram Railway / Metro Hub', distance: '22 Mins (16 km)' }
    ],
    plots: [
      {
        id: 'p_201',
        number: 'A-01',
        sizeSqFt: 1200,
        dimension: '30 x 40 ft',
        facing: 'East',
        vastuScore: 95,
        priceNumber: 4380000,
        price: '₹43.80 Lakh',
        status: 'Available',
        elevation: 'Facing Botanical Herbal Park',
        roadWidth: '40ft Internal Road',
        cornerPlot: true,
        amenitiesDistance: '30m to Central Garden'
      },
      {
        id: 'p_202',
        number: 'A-02',
        sizeSqFt: 1500,
        dimension: '30 x 50 ft',
        facing: 'North-East',
        vastuScore: 98,
        priceNumber: 5475000,
        price: '₹54.75 Lakh',
        status: 'Booked',
        elevation: 'Corner Plot with Wide Turning Radius',
        roadWidth: '40ft Road',
        cornerPlot: true,
        amenitiesDistance: '50m to Clubhouse'
      },
      {
        id: 'p_203',
        number: 'A-03',
        sizeSqFt: 2000,
        dimension: '40 x 50 ft',
        facing: 'North',
        vastuScore: 92,
        priceNumber: 7300000,
        price: '₹73.00 Lakh',
        status: 'Available',
        elevation: 'Wide 40ft Main Entry Avenue',
        roadWidth: '40ft Avenue',
        cornerPlot: false,
        amenitiesDistance: '80m to Sports Arena'
      },
      {
        id: 'p_204',
        number: 'A-04',
        sizeSqFt: 2400,
        dimension: '40 x 60 ft',
        facing: 'East',
        vastuScore: 96,
        priceNumber: 8760000,
        price: '₹87.60 Lakh',
        status: 'Reserved',
        elevation: 'Prime Corner with Park Facing Verge',
        roadWidth: '40ft Road',
        cornerPlot: true,
        amenitiesDistance: '40m to Club'
      }
    ]
  },
  {
    id: 'ts_03',
    name: 'Brigade Horizon Woods',
    developer: 'Brigade Group Lands',
    developerId: 'dev_brigade',
    tagline: 'Premium Forest-Themed Townships with Direct Mysore Expressway Link',
    location: 'Mysore Road / Bidadi Growth Hub',
    city: 'Bengaluru',
    totalAcres: '50 Acres',
    totalPlots: 160,
    availablePlots: 45,
    pricePerSqFt: 2950,
    priceRange: '₹35.4 Lakh - ₹70.8 Lakh',
    approvalAuthority: 'BMRDA & K-RERA Sanctioned',
    reraApproved: true,
    reraId: 'PRM/KA/RERA/1252/310/PR/230110/005690',
    reraDate: '2023-01-10',
    possessionDate: 'Immediate Registration',
    rating: 4.7,
    reviewsCount: 82,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Directly off the 10-lane Bengaluru-Mysuru Expressway, Horizon Woods offers lush teakwood-lined avenues and complete municipal water connections.',
    amenities: [
      '15,000 sq.ft Clubhouse & Gym',
      'Teakwood & Gulmohar Tree-lined Avenues',
      'Underground Overhead Water Tank (200k Liters)',
      'Children Adventure Playscape',
      '24/7 Monitored CCTV Security'
    ],
    distanceBenchmarks: [
      { place: 'Bengaluru-Mysuru Expressway Toll', distance: '4 Mins (2.5 km)' },
      { place: 'Challaghatta Purple Line Metro', distance: '16 Mins (14 km)' }
    ],
    plots: [
      {
        id: 'p_301',
        number: 'H-10',
        sizeSqFt: 1200,
        dimension: '30 x 40 ft',
        facing: 'East',
        vastuScore: 94,
        priceNumber: 3540000,
        price: '₹35.40 Lakh',
        status: 'Available',
        elevation: 'Avenue View with Tree Canopy',
        roadWidth: '40ft Internal Road',
        cornerPlot: false,
        amenitiesDistance: '50m to Clubhouse'
      },
      {
        id: 'p_302',
        number: 'H-11',
        sizeSqFt: 1500,
        dimension: '30 x 50 ft',
        facing: 'North',
        vastuScore: 93,
        priceNumber: 4425000,
        price: '₹44.25 Lakh',
        status: 'Available',
        elevation: 'Corner Plot with North Vastu',
        roadWidth: '40ft Road',
        cornerPlot: true,
        amenitiesDistance: '70m to Park'
      }
    ]
  }
];

export const INITIAL_LEGAL_DOCUMENTS = [
  {
    id: 'doc_1',
    projectId: 'ts_01',
    projectName: 'Prestige Sanctuary Greens',
    title: 'RERA Sanctioned Master Layout Plan (Form 3)',
    category: 'RERA Sanction',
    authority: 'Karnataka Real Estate Regulatory Authority (K-RERA)',
    refNumber: 'K-RERA/PRM/KA/RERA/1250/303/PR/210324/004055',
    uploadDate: '2024-03-24',
    fileSize: '4.8 MB (PDF)',
    status: 'Verified',
    verifiedBy: 'PlotFlow Legal Compliance & K-RERA Registry Sync',
    description: 'Officially sanctioned layout plan displaying approved plot coordinates, arterial 60ft/40ft road widths, and open civic amenity reservations.'
  },
  {
    id: 'doc_2',
    projectId: 'ts_01',
    projectName: 'Prestige Sanctuary Greens',
    title: '30-Year Nil-Encumbrance Certificate (Form 15)',
    category: 'Land Revenue & Title Deed',
    authority: 'Senior Sub-Registrar Office, Devanahalli',
    refNumber: 'EC-BLR-DEV-2026-99812-F15',
    uploadDate: '2026-01-08',
    fileSize: '3.4 MB (PDF)',
    status: 'Verified',
    verifiedBy: 'State Government Kaveri-2 Registry Integration',
    description: 'Certified 30-year unbroken chain of title verifying free and marketable ownership with zero mortgage charges, attachments, or bank liens.'
  },
  {
    id: 'doc_3',
    projectId: 'ts_01',
    projectName: 'Prestige Sanctuary Greens',
    title: 'BDA / BIAPPA Agricultural to Residential Zonal Conversion',
    category: 'Zonal Sanction & Land Use',
    authority: 'Bangalore International Airport Area Planning Authority (BIAPPA)',
    refNumber: 'BIAPPA/TP/LAO/12/2023-24/C-89',
    uploadDate: '2023-11-15',
    fileSize: '6.2 MB (PDF)',
    status: 'Verified',
    verifiedBy: 'Town Planning & Revenue Department Audit',
    description: 'Formal Deputy Commissioner (DC) conversion sanction validating lawful transition from agricultural to permanent residential township zoning.'
  },
  {
    id: 'doc_4',
    projectId: 'ts_01',
    projectName: 'Prestige Sanctuary Greens',
    title: 'Advocate Search Report & Clean Title Opinion Certificate',
    category: 'Legal Due Diligence',
    authority: 'High Court Senior Real Estate Legal Council',
    refNumber: 'LEGAL-REP/BLR/2025/ADV-4410',
    uploadDate: '2025-08-20',
    fileSize: '2.1 MB (PDF)',
    status: 'Verified',
    verifiedBy: 'PlotFlow Senior Legal Council',
    description: 'Comprehensive 42-point title search confirming no litigation in any civil court, DRT, or revenue tribunal.'
  },
  {
    id: 'doc_5',
    projectId: 'ts_01',
    projectName: 'Prestige Sanctuary Greens',
    title: 'KSPCB Environmental Clearance & Water NOC',
    category: 'Environmental & Pollution NOC',
    authority: 'Karnataka State Pollution Control Board & BWSSB',
    refNumber: 'KSPCB/NOC/DEV/ENV-2025/3349',
    uploadDate: '2025-10-12',
    fileSize: '3.9 MB (PDF)',
    status: 'Verified',
    verifiedBy: 'State Environmental Compliance Directorate',
    description: 'Environmental impact assessment approval with sanctioned 200 KLD on-site sewage treatment and rainwater harvesting layout.'
  }
];

export const INITIAL_LEADS = [
  {
    id: 'lead_01',
    buyerName: 'Vikramaditya Sharma',
    email: 'vikram.sharma@techcorp.com',
    phone: '+91 98450 12345',
    townshipName: 'Prestige Sanctuary Greens',
    interestedPlot: 'P-101 (1,500 sq.ft, East)',
    budget: '₹75 Lakh',
    status: 'Site Visit Scheduled', // 'New Lead' | 'Site Visit Scheduled' | 'Token Advance Paid' | 'Sale Deed Registered'
    visitDate: '2026-08-29 (Saturday, 11:00 AM)',
    source: 'PlotFlow 3D Sun-Path Visualizer',
    notes: 'Looking for East-facing plot near clubhouse. Pre-approved home loan from SBI.'
  },
  {
    id: 'lead_02',
    buyerName: 'Ananya Deshmukh',
    email: 'ananya.d@fintech.io',
    phone: '+91 99801 88721',
    townshipName: 'Prestige Sanctuary Greens',
    interestedPlot: 'P-104 (1,800 sq.ft, Lake View)',
    budget: '₹90 Lakh',
    status: 'Token Advance Paid',
    visitDate: 'Completed on 2026-08-22',
    source: 'RERA Verification Vault',
    notes: 'Token of ₹25,000 received. Agreement drafting in progress with legal team.'
  },
  {
    id: 'lead_03',
    buyerName: 'Karthik Ramanathan',
    email: 'karthik.ram@global.in',
    phone: '+91 97412 55432',
    townshipName: 'Green Valley Eco Enclave',
    interestedPlot: 'A-01 (1,200 sq.ft, East)',
    budget: '₹45 Lakh',
    status: 'New Lead',
    visitDate: 'Requested for Sunday',
    source: 'Direct Portal Inquiry',
    notes: 'Interested in immediate registration for tax savings before Q3.'
  },
  {
    id: 'lead_04',
    buyerName: 'Dr. Suresh & Meera Hegde',
    email: 'hegde.suresh@apollo.org',
    phone: '+91 94480 67120',
    townshipName: 'Prestige Sanctuary Greens',
    interestedPlot: 'P-107 (4,000 sq.ft Villa Plot)',
    budget: '₹2.1 Cr',
    status: 'Site Visit Scheduled',
    visitDate: '2026-08-30 (Sunday, 3:30 PM)',
    source: 'Shortlist & Compare Tool',
    notes: 'Looking for large villa plot for retirement home with organic garden space.'
  }
];

export const DEMO_USERS = {
  superAdmin: {
    name: 'Tejas',
    email: 'tejastej094@gmail.com',
    role: 'SUPER_ADMIN',
    roleTitle: 'Master Platform Owner & Super Admin',
    securityPin: '2026'
  },
  developer: {
    name: 'Rohit Kulkarni',
    companyName: 'Prestige Plotted Townships',
    email: 'rohit@prestigeplotted.com',
    role: 'DEVELOPER',
    roleTitle: 'VP of Plotted Land Sales & Inventory',
    reraRegNumber: 'PRM/KA/RERA/1250/303/PR/210324/004055'
  },
  buyer: {
    name: 'Vikramaditya Sharma',
    email: 'vikram.sharma@techcorp.com',
    phone: '+91 98450 12345',
    role: 'BUYER',
    roleTitle: 'Verified Plot Buyer'
  }
};
