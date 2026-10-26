# -*- coding: utf-8 -*-
import os, sys, json, shutil
import pillow_heif
from PIL import Image

pillow_heif.register_heif_opener()

source_dir = r"F:\Meju vaiaa\Rice Mill Trade"
repo_dir = r"C:\Documents\Others Project\ricemilltrade"
products_dir = os.path.join(repo_dir, "assets", "images", "products")
os.makedirs(products_dir, exist_ok=True)

# Product catalog mapping: (Source filename, clean_id, slug, Name_EN, Name_BN, Category, Category_BN, Specs_list, Description_EN, Description_BN)
PRODUCT_DEFS = [
    (
        "Boiler Air Nozzles.jpg.jpeg",
        "p-boiler-01",
        "boiler-air-nozzles",
        "Boiler Fluidized Bed Air Nozzles",
        "বয়লার এয়ার নজল (হাই হিট রেজিস্ট্যান্ট)",
        "boiler",
        "বয়লার ও স্টিম পার্টস",
        ["Material: High-Grade Heat Resistant Cast Alloy", "Application: Fluidized Bed Combustion (FBC) Boiler", "Features: Uniform Air Distribution, Long Life"],
        "Precision engineered boiler air nozzles designed for fluidized bed boilers in auto rice mills, ensuring uniform combustion and high thermal efficiency.",
        "অটো রাইস মিলের এফবিসি বয়লারের জন্য উচ্চ তাপসহনশীল এয়ার নজল, যা সঠিক বাতাস প্রবাহ ও সর্বোচ্চ জ্বালানি দক্ষতা নিশ্চিত করে।"
    ),
    (
        "Boiler Air Pressure Guage mmWC1000.jpg.jpeg",
        "p-boiler-02",
        "boiler-air-pressure-gauge-mmwc1000",
        "Boiler Low Pressure Draft Gauge (0-1000 mmWC)",
        "বয়লার ড্রাফট ও এয়ার প্রেসার গেজ (০-১০০০ mmWC)",
        "boiler",
        "বয়লার ও স্টিম পার্টস",
        ["Range: 0-1000 mmWC (Capsule Type)", "Mounting: Bottom / Back Connection", "Body: Stainless Steel / Brass Internals"],
        "Sensitive capsule draft pressure gauge for accurate monitoring of boiler furnace draft, flue gas, and combustion air pressure.",
        "বয়লার ফার্নেস ও এয়ার ডাক্টের অতি সূক্ষ্ম বাতাসের চাপ ও ড্রাফট নিখুঁতভাবে পরিমাপের নির্ভরযোগ্য ক্যাপসুল গেজ।"
    ),
    (
        "Boiler fusible plug double.jpg.jpeg",
        "p-boiler-03",
        "boiler-fusible-plug-double",
        "Boiler Double Fusible Plug (Safety Fitting)",
        "বয়লার ফিউসিবল প্লাগ ডাবল (নিরাপত্তা যন্ত্রাংশ)",
        "boiler",
        "বয়লার ও স্টিম পার্টস",
        ["Type: Double Core Fusible Safety Plug", "Thread: Standard BSP/NPT", "Material: Heavy Cast Gunmetal / Bronze"],
        "Vital safety fitting for fire-tube boilers that melts under low water conditions to extinguish combustion fire and prevent boiler explosion.",
        "বয়লারে পানির স্তর নিচে নেমে গেলে স্বয়ংক্রিয়ভাবে গলে গিয়ে ফার্নেসে বাষ্প ঢুকিয়ে আগুন নিভিয়ে বিস্ফোরণ রোধ করার বিশ্বস্ত নিরাপত্তা প্লাগ।"
    ),
    (
        "Boiler Fussible plug single.jpg.jpeg",
        "p-boiler-04",
        "boiler-fusible-plug-single",
        "Boiler Single Fusible Plug",
        "বয়লার ফিউসিবল প্লাগ সিঙ্গেল",
        "boiler",
        "বয়লার ও স্টিম পার্টস",
        ["Type: Single Fusible Core", "Thread: Standard Heavy Duty Thread", "Material: Bronze / Brass with Tin Core"],
        "Reliable standard single core fusible safety plug for industrial steam boiler safety compliance.",
        "ইন্ডাস্ট্রিয়াল স্টিম বয়লারের স্ট্যান্ডার্ড সিঙ্গেল কোর ফিউসিবল সেফটি প্লাগ।"
    ),
    (
        "Boiler Tube Cleaning Wire Brush.jpg.jpeg",
        "p-boiler-05",
        "boiler-tube-cleaning-wire-brush",
        "Boiler Tube Cleaning Steel Wire Brush",
        "বয়লার টিউব ক্লিনিং স্টিল ওয়্যার ব্রাশ",
        "boiler",
        "বয়লার ও স্টিম পার্টস",
        ["Bristles: High Tensile Tempered Steel Wire", "Sizes: 2 inch, 2.5 inch, 3 inch, 3.5 inch", "Threaded rod attachment"],
        "Heavy-duty round twisted wire brush for de-scaling soot, carbon deposits, and slag inside boiler smoke tubes.",
        "বয়লারের স্মোক টিউবের ভেতরের সুট, কার্বন ও স্কেল পরিষ্কার করার মজবুত স্প্রিং স্টিল ওয়্যার ব্রাশ।"
    ),
    (
        "Steam pressure guage 4 inches.jpg.jpeg",
        "p-boiler-06",
        "steam-pressure-gauge-4-inch",
        "Industrial Steam Pressure Gauge 4 Inch",
        "ইন্ডাস্ট্রিয়াল স্টিম প্রেসার গেজ ৪ ইঞ্চি",
        "boiler",
        "বয়লার ও স্টিম পার্টস",
        ["Dial Size: 4 Inch (100mm)", "Range: 0-25 kg/cm2 / 0-400 PSI", "Casing: Stainless Steel 304, Glycerin Filled / Dry"],
        "Heavy duty bourdon tube steam pressure gauge with high vibration resistance for rice mill steam boilers and parboiling pipelines.",
        "রাইস মিলের স্টিম লাইন ও বয়লার পাইপলাইনে নিখুঁত ও নির্ভরযোগ্য বাষ্পের চাপ প্রদর্শনের জন্য ৪ ইঞ্চি প্রেসার গেজ।"
    ),
    (
        "Steam pressure guage 6 inches.jpg.jpeg",
        "p-boiler-07",
        "steam-pressure-gauge-6-inch",
        "Heavy Duty Steam Pressure Gauge 6 Inch",
        "হেভি ডিউটি স্টিম প্রেসার গেজ ৬ ইঞ্চি",
        "boiler",
        "বয়লার ও স্টিম পার্টস",
        ["Dial Size: 6 Inch (150mm)", "Range: 0-30 kg/cm2 (Bar/PSI Dual)", "Connection: 1/2 inch BSP/NPT Stainless Steel"],
        "Large dial high-accuracy master steam pressure gauge for main boiler header and high-pressure steam distribution control.",
        "মেইন বয়লার হেডার ও দূর থেকে স্পষ্ট চাপ পর্যবেক্ষণের জন্য ৬ ইঞ্চি ডায়াল সাইজের প্রিমিয়াম স্টিম গেজ।"
    ),
    (
        "Chemical dosing pump.jpg.jpeg",
        "p-boiler-08",
        "chemical-dosing-pump",
        "Boiler Water Chemical Dosing Pump",
        "বয়লার ওয়াটার কেমিক্যাল ডোজিং পাম্প",
        "pumps",
        "পাম্প ও মেকানিক্যাল যন্ত্রাংশ",
        ["Type: Electronic Diaphragm Metering Pump", "Capacity: Adjustable Flow Rate", "Corrosion Resistant Liquid End"],
        "Automated precise chemical metering pump to dose anti-scaling, anti-corrosion, and oxygen-scavenging chemicals into boiler feed water.",
        "বয়লারের পানি শোধনাগার এবং বয়লার টিউব ক্ষয় ও স্কেল জমা রোধে কেমিক্যাল নির্দিষ্ট মাত্রায় ইনজেক্ট করার অটোমেটিক ডোজিং পাম্প।"
    ),
    (
        "Feed pump mechanical seal.jpg.jpeg",
        "p-boiler-09",
        "feed-pump-mechanical-seal",
        "Boiler Feed Water Pump Mechanical Seal",
        "বয়লার ফিড ওয়াটার পাম্প মেকানিক্যাল সিল",
        "pumps",
        "পাম্প ও মেকানিক্যাল যন্ত্রাংশ",
        ["Faces: Silicon Carbide / Carbon / Tungsten", "Temperature: Up to 180 deg C", "Application: Multi-Stage High Pressure Feed Pump"],
        "High-temperature and high-pressure mechanical face seal preventing feed water leakage in multi-stage boiler water supply pumps.",
        "মাল্টি-স্টেজ হাই প্রেসার বয়লার ফিড পাম্পের উচ্চ তাপমাত্রা ও চাপে পানি লিকেজ রোধে টেকসই মেকানিক্যাল সিল।"
    ),
    (
        "Feed pump SS disc type NRV.jpg.jpeg",
        "p-boiler-10",
        "feed-pump-ss-disc-nrv",
        "Boiler Feed Pump SS Disc Non-Return Valve (NRV)",
        "বয়লার ফিড পাম্প এসএস ডিস্ক টাইপ নন-রিটার্ন ভাল্ব",
        "pumps",
        "পাম্প ও মেকানিক্যাল যন্ত্রাংশ",
        ["Material: Full Stainless Steel SS304/SS316", "Type: Disc Check Valve (Wafer/Threaded)", "Pressure Rating: PN40 / High Pressure"],
        "Stainless steel disc type non-return check valve to prevent backflow of high pressure steam and boiling water into the pump.",
        "উচ্চ চাপের গরম পানি ও স্টিমের উল্টো প্রবাহ রোধে বয়লার ফিড লাইনের জন্য স্টেইনলেস স্টিলের তৈরি নন-রিটার্ন ভাল্ব।"
    ),
    (
        "Mubrey magnetic switch.jpg.jpeg",
        "p-boiler-11",
        "mobrey-magnetic-level-switch",
        "Mobrey Boiler Water Level Magnetic Switch",
        "মুব্রে বয়লার ওয়াটার লেভেল ম্যাগনেটিক সুইচ",
        "boiler",
        "বয়লার ও স্টিম পার্টস",
        ["Type: Snap-Action Magnetic Switch", "Housing: Flameproof / Weatherproof", "Application: Mobrey Level Controller Column"],
        "Precision magnetic snap-action switch providing high and low water alarm and feed pump automatic cut-in/cut-out signals.",
        "বয়লারের পানির স্তর কমে গেলে পাম্প অন-অফ এবং বিপৎসীমা সংকেত পাঠানোর জন্য বিখ্যাত মুব্রে ম্যাগনেটিক সুইচ।"
    ),
    (
        "Mubrey magnetic rod.jpg.jpeg",
        "p-boiler-12",
        "mobrey-magnetic-rod",
        "Mobrey Level Controller Float Magnetic Rod Assembly",
        "মুব্রে লেভেল কন্ট্রোলার ফ্লোট ম্যাগনেটিক রড",
        "boiler",
        "বয়লার ও স্টিম পার্টস",
        ["Rod Material: Stainless Steel with Magnetic Core", "High heat & pressure endurance", "Direct replacement for Mobrey chambers"],
        "Stainless steel magnetic float arm and rod for transfer of water level position across non-magnetic chamber walls.",
        "বয়লারের স্টিম চেম্বার থেকে ম্যাগনেটিক সুইচে নির্ভুল সিগন্যাল রূপান্তরের এসএস ম্যাগনেটিক রড ও ফ্লোট অ্যাসেম্বলি।"
    ),

    # Compressors & Pneumatics
    (
        "Compressor Spare Parts.jpg.jpeg",
        "p-comp-01",
        "compressor-spare-parts-kit",
        "Screw Air Compressor Maintenance Spares Kit",
        "স্ক্রু এয়ার কম্প্রেসর মেইনটেন্যান্স ও স্পেয়ার পার্টস",
        "compressor",
        "কম্প্রেসর ও নিউমেটিক্স",
        ["Compatibility: Atlas Copco, Ingersoll Rand, Fusheng, Kaeser, Chinese Screw Compressors", "Kit Includes: Valves, Gaskets, O-Rings, Sensors"],
        "Comprehensive maintenance replacement parts for industrial screw air compressors used in auto rice mill pneumatic sorters and actuators.",
        "অটো রাইস মিলের কালার সোর্টার ও নিউমেটিক সিলিন্ডার চালিত স্ক্রু কম্প্রেসরের যাবতীয় মেইনটেন্যান্স পার্টস।"
    ),
    (
        "Compressor Air filter.jpg.jpeg",
        "p-comp-02",
        "compressor-air-filter-element",
        "Industrial Screw Compressor Intake Air Filter",
        "স্ক্রু কম্প্রেসর ইনটেক এয়ার ফিল্টার",
        "compressor",
        "কম্প্রেসর ও নিউমেটিক্স",
        ["Filtration: 99.8% at 3 micron", "Heavy Duty Pleated Microfiber Media", "Steel Reinforcement Mesh"],
        "High efficiency intake air filter cartridge ensuring dust-free air enters the compressor screw air-end, maximizing air-end lifespan.",
        "বায়ু থেকে ধূলিকণা ও ভুসি ছেঁকে স্ক্রু এয়ারএন্ডের নিরাপত্তা নিশ্চিত করার হাই-এফিশিয়েন্সি এয়ার ফিল্টার।"
    ),
    (
        "Compressor Air filter stock.jpg.jpeg",
        "p-comp-03",
        "compressor-air-filter-wholesale-stock",
        "Screw Compressor Air Filters (Assorted Stock)",
        "স্ক্রু কম্প্রেসর এয়ার ফিল্টার কালেকশন (সকল সাইজ)",
        "compressor",
        "কম্প্রেসর ও নিউমেটিক্স",
        ["Sizes: 10HP, 20HP, 30HP, 50HP, 100HP+", "Ready Stock: Multiple Leading Brands & Dimensions"],
        "Wide inventory of compressor air filters in various dimensions ready for immediate dispatch to auto rice mills across Bangladesh.",
        "বাংলাদেশের যেকোনো ব্র্যান্ডের স্ক্রু কম্প্রেসরের উপযোগী বিভিন্ন সাইজ ও ক্ষমতার রেডি স্টক এয়ার ফিল্টার।"
    ),
    (
        "Compressor Synthetic Oil.jpg.jpeg",
        "p-comp-04",
        "compressor-synthetic-lubricant-oil",
        "High-Grade Screw Compressor Synthetic Oil (4000/8000 Hrs)",
        "স্ক্রু কম্প্রেসর সিন্থেটিক লুব্রিকেন্ট অয়েল",
        "compressor",
        "কম্প্রেসর ও নিউমেটিক্স",
        ["Grade: ISO VG 46 / VG 32 Synthetic Rotary Screw Oil", "Service Life: 4,000 to 8,000 Operating Hours", "Anti-foaming, Anti-oxidation"],
        "Premium synthetic rotary screw compressor lubricant formulated for extreme operating temperatures in industrial rice mill operations.",
        "টানা চালিত স্ক্রু কম্প্রেসরের দীর্ঘস্থায়িত্ব, কম ঘর্ষণ এবং হিট রেজিস্ট্যান্সের জন্য প্রিমিয়াম সিন্থেটিক লুব্রিকেন্ট।"
    ),
    (
        "Screw Compressor Head side vew.jpg.jpeg",
        "p-comp-05",
        "screw-compressor-head-air-end",
        "Screw Compressor Rotary Air-End Head",
        "স্ক্রু কম্প্রেসর রোটোরি এয়ার-এন্ড হেড",
        "compressor",
        "কম্প্রেসর ও নিউমেটিক্স",
        ["Type: Twin Rotary Screw Air-End", "Tolerance: Micron-level precision rotors", "High CFM delivery, low noise"],
        "Precision balanced twin-rotor compressor head (air-end) delivering steady continuous compressed air for sorting machines.",
        "কালার সোর্টার ও মিলের সার্বিক বাতাসের জন্য সর্বোচ্চ প্রেসার সরবরাহকারী রোটোরি স্ক্রু এয়ার-এন্ড হেড।"
    ),
    (
        "Solenoid valve for drain.jpg.jpeg",
        "p-comp-06",
        "solenoid-valve-auto-drain",
        "Electronic Auto Drain Solenoid Valve",
        "কম্প্রেসর অটো ড্রেন সোলেনয়েড ভাল্ব",
        "compressor",
        "কম্প্রেসর ও নিউমেটিক্স",
        ["Voltage: 220V AC / 24V DC", "Timer: Adjustable interval (0.5-45 min) and discharge (0.5-10 sec)", "Pressure: 0-16 Bar"],
        "Timed electronic solenoid auto-drain valve to automatically purge accumulated water condensate from compressor air tanks and moisture traps.",
        "কম্প্রেসরের এয়ার ট্যাংক ও ড্রায়ার থেকে জমে থাকা পানি স্বয়ংক্রিয়ভাবে বাইরে নিষ্কাশনকারী টাইমার সোলেনয়েড ভাল্ব।"
    ),

    # Milling, Polishing & Processing Spares
    (
        "Silky Shell.jpg.jpeg",
        "p-mill-01",
        "silky-polisher-screen-shell",
        "Rice Silky Polisher Screen Shell",
        "রাইস সিল্কি পলিশার স্ক্রিন শেল",
        "milling",
        "রাইস মিলিং ও মেশিনারিজ পার্টস",
        ["Material: Special Heat-Treated Alloy Steel", "Perforation: Anti-breakage slotted design", "Compatibility: Standard Single/Double Roller Silkies"],
        "Hardened alloy steel slotted screen shell for water mist silky polishers, giving rice grains a brilliant pearly shine with minimal broken rice.",
        "সিল্কি পলিশারে চাউল চকচকে ও মসৃণ করার জন্য বিশেষ অ্যালয় স্টিলের টেকসই ছিদ্রযুক্ত স্ক্রিন শেল।"
    ),
    (
        "Silky shell and warm.jpg.jpeg",
        "p-mill-02",
        "silky-shell-and-worm-assembly",
        "Silky Polisher Shell & Screw Worm Shaft Assembly",
        "সিল্কি শেল ও স্ক্রু ওয়ার্ম শ্যাফ্ট অ্যাসেম্বলি",
        "milling",
        "রাইস মিলিং ও মেশিনারিজ পার্টস",
        ["Assembly: Hardened Screw Conveyor Worm + Perforated Polisher Shell", "Finish: Smooth wear-resistant alloy coating", "Balanced dynamically"],
        "Complete matched assembly of feeding screw worm shaft and screen shell for water silky polishing machines.",
        "পানি স্প্রে সিল্কি পলিশারের ধান/চাউল ফিডিং ওয়ার্ম স্ক্রু ও ফ্রেম শেল কমপ্লিট সেট।"
    ),
    (
        "silky water and air mixing sprayer.jpg.jpeg",
        "p-mill-03",
        "silky-water-air-mixing-sprayer-nozzle",
        "Silky Mist Polisher Water & Air Mixing Sprayer",
        "সিল্কি ওয়াটার ও এয়ার মিক্সিং স্প্রেয়ার নজল",
        "milling",
        "রাইস মিলিং ও মেশিনারিজ পার্টস",
        ["Material: Stainless Steel SS304 Nozzle with Brass Atomizer", "Function: Micro-fine atomization of water into polishing chamber"],
        "Dual-fluid atomizing spray nozzle that mixes pressurized air and water into ultra-fine micro-mist for brilliant rice polishing.",
        "পলিশিং চেম্বারে পানি ও বাতাসের নিখুঁত সংমিশ্রণে অতি সূক্ষ্ম কুয়াশার মতো স্প্রে তৈরি করে চাউলের গ্লেজ বৃদ্ধি করার স্প্রেয়ার নজল।"
    ),
    (
        "Whitener stone.jpg.jpeg",
        "p-mill-04",
        "rice-whitener-emery-stone-roller",
        "Rice Whitener Emery Stone Polishing Roller",
        "রাইস হোয়াইটনার এমেরি স্টোন রোলার",
        "milling",
        "রাইস মিলিং ও মেশিনারিজ পার্টস",
        ["Grit: 30 / 36 / 46 Emery Silicon Carbide", "Dynamic Balancing: 100% Factory Balanced", "Durability: High wear resistance"],
        "Precision balanced abrasive emery stone roller for vertical and horizontal rice whitening machines, gently removing bran without grain stress.",
        "চাউলের কুঁড়া বা লাল আবরণ আলতোভাবে তুলে ফেলে ধবধবে সাদা করতে অভিজ্ঞ মিলারদের প্রথম পছন্দের এমেরি স্টোন রোলার।"
    ),
    (
        "All Hole Size of Screen.jpg.jpeg",
        "p-mill-05",
        "all-hole-size-rice-mill-screen",
        "Rice Milling & Sifter Screens (All Hole Sizes)",
        "রাইস মিলের সকল সাইজের সিভ ও স্ক্রিন চালনি",
        "milling",
        "রাইস মিলিং ও মেশিনারিজ পার্টস",
        ["Materials: High Carbon Hardened Steel & Stainless Steel", "Hole Types: Slotted, Round, Dimple, Oblong", "Sizes: All custom gauge & hole diameters"],
        "Complete selection of precision punched perforations for paddy cleaners, hullers, polishers, and bran separators.",
        "ধান ক্লিনার, হালার, হোয়াইটনার ও কুঁড়া চালনির জন্য বিভিন্ন সাইজের গোল ও খাঁজকাটা স্ক্রিন।"
    ),
    (
        "de-stoner Dimple Screen.jpg.jpeg",
        "p-mill-06",
        "destoner-dimple-perforated-screen",
        "Paddy Destoner Dimple Perforated Screen",
        "প্যাডি ডি-স্টোনার ডিম্পল স্ক্রিন শিট",
        "milling",
        "রাইস মিলিং ও মেশিনারিজ পার্টস",
        ["Pattern: Embossed Dimple / Fish Scale Mesh", "Material: Cold Rolled Wear-Resistant Steel", "Function: Separation of stones from paddy/rice"],
        "Embossed dimple textured screen that utilizes specific gravity and vibration to cleanly separate stones from paddy grain.",
        "নির্দিষ্ট গ্র্যাভিটি ও কম্পনের মাধ্যমে চাল বা ধান থেকে নিখুঁতভাবে পাথর আলাদা করার ডিম্পল স্ক্রিন শিট।"
    ),
    (
        "Screw feeder speed controller meter.jpg.jpeg",
        "p-mill-07",
        "screw-feeder-speed-controller-meter",
        "Screw Feeder Digital Speed Controller Meter",
        "স্ক্রু ফিডার স্পিড কন্ট্রোলার ডিজিটাল মিটার",
        "electrical",
        "ইলেকট্রিক্যাল ও অটোমেশন",
        ["Input: AC 220V", "Display: 4-Digit Bright LED", "Output: Variable DC/AC Drive Signal"],
        "Precision variable speed indicator and regulator panel meter to control paddy and rice feed rate into milling machines.",
        "মেশিনে ধান বা চাউল সরবরাহের গতি নিখুঁতভাবে নিয়ন্ত্রণ করার ডিজিটাল স্পিড কন্ট্রোলার মিটার।"
    ),

    # Magnets & Cleaning Systems
    (
        "Hopper Magnet SS.jpg.jpeg",
        "p-mag-01",
        "hopper-magnet-stainless-steel-ss304",
        "Sanitary Stainless Steel Hopper Magnet (SS304)",
        "হপার ম্যাগনেট এসএস ৩০৪ (ফুড গ্রেড শক্তিশালী চৌম্বক)",
        "magnets",
        "ম্যাগনেট ও ক্লিনিং সিস্টেম",
        ["Material: SS304 Stainless Steel Housing", "Magnet: Rare Earth Neodymium (NdFeB) 10,000+ Gauss", "Grid: Custom Size Grate"],
        "High-intensity rare-earth permanent magnetic grate designed to trap all ferrous tramp iron, nails, and wire from grain flow in hoppers.",
        "খাদ্য নিরাপত্তা নিশ্চিত করতে হপারের ভেতর দিয়ে যাওয়া ধান/চাল থেকে পেরেক, তার ও লোহার গুঁড়া শতভাগ আটকানোর শক্তিশালী এসএস ম্যাগনেট।"
    ),
    (
        "Hopper Magnet MS.jpg.jpeg",
        "p-mag-02",
        "hopper-magnet-mild-steel",
        "Industrial Hopper Magnet MS Frame",
        "ইন্ডাস্ট্রিয়াল হপার ম্যাগনেট এমএস ফ্রেম",
        "magnets",
        "ম্যাগনেট ও ক্লিনিং সিস্টেম",
        ["Frame: Durable Mild Steel Frame", "Magnets: Powerful Ceramic / Alnico / Neodymium", "Shape: Round / Rectangular Custom"],
        "Robust magnetic trap grid for raw grain intake pits and chutes to protect mill rollers and destoner screens from iron debris damage.",
        "ইনটেক পিট ও চালনির মুখে স্থাপনযোগ্য লোহার যন্ত্রাংশকে ধ্বংসের হাত থেকে রক্ষাকারী হেভি ডিউটি ম্যাগনেট।"
    ),

    # Electrical, Automation & Sensors
    (
        "RTD Sensor.jpg.jpeg",
        "p-elec-01",
        "pt100-rtd-temperature-sensor",
        "PT100 RTD Industrial Temperature Sensor Probe",
        "পিটি১০০ আরটিডি ইন্ডাস্ট্রিয়াল টেম্পারেচার সেন্সর",
        "electrical",
        "ইলেকট্রিক্যাল ও অটোমেশন",
        ["Type: PT100 3-Wire Class A Sensor", "Sheath: Stainless Steel 316", "Range: -50 deg C to +400 deg C"],
        "High accuracy RTD platinum sensor probe for monitoring steam temperature, drying hot air, and boiler flue gas heat.",
        "ধান শুকানো, পারবয়লিং ড্রায়ার ও স্টিম পাইপলাইনের তাপমাত্রা নিখুঁতভাবে মনিটরিং করার স্টেইনলেস স্টিল সেন্সর।"
    ),
    (
        "Temperature controller meter TC 513.jpg.jpeg",
        "p-elec-02",
        "temperature-controller-meter-tc513",
        "Digital PID Temperature Controller Meter (TC-513)",
        "ডিজিটাল টেম্পারেচার কন্ট্রোলার মিটার (টিসি-৫১৩)",
        "electrical",
        "ইলেকট্রিক্যাল ও অটোমেশন",
        ["Model: TC-513 PID Dual Display", "Input: Universal (PT100, K-Type Thermocouple)", "Output: Relay / SSR"],
        "Intelligent PID temperature controller with dual digital LED readout for precise automated temperature regulation in paddy dryers and boilers.",
        "ধান ড্রায়ার ও বয়লারে কাঙ্ক্ষিত তাপমাত্রা স্বয়ংক্রিয়ভাবে ধরে রাখার জন্য বিশ্বস্ত ডিজিটাল পিআইডি কন্ট্রোলার।"
    ),
    (
        "Star Delta Timer.jpg.jpeg",
        "p-elec-03",
        "star-delta-motor-starter-timer",
        "Heavy Duty Star-Delta Motor Starter Timer Relay",
        "স্টার-ডেল্টা মোটর স্টার্টার টাইমার রিলে",
        "electrical",
        "ইলেকট্রিক্যাল ও অটোমেশন",
        ["Range: 0-30 Seconds / 0-60 Seconds", "Contacts: Instant + Delayed Changeover", "Mounting: DIN Rail / Panel"],
        "Specialized transition delay timer relay ensuring smooth starting of high-horsepower auto rice mill induction motors without power tripping.",
        "মিলের বড় হর্সপাওয়ারের মোটরগুলোকে মসৃণভাবে চালু করে অতিরিক্ত বিদ্যুৎ লোড ও ড্রপ ঠেকানোর স্টার-ডেল্টা টাইমার রিলে।"
    ),
    (
        "Phase Failure Really.jpg.jpeg",
        "p-elec-04",
        "phase-failure-voltage-protection-relay",
        "Motor Phase Failure & Voltage Protection Relay",
        "মোটর ফেজ ফেইলিওর ও সিকোয়েন্স প্রোটেকশন রিলে",
        "electrical",
        "ইলেকট্রিক্যাল ও অটোমেশন",
        ["Protection: Phase Loss, Phase Sequence, Over/Under Voltage", "Reset: Automatic / Manual", "LED Indication"],
        "Essential industrial electrical protection relay to instantly trip motors during phase outage or reversal, preventing costly motor burnouts.",
        "বিদ্যুতের যেকোনো একটি ফেজ চলে গেলে বা ভোল্টেজ ওঠা-নামা করলে সাথে সাথে মোটর বন্ধ করে লাখ টাকার মোটর পোড়া থেকে বাঁচানোর ডিভাইস।"
    ),
    (
        "Oxilliary 2Nno 2Nc of magnetic contract.jpg.jpeg",
        "p-elec-05",
        "magnetic-contactor-auxiliary-block-2no-2nc",
        "Magnetic Contactor Auxiliary Contact Block (2NO + 2NC)",
        "ম্যাগনেটিক কন্টাক্টর অক্সিলারি কন্টাক্ট ব্লক (২NO + ২NC)",
        "electrical",
        "ইলেকট্রিক্যাল ও অটোমেশন",
        ["Configuration: 2 Normally Open + 2 Normally Closed", "Mounting: Front snap-on clip for standard contactors", "Rating: AC-15 10A"],
        "Front-mounting auxiliary contact block expanding the switching capability of industrial magnetic motor starters in mill control panels.",
        "রাইস মিলের মূল মোটর কন্ট্রোল প্যানেলে ম্যাগনেটিক কন্টাক্টরের সাথে সংযুক্ত করার ফ্রন্ট মাউন্টিং অক্সিলারি ব্লক।"
    ),
    (
        "Trasformer.jpg.jpeg",
        "p-elec-06",
        "industrial-control-power-transformer",
        "Step-Down Industrial Control Power Transformer",
        "কন্ট্রোল পাওয়ার স্টেপ-ডাউন ট্রান্সফরমার",
        "electrical",
        "ইলেকট্রিক্যাল ও অটোমেশন",
        ["Primary: 415V / 220V AC", "Secondary: 24V / 110V / 220V AC", "Copper Wound with Isolation Barrier"],
        "Heavy-duty copper wound control circuit transformer supplying safe, isolated auxiliary voltage to mill contactors and solenoids.",
        "কন্ট্রোল প্যানেল, সেন্সর ও সোলেনয়েড ভাল্বে নিরাপদ বিদ্যুৎ সরবরাহের জন্য স্টেপ-ডাউন কপার ওয়্যার ট্রান্সফরমার।"
    ),
    (
        "Ampere meter.jpg.jpeg",
        "p-elec-07",
        "panel-ampere-meter",
        "Analog / Digital AC Panel Ampere Meter",
        "প্যানেল এসি অ্যাম্পিয়ার মিটার",
        "electrical",
        "ইলেকট্রিক্যাল ও অটোমেশন",
        ["Scale: 0-100A / 0-200A / 0-500A (via CT)", "Dial: 96x96 mm Square Flush Mount", "Accuracy Class: 1.5"],
        "Precision current monitoring meter displaying real-time motor load on rice mill whitening, polishing, and boiler fan panels.",
        "মিলের প্রতিটি মোটরের ওপর কতখানি লোড পড়ছে তা সার্বক্ষণিক পর্যবেক্ষণের জন্য প্যানেল অ্যাম্পিয়ার মিটার।"
    ),
    (
        "Volt meter.jpg.jpeg",
        "p-elec-08",
        "panel-ac-volt-meter",
        "Three-Phase AC Panel Voltage Meter",
        "থ্রি-ফেজ এসি ভোল্টেজ মিটার",
        "electrical",
        "ইলেকট্রিক্যাল ও অটোমেশন",
        ["Range: 0-500V AC", "Display: Clear calibrated analog scale / digital", "Protection: High voltage transient withstand"],
        "Heavy duty electrical switchboard voltage meter indicating 3-phase line voltage to protect mill equipment from abnormal supply.",
        "মেইন্টার্মিনালে ৩-ফেজ বিদ্যুতের সঠিক ভোল্টেজ যাচাই করার নির্ভরযোগ্য প্যানেল ভোল্ট মিটার।"
    ),
    (
        "All kinds of Exhaust Fan.heic",
        "p-vent-01",
        "industrial-heavy-duty-exhaust-fans",
        "Heavy Duty Industrial Ventilation & Exhaust Fans",
        "ইন্ডাস্ট্রিয়াল হেভি ডিউটি এক্সহস্ট ফ্যান (সকল সাইজ)",
        "ventilation",
        "ভেন্টিলেশন ও ডাস্ট কালেকশন",
        ["Sizes: 24 inch, 36 inch, 50 inch Shutter Fans", "Blades: Stainless Steel / High Air Delivery Aluminum", "Motor: Heavy Duty Copper Wire IP55"],
        "High CFM industrial wall exhaust fans designed for auto rice mills, removing steam, dust, and excess heat to maintain clean plant air.",
        "রাইস মিলের বয়লার রুম, মিলিং ফ্লোর ও পারবয়লিং এরিয়া থেকে ধুলোবালি ও অতিরিক্ত তাপ দ্রুত বের করে ঠান্ডা রাখার পাওয়ারফুল ফ্যান।"
    ),
    (
        "Diesel Engine Filter.jpg.jpeg",
        "p-eng-01",
        "diesel-generator-engine-filters",
        "Heavy Duty Diesel Generator Fuel & Oil Filter",
        "ডিজেল জেনারেটর ইঞ্জিন ফুয়েল ও লুব ফিল্টার",
        "spares",
        "ইঞ্জিন ও জেনারেটর পার্টস",
        ["Type: Spin-On Fuel/Oil Filter Cartridge", "Efficiency: Micronic Pleated Paper", "Application: Cummins, Perkins, Chinese Generator sets"],
        "High performance engine filters protecting industrial backup generators from fuel contaminants during grid power outages in rice mills.",
        "লোডশেডিংয়ের সময় মিল সচল রাখতে ব্যবহৃত ব্যাকআপ জেনারেটর ও ইঞ্জিনের জন্য সর্বোচ্চ মানের ফুয়েল ও অয়েল ফিল্টার।"
    )
]

print(f"Total product definitions prepared: {len(PRODUCT_DEFS)}")

# Convert each product image to WebP
products_json_list = []
for item in PRODUCT_DEFS:
    src_filename, pid, slug, name_en, name_bn, cat, cat_bn, specs, desc_en, desc_bn = item
    src_path = os.path.join(source_dir, src_filename)
    dest_webp_filename = f"{slug}.webp"
    dest_webp_path = os.path.join(products_dir, dest_webp_filename)
    
    # Optimize & save WebP
    if os.path.exists(src_path):
        try:
            im = Image.open(src_path)
            if im.mode in ('RGBA', 'LA'):
                pass
            elif im.mode != 'RGB':
                im = im.convert('RGB')
            w, h = im.size
            max_dim = 1200
            if max(w, h) > max_dim:
                if w > h:
                    new_w = max_dim
                    new_h = int(h * (max_dim / w))
                else:
                    new_h = max_dim
                    new_w = int(w * (max_dim / h))
                im = im.resize((new_w, new_h), Image.Resampling.LANCZOS)
            im.save(dest_webp_path, 'WEBP', quality=84, method=6)
            print(f"OK: {slug}.webp saved ({os.path.getsize(dest_webp_path)/1024:.1f} KB)")
        except Exception as e:
            print(f"Error on {src_filename}: {e}")
    else:
        print(f"Missing source file: {src_path}")
    
    # WhatsApp inquiry pre-filled message
    wa_msg = f"Hello Rice Mill Trade, I am interested in *{name_en}* ({name_bn}). Model/ID: {pid}. Please send pricing, stock availability, and technical details."
    
    products_json_list.append({
        "id": pid,
        "slug": slug,
        "name": name_en,
        "nameBn": name_bn,
        "category": cat,
        "categoryBn": cat_bn,
        "image": f"assets/images/products/{dest_webp_filename}",
        "specs": specs,
        "description": desc_en,
        "descriptionBn": desc_bn,
        "whatsappMsg": wa_msg,
        "featured": pid in ["p-boiler-01", "p-boiler-02", "p-comp-01", "p-mill-01", "p-mill-04", "p-mag-01", "p-elec-02", "p-vent-01"]
    })

data_dir = os.path.join(repo_dir, "data")
os.makedirs(data_dir, exist_ok=True)

# Write data/products.json with utf-8
with open(os.path.join(data_dir, "products.json"), "w", encoding="utf-8") as f:
    json.dump(products_json_list, f, ensure_ascii=False, indent=2)

print(f"data/products.json saved with {len(products_json_list)} items!")

# Write data/team.json
team_list = [
    {
        "id": "team-01",
        "name": "Rezaul Karim",
        "nameBn": "রেজাউল করিম",
        "role": "CEO (Chief Executive Officer)",
        "roleBn": "প্রধান নির্বাহী কর্মকর্তা (CEO)",
        "image": "assets/images/team/rezaul-karim.webp",
        "phone": "01348249343",
        "email": "ricemilltrade@gmail.com",
        "bio": "Leading Rice Mill Trade with over 15 years of industry leadership in auto rice mill engineering, machinery procurement, and renewable energy.",
        "bioBn": "অটো রাইস মিল মেশিনারিজ, জেনুইন স্পেয়ার পার্টস ও রিনিউয়েবল এনার্জি খাতে দীর্ঘ ১৫ বছরেরও বেশি অভিজ্ঞতা নিয়ে প্রতিষ্ঠানটি পরিচালনা করছেন।"
    },
    {
        "id": "team-02",
        "name": "MD. Amirul Islam",
        "nameBn": "মোঃ আমিরুল ইসলাম",
        "role": "CFO (Chief Financial Officer)",
        "roleBn": "প্রধান অর্থ কর্মকর্তা (CFO)",
        "image": "assets/images/team/amirul-islam.webp",
        "phone": "01348249343",
        "email": "ricemilltrade@gmail.com",
        "bio": "Guiding financial strategy, global vendor relations, and industrial project financing for Rice Mill Trade client partnerships.",
        "bioBn": "কোম্পানির অর্থনৈতিক পরিকল্পনা, বৈশ্বিক সাপ্লাই চেইন ও ক্লায়েন্টদের বৃহৎ মেগা প্রজেক্টের বাজেট ও বিনিয়োগ ব্যবস্থাপনা তদারকি করেন।"
    },
    {
        "id": "team-03",
        "name": "Md. Helal Miah",
        "nameBn": "মোঃ হেলাল মিঞা",
        "role": "Assistant Manager",
        "roleBn": "সহকারী ব্যবস্থাপক (Assistant Manager)",
        "image": "assets/images/team/helal-miah.webp",
        "phone": "01348249343",
        "email": "ricemilltrade@gmail.com",
        "bio": "Managing client relations, fast parts delivery coordination, and on-site technical support response teams across Bangladesh.",
        "bioBn": "গ্রাহক সেবা, স্পেয়ার পার্টসের দ্রুততম ডেলিভারি নিশ্চিতকরণ এবং ফিল্ড টেকনিশিয়ান টিম সমন্বয়ে নিবেদিতপ্রাণ।"
    }
]

with open(os.path.join(data_dir, "team.json"), "w", encoding="utf-8") as f:
    json.dump(team_list, f, ensure_ascii=False, indent=2)

print("data/team.json saved!")

# Write data/services.json
services_list = [
    {
        "id": "srv-01",
        "icon": "⚙️",
        "title": "Auto Rice Mill Plant Setup & Turnkey Engineering",
        "titleBn": "অটো রাইস মিল সম্পূর্ণ প্ল্যান্ট সেটআপ ও ইঞ্জিনিয়ারিং",
        "summary": "Turnkey engineering solutions from site layout, machinery selection, civil alignment to complete plant commissioning.",
        "summaryBn": "জায়গার প্ল্যান ডিজাইন, সঠিক মেশিন নির্বাচন থেকে শুরু করে ট্রায়াল রান পর্যন্ত সম্পূর্ণ অটো রাইস মিল ইনস্টলেশন ও সল্যুশন।",
        "features": [
            "Complete 20 TPD to 200+ TPD Plant Engineering",
            "High Yield & Minimal Grain Breakage Flowcharts",
            "Full Electrical Sub-station & Panel Wiring Setup",
            "Dust-Free Environmental Pneumatic Pipeline Design"
        ],
        "featuresBn": [
            "২০ টিপিডি থেকে ২০০+ টিপিডি মেগা প্ল্যান্ট ইঞ্জিনিয়ারিং",
            "সর্বনিম্ন খুদ ও সর্বোচ্চ চালের উৎপাদনমুখী ফ্লোচার্ট",
            "সম্পূর্ণ সাব-স্টেশন ও অটোমেটেড প্যানেল বোর্ড ওয়্যারিং",
            "ডাস্ট-ফ্রি ও আধুনিক নিউমেটিক পাইপলাইন সেটআপ"
        ],
        "whatsappMsg": "Hello Rice Mill Trade, I would like to consult with your engineering team regarding Auto Rice Mill Plant Setup & Engineering."
    },
    {
        "id": "srv-02",
        "icon": "☀️",
        "title": "Industrial & Commercial Solar Power Projects",
        "titleBn": "ইন্ডাস্ট্রিজ ও কমার্শিয়াল সোলার পাওয়ার প্রজেক্ট",
        "summary": "Cut down massive factory electricity bills with high-efficiency on-grid & hybrid solar solutions for rice mills & buildings.",
        "summaryBn": "রাইস মিল, কোল্ড স্টোরেজ, কারখানা ও হাই-রাইজ ভবনের বিদ্যুৎ খরচ ৭০% পর্যন্ত কমাতে শক্তিশালী অন-গ্রিড ও হাইব্রিড সোলার সিস্টেম।",
        "features": [
            "Tier-1 Mono PERC / TOPCon Solar PV Modules",
            "Heavy Duty Industrial 3-Phase On-Grid Inverters",
            "Net Metering Approval Assistance with Govt/REB",
            "25-Year Performance Warranty & Payback in 3-4 Years"
        ],
        "featuresBn": [
            "টিয়ার-১ মনো পার্ক ও টপকন আধুনিক সোলার প্যানেল",
            "হেভি ডিউটি থ্রি-ফেজ অন-গ্রিড ইন্ডাস্ট্রিয়াল ইনভার্টার",
            "পল্লী বিদ্যুৎ ও পিডিবি নেট মিটারিং অনুমোদন সহায়তা",
            "২৫ বছরের ওয়ারেন্টি ও মাত্র ৩-৪ বছরে বিনিয়োগ ফেরত"
        ],
        "whatsappMsg": "Hello Rice Mill Trade, I am interested in an Industrial Solar Power Project for our factory/building. Please provide a preliminary audit & quotation."
    },
    {
        "id": "srv-03",
        "icon": "🔥",
        "title": "Parboiling & Boiler Engineering Solutions",
        "titleBn": "পারবয়লিং ও স্টিম বয়লার ইঞ্জিনিয়ারিং সলিউশন",
        "summary": "Specialized boiler maintenance, steam pipeline safety, automation controls, and water treatment chemical management.",
        "summaryBn": "বয়লারের নিরাপদ পরিচালনা, স্টিম পাইপলাইন ইন্সপেকশন, কেমিক্যাল ডোজিং ও স্বয়ংক্রিয় ওয়াটার লেভেল কন্ট্রোল ব্যবস্থা।",
        "features": [
            "Boiler Water Level & Pressure Safety Automation",
            "Tube Cleaning, Descaling & Annual Overhauling",
            "Non-Return Valves & Steam Pressure Regulation",
            "Parboiling Tank Piping & Energy-Saving Heat Traps"
        ],
        "featuresBn": [
            "বয়লার অটো লেভেল কন্ট্রোল ও জরুরি সেফটি অটোমেশন",
            "টিউব ডিস্কেলিং, ক্লিনিং ও বাৎসরিক রক্ষণাবেক্ষণ",
            "হাই প্রেসার নন-রিটার্ন ভাল্ব ও স্টিম রেগুলেশন",
            "পারবয়লিং ট্যাংক পাইপিং ও হিট ট্র্যাপ শক্তি সাশ্রয়"
        ],
        "whatsappMsg": "Hello Rice Mill Trade, I need Parboiling & Boiler engineering services and spare parts for my mill."
    },
    {
        "id": "srv-04",
        "icon": "📦",
        "title": "New & Reconditioned Machinery Supply",
        "titleBn": "নতুন ও রিকন্ডিশন্ড মেশিনারিজ সরবরাহ",
        "summary": "Imported genuine new machinery and strictly tested, high-yield reconditioned milling units at competitive cost.",
        "summaryBn": "সরাসরি আমদানিকৃত ব্র্যান্ড নিউ মেশিন এবং সম্পূর্ণ টেস্টেড ও ওয়ারেন্টিযুক্ত রিকন্ডিশন্ড মেশিনারিজ সরবরাহ।",
        "features": [
            "Color Sorters (Satake, Meyer, Anysort, Taiho)",
            "Rotary Screw Air Compressors & Refrigerated Dryers",
            "Paddy Huskers, Destoners & Rice Whiteners",
            "100% Genuine Machine Condition Guaranteed"
        ],
        "featuresBn": [
            "অপটিক্যাল কালার সোর্টার মেশিন (নতুন ও রিকন্ডিশন্ড)",
            "রোটারি স্ক্রু কম্প্রেসর ও রেফ্রিজারেটেড এয়ার ড্রায়ার",
            "প্যাডি হাস্কার, ডি-স্টোনার, পলিশার ও হোয়াইটনার",
            "শতভাগ জেনুইন কন্ডিশন ও দীর্ঘস্থায়ী পারফরম্যান্স"
        ],
        "whatsappMsg": "Hello Rice Mill Trade, I am inquiring about New and Reconditioned Rice Mill Machinery availability."
    },
    {
        "id": "srv-05",
        "icon": "⚡",
        "title": "Genuine Spare Parts Fast Delivery Supply",
        "titleBn": "জেনুইন স্পেয়ার পার্টস দ্রুততম সরবরাহ",
        "summary": "Over 500+ ready stock spare parts for all kinds of auto rice mills, shipped anywhere in Bangladesh within 24 hours.",
        "summaryBn": "বয়লার, কম্প্রেসর, সিল্কি পলিশার, ম্যাগনেট ও ইলেকট্রিক্যাল প্যানেলের ৫০০+ স্পেয়ার পার্টস ২৪ ঘণ্টার মধ্যে বাংলাদেশের যেকোনো প্রান্তে ডেলিভারি।",
        "features": [
            "Original Factory Direct Sourcing",
            "High Wear Resistance & Certified Metallurgy",
            "Emergency Same-Day Courier Dispatch",
            "Guaranteed Model Fitting Precision"
        ],
        "featuresBn": [
            "সরাসরি প্রস্তুতকারক কারখানা থেকে আমদানি",
            "উচ্চ ক্ষয়রোধ ক্ষমতা ও নিখুঁত ফিটিং গ্যারান্টি",
            "জরুরি প্রয়োজনে দ্রুততম কুরিয়ার ও ট্রান্সপোর্ট ডেলিভারি",
            "সরাসরি হোয়াটসঅ্যাপে ছবি ও স্পেক্স পাঠিয়ে অর্ডার সুবিধা"
        ],
        "whatsappMsg": "Hello Rice Mill Trade, I urgently need genuine spare parts for our rice mill. Please assist."
    },
    {
        "id": "srv-06",
        "icon": "🛠️",
        "title": "Emergency On-Site Maintenance & Troubleshooting",
        "titleBn": "জরুরি অন-সাইট মেরামত ও সার্বক্ষণিক কারিগরি সহায়তা",
        "summary": "Experienced team of mechanical & electrical engineers ready for emergency mill breakdown servicing 24/7.",
        "summaryBn": "মিল চালুর ভরা মৌসুমে যেকোনো কারিগরি ত্রুটি বা ব্রেকডাউনে অভিজ্ঞ ইঞ্জিনিয়ার টিম দ্বারা সার্বক্ষণিক অন-কল সার্ভিস।",
        "features": [
            "24/7 Hotline Support & Expert Guidance",
            "Mechanical Vibration, Alignment & Motor Health Audit",
            "Sorter Calibration & Pneumatic Air Pressure Tune-Up",
            "Preventive Annual Maintenance Contracts (AMC)"
        ],
        "featuresBn": [
            "২৪/৭ সার্বক্ষণিক হটলাইন ও বিশেষজ্ঞ পরামর্শ",
            "মোটর, ভাইব্রেশন ও রোলার অ্যালাইনমেন্ট কারিগরি নিরীক্ষা",
            "সোর্টার ক্যামেরা ও নিউমেটিক প্রেশার নিখুঁত ক্যালিব্রেশন",
            "বাৎসরিক রক্ষণাবেক্ষণ চুক্তি (AMC) সুবিধা"
        ],
        "whatsappMsg": "Hello Rice Mill Trade, I require emergency on-site technical support for our rice mill."
    }
]

with open(os.path.join(data_dir, "services.json"), "w", encoding="utf-8") as f:
    json.dump(services_list, f, ensure_ascii=False, indent=2)

print("data/services.json saved!")

# Write data/brochures.json
brochures_list = [
    {
        "id": "doc-01",
        "title": "Boiler Spare Parts Official Catalog",
        "titleBn": "বয়লার স্পেয়ার পার্টস অফিসিয়াল ক্যাটালগ",
        "filename": "Boiler_spare_list.pdf",
        "path": "assets/documents/Boiler_spare_list.pdf",
        "fileSize": "1.09 MB",
        "category": "Boiler",
        "categoryBn": "বয়লার"
    },
    {
        "id": "doc-02",
        "title": "Air Compressor Spare Parts Catalog",
        "titleBn": "স্ক্রু কম্প্রেসর স্পেয়ার পার্টস অফিসিয়াল ক্যাটালগ",
        "filename": "Compressor_spare_parts_list.pdf",
        "path": "assets/documents/Compressor_spare_parts_list.pdf",
        "fileSize": "937 KB",
        "category": "Compressor",
        "categoryBn": "কম্প্রেসর"
    },
    {
        "id": "doc-03",
        "title": "Milling Spare Parts Master Catalog",
        "titleBn": "মাস্টার রাইস মিলিং স্পেয়ার পার্টস ক্যাটালগ",
        "filename": "Milling_Spare_Parts_List.pdf",
        "path": "assets/documents/Milling_Spare_Parts_List.pdf",
        "fileSize": "2.12 MB",
        "category": "Milling",
        "categoryBn": "মিলিং পার্টস"
    },
    {
        "id": "doc-04",
        "title": "OS Brand New Spare Parts Catalog",
        "titleBn": "ওএস ব্র্যান্ড নিউ স্পেয়ার পার্টস ক্যাটালগ",
        "filename": "OS_New_Spare_list.pdf",
        "path": "assets/documents/OS_New_Spare_list.pdf",
        "fileSize": "674 KB",
        "category": "New Spares",
        "categoryBn": "নতুন পার্টস"
    },
    {
        "id": "doc-05",
        "title": "OS Reconditioned & Used Spares Catalog",
        "titleBn": "ওএস রিকন্ডিশন্ড ও পুরাতন স্পেয়ার ক্যাটালগ",
        "filename": "OS_Old_Spare_list.pdf",
        "path": "assets/documents/OS_Old_Spare_list.pdf",
        "fileSize": "948 KB",
        "category": "Used Spares",
        "categoryBn": "রিকন্ডিশন্ড পার্টস"
    },
    {
        "id": "doc-06",
        "title": "RGB & Mono Color Sorter Spare Parts Catalog",
        "titleBn": "আরজিবি ও মনো কালার সোর্টার স্পেয়ার পার্টস ক্যাটালগ",
        "filename": "RGB_Mono_spare_list.pdf",
        "path": "assets/documents/RGB_Mono_spare_list.pdf",
        "fileSize": "1.70 MB",
        "category": "Color Sorter",
        "categoryBn": "কালার সোর্টার"
    }
]

with open(os.path.join(data_dir, "brochures.json"), "w", encoding="utf-8") as f:
    json.dump(brochures_list, f, ensure_ascii=False, indent=2)

print("data/brochures.json saved!")

# Write data/site.json
site_info = {
    "company": {
        "name": "Rice Mill Trade",
        "nameBn": "রাইস মিল ট্রেড",
        "domain": "ricemilltrade.com",
        "tagline": "Your reliable partner in your business",
        "taglineBn": "আপনার ব্যবসায় বিশ্বস্ত সহযোগী",
        "phone": "01348249343",
        "whatsapp": "8801348249343",
        "whatsappDisplay": "+880 1348-249343",
        "email": "ricemilltrade@gmail.com",
        "mainOfficeAddress": "Protikkha (4th Floor), House #13, Road #10, Nikunja-2, Khilkhet, Dhaka-1229, Bangladesh",
        "mainOfficeAddressBn": "প্রতীক্ষা (৪র্থ তলা), বাড়ি #১৩, রোড #১০, নিকুঞ্জ-২, খিলক্ষেত, ঢাকা-১২২৯, বাংলাদেশ",
        "manikganjOfficeAddress": "1: 47/1, Autpara, Betila, Manikganj Sadar, Manikganj, Dhaka, Bangladesh",
        "manikganjOfficeAddressBn": "১: ৪৭/১, আউতপাড়া, বেতিলা, মানিকগঞ্জ সদর, মানিকগঞ্জ, ঢাকা, বাংলাদেশ",
        "mainOfficeMapEmbed": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.089851610477!2d90.41724207593257!3d23.815383586274478!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c70014631317%3A0xe54fb797c27076ec!2sNikunja-2%2C%20Dhaka%201229!5e0!3m2!1sen!2sbd!4v1710000000000!5m2!1sen!2sbd",
        "manikganjOfficeMapEmbed": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14603.208571064562!2d89.98822003889158!3d23.861184976722822!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39fe15bb7c0c1b75%3A0x63158c3dbcb7609a!2sBetila%2C%20Manikganj!5e0!3m2!1sen!2sbd!4v1710000000000!5m2!1sen!2sbd",
        "businessHours": "Sat - Thu: 9:00 AM - 8:00 PM (24/7 WhatsApp Hotline)",
        "businessHoursBn": "শনি - বৃহস্পতি: সকাল ৯:০০ - রাত ৮:০০ (২৪/৭ হোয়াটসঅ্যাপ হেল্পলাইন)"
    },
    "branding": {
        "logo": "assets/images/brand/logo.png",
        "logoWebp": "assets/images/brand/logo.webp",
        "heroBg": "assets/images/brand/hero-bg.webp",
        "visitingCard": "assets/images/brand/visiting-card.webp",
        "pad": "assets/images/brand/pad.webp"
    },
    "social": {
        "facebook": "https://facebook.com",
        "youtube": "https://youtube.com",
        "linkedin": "https://www.linkedin.com/in/rezaul-karim-3a2714374?utm_source=share_via&utm_content=profile&utm_medium=member_android"
    },
    "admins": [
        {
            "id": "adm-1",
            "username": "admin",
            "password": "Rezaul9270",
            "name": "Rezaul Karim",
            "role": "superadmin"
        },
        {
            "id": "adm-2",
            "username": "amirul",
            "password": "Amirul2026",
            "name": "MD. Amirul Islam",
            "role": "admin"
        },
        {
            "id": "adm-3",
            "username": "helal",
            "password": "Helal2026",
            "name": "Md. Helal Miah",
            "role": "manager"
        }
    ]
}

with open(os.path.join(data_dir, "site.json"), "w", encoding="utf-8") as f:
    json.dump(site_info, f, ensure_ascii=False, indent=2)

print("data/site.json saved!")
print("ALL DATA BUILD FINISHED SUCCESSFULLY!")
