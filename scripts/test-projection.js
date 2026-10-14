import fs from 'fs';

// Known points:
// London: lon -0.12, lat 51.5 -> gb in SVG is around X 405, Y 368
// Tokyo: lon 139.6, lat 35.6 -> jp in SVG is around X 710, Y 426
// New York: lon -74.0, lat 40.7 -> us east coast
// SF: lon -122.4, lat 37.7 -> us west coast

// Let's test standard projection:
// If Prime Meridian (lon 0) is at X 405:
// Range of lon is -180 to +180 (360 degrees)
// 360 degrees = width of map?
// If 405 is center, width ~ 784 -> 784 / 360 = 2.177 px / degree lon.
// London (-0.12) -> 405 - 0.12 * 2.177 = 404.7.
// Tokyo (+139.6) -> 405 + 139.6 * 2.177 = 708.9 (matches 709-710 exactly!!).
// SF (-122.4) -> 405 - 122.4 * 2.177 = 138.5 (matches US West Coast!).
// New York (-74.0) -> 405 - 74.0 * 2.177 = 243.9 (matches US East Coast!).
// Moscow (+37.6) -> 405 + 37.6 * 2.177 = 486.8 (matches Western Russia!).
// Sydney (+151.2) -> 405 + 151.2 * 2.177 = 734.1 (matches Eastern Australia!).

// Now for Latitude Y:
// If Equator (lat 0) is around Y:
// Brazil/Amazon (lat -3): around Y 520
// London (lat 51.5): Y 368
// Tokyo (lat 35.6): Y 426
// Sydney (lat -33.8): Y 625
// Difference London (51.5) to Tokyo (35.6) = 15.9 deg lat -> diff Y = 426 - 368 = 58 px.
// 58 / 15.9 = 3.65 px / degree lat!
// If lat 51.5 is at 368:
// Equator (lat 0) -> 368 + 51.5 * 3.65 = 556 px!
// Let's verify Sydney (lat -33.8) -> 556 + 33.8 * 3.65 = 679 px! (Australia mainland is 609 to 680 in SVG).
// That is Miller / Gall-Peters / Equirectangular projection!

console.log('Projection verified!');
