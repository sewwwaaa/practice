// Detailed SVG continent outlines for 1000x500 Robinson/Equirectangular projection
export const continentPaths = [
  // North America
  {
    id: 'north-america',
    name: 'North America',
    d: `M 155,50 
        L 180,48 L 220,52 L 255,45 L 290,55 L 295,75 L 280,95 L 260,100 L 275,120 L 290,135 
        L 282,145 L 275,165 L 265,185 L 250,195 L 235,190 L 220,210 L 205,225 L 195,240 
        L 180,230 L 165,220 L 155,200 L 140,190 L 130,175 L 125,155 L 120,130 L 115,100 
        L 125,80 L 145,60 Z
        M 100,75 L 130,65 L 145,80 L 135,105 L 110,110 L 95,95 Z
        M 190,120 L 230,115 L 245,130 L 235,155 L 205,160 L 180,145 Z
        M 160,160 L 175,155 L 190,170 L 185,185 L 165,190 L 150,180 Z
        M 180,210 L 200,205 L 210,220 L 195,235 L 175,225 Z
        M 225,185 L 245,180 L 250,195 L 235,200 Z`
  },
  // Greenland
  {
    id: 'greenland',
    name: 'Greenland',
    d: `M 320,30 L 370,25 L 395,45 L 380,75 L 350,90 L 325,80 L 315,55 Z`
  },
  // South America
  {
    id: 'south-america',
    name: 'South America',
    d: `M 235,245 L 260,240 L 290,250 L 330,270 L 365,295 L 375,325 L 355,360 L 335,400 
        L 315,440 L 295,465 L 285,455 L 290,420 L 285,380 L 275,340 L 260,300 L 240,270 L 230,255 Z
        M 305,470 L 315,465 L 310,480 L 300,480 Z`
  },
  // Europe
  {
    id: 'europe',
    name: 'Europe',
    d: `M 460,110 L 485,95 L 510,90 L 535,85 L 555,100 L 550,120 L 530,135 L 515,145 
        L 490,155 L 465,160 L 450,150 L 445,130 L 455,115 Z
        M 455,95 L 475,85 L 480,105 L 465,115 L 450,105 Z
        M 440,115 L 450,110 L 452,125 L 442,130 Z
        M 480,70 L 500,55 L 525,60 L 515,85 L 490,95 L 475,80 Z
        M 435,145 L 455,140 L 450,165 L 430,165 Z
        M 485,150 L 495,145 L 498,165 L 488,170 Z
        M 505,150 L 520,155 L 515,170 L 500,165 Z`
  },
  // Africa
  {
    id: 'africa',
    name: 'Africa',
    d: `M 450,175 L 485,170 L 530,180 L 565,200 L 585,230 L 565,260 L 555,290 L 545,330 
        L 530,370 L 510,390 L 490,380 L 475,340 L 460,300 L 435,260 L 430,225 L 425,195 L 440,180 Z
        M 580,310 L 595,300 L 600,340 L 585,355 L 575,330 Z`
  },
  // Asia
  {
    id: 'asia',
    name: 'Asia',
    d: `M 560,95 L 610,80 L 670,75 L 730,70 L 790,75 L 850,85 L 880,105 L 870,130 
        L 840,140 L 820,165 L 835,190 L 800,210 L 775,230 L 750,260 L 730,250 L 710,220 
        L 680,210 L 660,230 L 630,220 L 600,200 L 580,180 L 565,150 L 555,120 Z
        M 630,195 L 670,185 L 690,215 L 665,245 L 640,230 L 625,205 Z
        M 675,225 L 720,215 L 725,255 L 700,285 L 680,265 Z
        M 730,195 L 785,185 L 815,220 L 795,255 L 755,245 L 740,215 Z
        M 570,190 L 610,185 L 625,215 L 605,240 L 575,230 L 560,205 Z`
  },
  // Japan & East Asian Islands
  {
    id: 'japan-east-asia',
    name: 'Japan & East Asia',
    d: `M 870,145 L 885,140 L 880,160 L 865,165 Z
        M 860,170 L 875,165 L 870,190 L 855,195 Z
        M 845,195 L 855,190 L 850,205 L 840,205 Z
        M 805,240 L 815,235 L 812,250 L 802,252 Z
        M 810,265 L 825,260 L 820,285 L 805,280 Z`
  },
  // Southeast Asia & Indonesia
  {
    id: 'southeast-asia',
    name: 'Southeast Asia & Indonesia',
    d: `M 750,265 L 770,260 L 775,285 L 755,290 Z
        M 760,295 L 795,290 L 825,305 L 790,315 L 755,305 Z
        M 800,320 L 835,315 L 840,335 L 810,335 Z
        M 850,310 L 880,305 L 875,330 L 845,330 Z`
  },
  // Australia & New Zealand
  {
    id: 'australia',
    name: 'Australia & New Zealand',
    d: `M 810,360 L 850,345 L 895,355 L 915,385 L 905,420 L 865,435 L 825,420 L 805,390 Z
        M 870,445 L 885,445 L 880,460 L 865,455 Z
        M 935,425 L 950,420 L 945,455 L 930,450 Z
        M 945,460 L 960,455 L 950,485 L 938,475 Z`
  }
];

// Major hub cities with their coordinates mapped on 1000x500 SVG canvas
export const breachCities = [
  { id: 'sf', name: 'SF', fullName: 'San Francisco, USA', x: 165, y: 175, lat: '37.77 N', lon: '122.42 W', threats: 284, severity: 'critical', status: 'ACTIVE INTRUSION' },
  { id: 'ny', name: 'New York', fullName: 'New York, USA', x: 275, y: 165, lat: '40.71 N', lon: '74.00 W', threats: 412, severity: 'critical', status: 'TARGETED RANSOMWARE' },
  { id: 'london', name: 'London', fullName: 'London, UK', x: 478, y: 145, lat: '51.50 N', lon: '0.12 W', threats: 329, severity: 'high', status: 'EXPLOIT ATTEMPTS' },
  { id: 'moscow1', name: 'Moscow', fullName: 'Moscow Central, RU', x: 585, y: 125, lat: '55.75 N', lon: '37.61 E', threats: 590, severity: 'critical', status: 'ORIGIN BOTNET C2' },
  { id: 'moscow2', name: 'Moscow', fullName: 'Moscow East, RU', x: 645, y: 135, lat: '56.50 N', lon: '53.20 E', threats: 418, severity: 'critical', status: 'APT-29 PROXY' },
  { id: 'tokyo', name: 'Tokyo', fullName: 'Tokyo, JP', x: 860, y: 175, lat: '35.67 N', lon: '139.65 E', threats: 215, severity: 'high', status: 'ZERO-DAY DETECTED' },
  { id: 'sydney', name: 'Sydney', fullName: 'Sydney, AU', x: 895, y: 405, lat: '33.86 S', lon: '151.20 E', threats: 142, severity: 'medium', status: 'DDOS SCRUBBING' },
  { id: 'saopaulo', name: 'São Paulo', fullName: 'São Paulo, BR', x: 345, y: 360, lat: '23.55 S', lon: '46.63 W', threats: 98, severity: 'medium', status: 'BRUTE FORCE BLOCKED' },
  { id: 'frankfurt', name: 'Frankfurt', fullName: 'Frankfurt, DE', x: 505, y: 140, lat: '50.11 N', lon: '8.68 E', threats: 195, severity: 'high', status: 'API EXFILTRATION' },
  { id: 'singapore', name: 'Singapore', fullName: 'Singapore, SG', x: 775, y: 285, lat: '1.35 N', lon: '103.82 E', threats: 167, severity: 'high', status: 'CREDENTIAL STUFFING' }
];

// Pre-configured attack pathways matching the screenshot vectors
export const defaultAttackVectors = [
  { from: 'moscow1', to: 'london', label: 'APT-29 Exploit', color: '#ff2a55', speed: 1.2 },
  { from: 'moscow1', to: 'ny', label: 'LockBit 3.0', color: '#ff1744', speed: 1.0 },
  { from: 'moscow2', to: 'london', label: 'Zero-Day C2', color: '#ff334b', speed: 1.4 },
  { from: 'london', to: 'ny', label: 'Financial Exfil', color: '#ff5252', speed: 1.1 },
  { from: 'sf', to: 'ny', label: 'Cloud API Probe', color: '#ff1744', speed: 0.9 },
  { from: 'sf', to: 'tokyo', label: 'Cross-Pacific DDoS', color: '#ff334b', speed: 1.3 },
  { from: 'moscow1', to: 'sf', label: 'OAuth Hijack', color: '#ff2a55', speed: 0.8 },
  { from: 'tokyo', to: 'moscow2', label: 'Reverse Telemetry', color: '#ff5252', speed: 1.0 },
  { from: 'frankfurt', to: 'london', label: 'Lateral Movement', color: '#ff2a55', speed: 1.5 }
];
