INSERT OR IGNORE INTO config (key,value) VALUES
 ('newbie_slots_remaining','15'),
 ('seasoned_slots_remaining','35'),
 ('countdown_ends_at',''),            -- ISO date, e.g. 2027-01-31T23:59:59+08:00
 ('crisis_resources','[]');           -- JSON list of {name, contact}; VERIFY numbers before launch

INSERT OR IGNORE INTO groups (id,slug,name,description,kind,anonymous_posts) VALUES
 ('g-luzon','luzon-vas','#luzon-vas','VAs across Luzon','hub',0),
 ('g-visayas','visayas-vas','#visayas-vas','VAs across the Visayas','hub',0),
 ('g-mindanao','mindanao-vas','#mindanao-vas','VAs across Mindanao','hub',0),
 ('g-baguio','baguio-vas','#baguio-vas','Baguio VAs','hub',0),
 ('g-manila','manila-vas','#manila-vas','Metro Manila VAs','hub',0),
 ('g-cebu','cebu-vas','#cebu-vas','Cebu VAs','hub',0),
 ('g-davao','davao-vas','#davao-vas','Davao VAs','hub',0),
 ('g-vent','vent-room','The Vent Room','A soft place to let it out. Anonymous, kind replies only.','sanctuary',1),
 ('g-night','night-shift-lounge','Night Shift Lounge','For everyone awake while the world sleeps.','sanctuary',0);

INSERT OR IGNORE INTO badges (id,label,description) VALUES
 ('verified','Verified VA','Passed identity verification'),
 ('founder','Founding Member','One of the 50 founders');
